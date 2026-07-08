'use client';

import React from 'react';
import type { CRMRecord } from '@/types/crm';
import { CRM_FIELDS, CRM_FIELD_LABELS } from '@/lib/constants';
import { formatDisplayDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface ParsedResultTableProps {
  records: CRMRecord[];
}

export default function ParsedResultTable({ records }: ParsedResultTableProps) {
  if (!records || records.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-ge-text-muted">
        No records imported.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="text-xs font-semibold text-ge-text-secondary uppercase tracking-wider px-1">
        IMPORTED LEADS ({records.length} {records.length === 1 ? 'lead' : 'leads'})
      </div>
      <div
        className="w-full overflow-auto max-h-[300px] border border-ge-border rounded-xl"
        style={{ contentVisibility: 'auto' }}
      >
        <table className="w-full border-separate border-spacing-0 text-left text-xs">
          <thead>
            <tr className="bg-ge-bg">
              {CRM_FIELDS.map((field) => (
                <th
                  key={field}
                  className="sticky top-0 z-10 px-4 py-3 bg-ge-bg border-b border-r last:border-r-0 border-ge-border font-semibold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap select-none"
                >
                  {CRM_FIELD_LABELS[field] || field}
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
                {CRM_FIELDS.map((field) => {
                  const val = record[field];

                  // Format cells conditionally based on field type
                  let cellContent: React.ReactNode = '—';
                  let titleAttr = '';

                  if (field === 'created_at') {
                    cellContent = formatDisplayDate(val);
                    titleAttr = cellContent as string;
                  } else if (field === 'crm_status') {
                    cellContent = <Badge status={val as any} />;
                    titleAttr = val || '';
                  } else if (field === 'data_source') {
                    cellContent = val || '—';
                    titleAttr = val || '—';
                  } else if (val !== null && val !== undefined && val !== '') {
                    cellContent = String(val);
                    titleAttr = String(val);
                  }

                  return (
                    <td
                      key={`${rowIndex}-${field}`}
                      className="px-4 py-2.5 border-b border-r last:border-r-0 border-ge-border-light whitespace-nowrap max-w-[220px] truncate text-ge-text-secondary"
                      title={titleAttr}
                    >
                      {cellContent}
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
