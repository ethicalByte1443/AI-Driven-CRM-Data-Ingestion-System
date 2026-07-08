'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Prevent closing (e.g. during processing) */
  preventClose?: boolean;
  /** Footer content (buttons) */
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  preventClose = false,
  footer,
}: ModalProps) {
  const handleClose = useCallback(() => {
    if (!preventClose) {
      onClose();
    }
  }, [onClose, preventClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-2xl mx-4',
          'bg-white rounded-2xl shadow-xl',
          'flex flex-col max-h-[90vh]',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-ge-border-light">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-ge-text">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-ge-text-secondary">{subtitle}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={preventClose}
            aria-label="Close modal"
            className={cn(
              'p-1.5 rounded-lg hover:bg-gray-100 text-ge-text-muted hover:text-ge-text',
              'focus:outline-none focus:ring-2 focus:ring-ge-green/30',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ge-border-light">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
