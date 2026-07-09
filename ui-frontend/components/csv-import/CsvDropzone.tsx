'use client';

import React, { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_BYTES,
  SAMPLE_CSV_CONTENT,
} from '@/lib/constants';
import { TEMPLATES } from '@/lib/templates';
import { Upload, Info, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CsvDropzoneProps {
  onFileAccepted: (file: File) => void;
  error?: string | null;
  onErrorClear?: () => void;
}

export default function CsvDropzone({
  onFileAccepted,
  error,
  onErrorClear,
}: CsvDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (onErrorClear) onErrorClear();

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorCode = rejection.errors[0]?.code;
        if (errorCode === 'file-too-large') {
          onFileAccepted(null as unknown as File); // won't be used, just trigger error
          return;
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Double-check size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          return;
        }

        onFileAccepted(file);
      }
    },
    [onFileAccepted, onErrorClear]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles: 1,
    multiple: false,
  });

  const handleDownloadTemplate = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'border-2 border-dashed rounded-xl p-8 cursor-pointer',
          'transition-colors duration-200',
          isDragActive && !isDragReject
            ? 'border-ge-green bg-ge-green-light/50'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-white hover:border-ge-green/50 hover:bg-ge-green-light/20'
        )}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-4',
            isDragActive ? 'bg-ge-green/10' : 'bg-ge-bg'
          )}
        >
          <Upload
            className={cn(
              'h-6 w-6',
              isDragActive ? 'text-ge-green' : 'text-ge-text-muted'
            )}
          />
        </div>

        {/* Text */}
        <p className="text-sm font-medium text-ge-text mb-1">
          {isDragActive ? 'Release to upload' : 'Drop your CSV file here'}
        </p>
        <p className="text-xs text-ge-text-muted mb-4">or click to browse files</p>

        {/* Supported file message */}
        <div className="flex items-center gap-1.5 text-ge-text-muted">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[11px]">
            Supported file: .csv (max {formatFileSize(MAX_FILE_SIZE_BYTES)})
          </span>
        </div>
      </div>

      {/* Required headers note */}
      <p className="text-[11px] text-ge-text-muted text-center leading-relaxed px-2">
        Note: You can upload CSVs of any format (such as exports from Facebook or Google Ads). The backend AI will dynamically map and normalize columns to the GrowEasy CRM fields.
      </p>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Template Download Section */}
      <div className="border-t border-ge-border-light pt-4 mt-2">
        <div className="text-center text-[10px] font-bold text-ge-text-muted mb-3 uppercase tracking-wider">
          Download Sample Export Templates (50 rows)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadTemplate(tpl.csvContent, tpl.filename);
              }}
              className="flex items-center justify-between p-3 rounded-lg border border-ge-border bg-white text-left hover:border-ge-green/30 hover:bg-ge-green-light/10 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="h-4.5 w-4.5 text-ge-green shrink-0 group-hover:scale-105 transition-transform" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-ge-text truncate">
                    {tpl.name}
                  </p>
                  <p className="text-[9px] text-ge-text-muted truncate">
                    {tpl.filename}
                  </p>
                </div>
              </div>
              <Download className="h-3.5 w-3.5 text-ge-text-muted group-hover:text-ge-green shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
