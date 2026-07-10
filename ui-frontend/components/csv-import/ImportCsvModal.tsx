'use client';

import React, { useState, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import CsvDropzone from './CsvDropzone';
import CsvPreviewTable from './CsvPreviewTable';
import LoadingState from './LoadingState';
import ImportSummary from './ImportSummary';
import ParsedResultTable from './ParsedResultTable';
import SkippedRecordsSection from './SkippedRecordsSection';
import { formatFileSize } from '@/lib/utils';
import { uploadCsvForPreview, confirmCsvImport } from '@/lib/api';
import { FileSpreadsheet, X as XIcon, AlertCircle, RotateCcw, Upload } from 'lucide-react';
import type { CsvPreviewResponse, CsvRecord } from '@/types/csv';
import type { ImportResultResponse } from '@/types/crm';
import useWebSocket from '@/lib/hooks/useWebSocket';

type ImportStep = 'upload' | 'preview' | 'processing' | 'result' | 'error';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportCsvModal({ isOpen, onClose }: ImportCsvModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CsvPreviewResponse | null>(null);
  const [resultData, setResultData] = useState<ImportResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<{
    percentage: number;
    currentBatch: number;
    totalBatches: number;
    importedCount: number;
    skippedCount: number;
  } | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
  const wsUrl = apiBaseUrl.replace(/^http/, 'ws');

  const { sendMessage } = useWebSocket(wsUrl, {
    shouldConnect: step === 'processing' && !!jobId,
    onOpen: () => {
      if (jobId) {
        sendMessage({ type: 'subscribe', jobId });
      }
    },
    onMessage: (message) => {
      const { event, data, result, error: jobError } = message;
      if (event === 'progress' && data) {
        setProgressData(data);
      } else if (event === 'completed' && result) {
        setResultData(result);
        setStep('result');
        setJobId(null);
        setProgressData(null);
      } else if (event === 'failed') {
        setError(jobError || 'Background processing failed.');
        setStep('error');
        setJobId(null);
        setProgressData(null);
      }
    },
    onError: () => {
      setError('Connection to real-time update server lost.');
      setStep('error');
      setJobId(null);
      setProgressData(null);
    }
  });

  // Reset all state when modal closes
  const handleClose = useCallback(() => {
    if (step === 'processing') return; // prevent close during processing
    setStep('upload');
    setSelectedFile(null);
    setPreviewData(null);
    setResultData(null);
    setError(null);
    setIsUploading(false);
    setJobId(null);
    setProgressData(null);
    onClose();
  }, [step, onClose]);

  // Handle file selection from dropzone
  const handleFileAccepted = useCallback(async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setIsUploading(true);

    try {
      const data = await uploadCsvForPreview(file);
      setPreviewData(data);
      setStep('preview');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file.';
      setError(message);
      setStep('upload');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewData(null);
    setError(null);
    setJobId(null);
    setProgressData(null);
    setStep('upload');
  }, []);

  // Handle confirm import
  const handleConfirmImport = useCallback(async () => {
    if (!previewData?.records) return;

    setStep('processing');
    setError(null);
    setProgressData(null);

    try {
      const response = await confirmCsvImport(previewData.records as CsvRecord[]);
      if (response.success && response.jobId) {
        setJobId(response.jobId);
      } else {
        throw new Error(response.message || 'Failed to start import job.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Import failed.';
      setError(message);
      setStep('error');
    }
  }, [previewData]);

  // Handle retry from error state
  const handleRetry = useCallback(() => {
    if (previewData) {
      setStep('preview');
      setError(null);
    } else {
      handleRemoveFile();
    }
  }, [previewData, handleRemoveFile]);

  // Dynamic footer buttons based on step
  const renderFooter = () => {
    switch (step) {
      case 'upload':
        return (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={!selectedFile || isUploading} isLoading={isUploading}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload File
            </Button>
          </>
        );
      case 'preview':
        return (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport}>
              Confirm Import
            </Button>
          </>
        );
      case 'processing':
        return null; // no buttons during processing
      case 'result':
        return (
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        );
      case 'error':
        return (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Retry
            </Button>
            <Button onClick={handleRemoveFile}>
              Upload New File
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Leads via CSV"
      subtitle="Upload a CSV file to bulk import leads into your system."
      preventClose={step === 'processing'}
      footer={renderFooter()}
    >
      {/* Upload step */}
      {step === 'upload' && (
        <div>
          {/* Show file info if uploading */}
          {selectedFile && isUploading && (
            <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-ge-bg border border-ge-border-light">
              <FileSpreadsheet className="h-8 w-8 text-ge-green shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ge-text truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-ge-text-muted">
                  {formatFileSize(selectedFile.size)} — Uploading...
                </p>
              </div>
            </div>
          )}

          <CsvDropzone
            onFileAccepted={handleFileAccepted}
            error={error}
            onErrorClear={() => setError(null)}
          />
        </div>
      )}

      {/* Preview step */}
      {step === 'preview' && previewData && (
        <div>
          {/* File info bar */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-ge-bg border border-ge-border-light">
              <FileSpreadsheet className="h-8 w-8 text-ge-green shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ge-text truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-ge-text-muted">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-1 rounded hover:bg-gray-200 text-ge-text-muted hover:text-ge-text"
                aria-label="Remove file"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Preview table */}
          <CsvPreviewTable
            headers={previewData.headers}
            records={previewData.previewRows}
          />

          <p className="mt-3 text-xs text-ge-text-muted text-center">
            Showing {previewData.previewRows.length} of {previewData.totalRows} rows.
            Click &quot;Confirm Import&quot; to process all {previewData.totalRows} rows with AI.
          </p>
        </div>
      )}

      {/* Processing step */}
      {step === 'processing' && (
        <LoadingState 
          percentage={progressData?.percentage}
          currentBatch={progressData?.currentBatch}
          totalBatches={progressData?.totalBatches}
          importedCount={progressData?.importedCount}
          skippedCount={progressData?.skippedCount}
        />
      )}

      {/* Result step */}
      {step === 'result' && resultData && (
        <div className="flex flex-col">
          <ImportSummary
            totalRows={previewData?.totalRows || 0}
            totalImported={resultData.totalImported}
            totalSkipped={resultData.totalSkipped}
          />
          <ParsedResultTable records={resultData.importedRecords} />
          <SkippedRecordsSection records={resultData.skippedRecords} />
        </div>
      )}

      {/* Error step */}
      {step === 'error' && (
        <div className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-ge-text mb-1">
              Import Failed
            </h3>
            <p className="text-sm text-red-600 max-w-sm">{error}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
