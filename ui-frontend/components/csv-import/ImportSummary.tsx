'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Database, FileCheck, FileWarning } from 'lucide-react';

interface ImportSummaryProps {
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
}

export default function ImportSummary({
  totalRows,
  totalImported,
  totalSkipped,
}: ImportSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-5">
      {/* Total rows parsed */}
      <Card padding={false} className="p-4 flex items-center gap-3 bg-ge-bg/30">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center border border-ge-border-light text-ge-text-secondary shrink-0">
          <Database className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-ge-text-muted">
            Total Rows
          </p>
          <p className="text-base font-bold text-ge-text leading-tight mt-0.5">
            {totalRows}
          </p>
        </div>
      </Card>

      {/* Successfully imported */}
      <Card padding={false} className="p-4 flex items-center gap-3 bg-emerald-50/20 border-emerald-100">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600 shrink-0">
          <FileCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-emerald-600">
            Imported
          </p>
          <p className="text-base font-bold text-emerald-700 leading-tight mt-0.5">
            {totalImported}
          </p>
        </div>
      </Card>

      {/* Skipped records */}
      <Card padding={false} className="p-4 flex items-center gap-3 bg-amber-50/20 border-amber-100">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600 shrink-0">
          <FileWarning className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-amber-600">
            Skipped
          </p>
          <p className="text-base font-bold text-amber-700 leading-tight mt-0.5">
            {totalSkipped}
          </p>
        </div>
      </Card>
    </div>
  );
}
