'use client';

import React from 'react';
import type { CsvRecord } from '@/types/csv';

interface CsvPreviewTableProps {
  headers: string[];
  records: CsvRecord[];
  className?: string;
}

export default function CsvPreviewTable({
  headers,
  records,
  className,
}: CsvPreviewTableProps) {
  if (!headers || headers.length === 0) return null;

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-xs font-semibold text-ge-text-secondary uppercase tracking-wider px-1">
        CSV PREVIEW ({records.length} {records.length === 1 ? 'row' : 'rows'})
      </div>
      <div
        className="w-full overflow-auto max-h-[250px] border border-ge-border rounded-xl"
        style={{ contentVisibility: 'auto' }}
      >
        <table className="w-full border-separate border-spacing-0 text-left text-xs">
          <thead>
            <tr className="bg-ge-bg">
              {headers.map((header, idx) => (
                <th
                  key={`${header}-${idx}`}
                  className="sticky top-0 z-10 px-4 py-3 bg-ge-bg border-b border-r last:border-r-0 border-ge-border font-semibold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-ge-bg/30 transition-colors"
              >
                {headers.map((header, colIndex) => {
                  const val = record[header];
                  const displayValue = val !== null && val !== undefined ? String(val) : '—';
                  return (
                    <td
                      key={`${rowIndex}-${header}-${colIndex}`}
                      className="px-4 py-2.5 border-b border-r last:border-r-0 border-ge-border-light whitespace-nowrap max-w-[200px] truncate text-ge-text-secondary"
                      title={displayValue}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
