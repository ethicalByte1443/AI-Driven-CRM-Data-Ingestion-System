import React from 'react';
import { cn } from '@/lib/utils';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-ge-bg flex items-center justify-center mb-4">
        {icon || <FileX className="h-6 w-6 text-ge-text-muted" />}
      </div>
      <h3 className="text-sm font-semibold text-ge-text mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-ge-text-secondary max-w-xs">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
