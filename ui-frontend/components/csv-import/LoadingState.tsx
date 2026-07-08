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
}

export default function LoadingState({ className }: LoadingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {/* Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-ge-green-light flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-ge-green animate-spin" />
        </div>
      </div>

      {/* Main message */}
      <h3 className="text-base font-semibold text-ge-text mb-2">
        Processing your CSV with AI...
      </h3>
      <p className="text-sm text-ge-text-secondary mb-6 max-w-sm">
        Please wait while we map your leads into GrowEasy CRM format.
      </p>

      {/* Rotating progress message */}
      <div className="h-5 flex items-center">
        <p
          key={messageIndex}
          className="text-xs text-ge-green font-medium animate-pulse"
        >
          {PROGRESS_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
}
