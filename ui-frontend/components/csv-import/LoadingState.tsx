'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const PROGRESS_MESSAGES = [
  'Parsing records...',
  'Mapping fields...',
  'Validating email and mobile numbers...',
  'Preparing imported leads...',
];

interface LoadingStateProps {
  className?: string;
  percentage?: number;
  currentBatch?: number;
  totalBatches?: number;
  importedCount?: number;
  skippedCount?: number;
}

export default function LoadingState({
  className,
  percentage,
  currentBatch,
  totalBatches,
  importedCount = 0,
  skippedCount = 0,
}: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Only rotate messages when not using the real-time progress bar
    if (percentage !== undefined) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [percentage]);

  const hasProgress = percentage !== undefined;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center w-full',
        className
      )}
    >
      {/* Spinner / Progress Ring */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-ge-green-light flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-ge-green animate-spin" />
        </div>
        {hasProgress && (
          <div className="absolute -bottom-2 bg-ge-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            {percentage}%
          </div>
        )}
      </div>

      {/* Main message */}
      <h3 className="text-base font-semibold text-ge-text mb-2">
        {hasProgress ? 'Processing Leads...' : 'Processing your CSV with AI...'}
      </h3>
      <p className="text-sm text-ge-text-secondary mb-6 max-w-sm">
        {hasProgress 
          ? `Running AI pipeline to map, parse, and validate leads.` 
          : 'Please wait while we map your leads into GrowEasy CRM format.'}
      </p>

      {/* Progress Bar and Statistics */}
      {hasProgress ? (
        <div className="w-full max-w-md bg-white border border-ge-border p-4 rounded-xl shadow-xs">
          <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-ge-text">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-ge-green transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-ge-border-light pt-3">
            <div>
              <p className="text-ge-text-secondary font-medium">Batch</p>
              <p className="text-sm font-semibold text-ge-text mt-0.5">
                {currentBatch} / {totalBatches}
              </p>
            </div>
            <div>
              <p className="text-ge-green font-medium">Imported</p>
              <p className="text-sm font-semibold text-ge-green mt-0.5">
                {importedCount}
              </p>
            </div>
            <div>
              <p className="text-ge-coral font-medium">Skipped</p>
              <p className="text-sm font-semibold text-ge-coral mt-0.5">
                {skippedCount}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Rotating progress message */
        <div className="h-5 flex items-center">
          <p
            key={messageIndex}
            className="text-xs text-ge-green font-medium animate-pulse"
          >
            {PROGRESS_MESSAGES[messageIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
