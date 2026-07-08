'use client';

import React, { useState } from 'react';
import type { SkippedRecord } from '@/types/crm';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';

interface SkippedRecordsSectionProps {
  records: SkippedRecord[];
}

export default function SkippedRecordsSection({
  records,
}: SkippedRecordsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!records || records.length === 0) return null;

  return (
    <div className="mt-5 border border-amber-200 rounded-xl overflow-hidden bg-amber-50/5">
      {/* Accordion header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-amber-50/10 border-b border-amber-100 text-left hover:bg-amber-50/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
          <span className="text-xs font-semibold text-amber-800">
            SKIPPED RECORDS ({records.length} {records.length === 1 ? 'row' : 'rows'})
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-amber-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-amber-600" />
        )}
      </button>

      {/* Accordion body */}
      {isOpen && (
        <div className="divide-y divide-amber-100 max-h-[200px] overflow-y-auto">
          {records.map((item, idx) => (
            <div key={idx} className="p-3.5 text-xs flex flex-col md:flex-row gap-3 items-start hover:bg-amber-50/10">
              {/* Skip Reason */}
              <div className="md:w-1/3 shrink-0">
                <span className="font-semibold text-amber-900 block mb-0.5">Reason</span>
                <span className="text-amber-800 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded text-[10px] inline-block font-medium">
                  {item.reason}
                </span>
              </div>
              
              {/* Original Raw Record */}
              <div className="flex-1 min-w-0 w-full">
                <span className="font-semibold text-ge-text-secondary block mb-1">Original Record Data</span>
                <div className="bg-white border border-ge-border rounded-lg p-2 overflow-x-auto max-h-[100px]">
                  <pre className="text-[10px] text-ge-text-secondary leading-relaxed font-mono whitespace-pre-wrap">
                    {JSON.stringify(item.originalRecord, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
