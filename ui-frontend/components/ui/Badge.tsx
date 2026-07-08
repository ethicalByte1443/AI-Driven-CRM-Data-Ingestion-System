import React from 'react';
import { cn } from '@/lib/utils';
import type { CrmStatus } from '@/types/crm';
import { STATUS_BADGE_STYLES } from '@/lib/constants';

interface BadgeProps {
  status: CrmStatus;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const style = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES[''];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
        style.bg,
        style.text,
        className
      )}
    >
      {style.label}
    </span>
  );
}
