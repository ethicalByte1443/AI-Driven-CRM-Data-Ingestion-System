'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ImportCsvModal from '@/components/csv-import/ImportCsvModal';
import { Cable, Search, Wifi, WifiOff, PhoneCall, MessageCircle, FileUp } from 'lucide-react';

const leadSources = [
  {
    name: 'Google Lead',
    description: 'Capture leads from Google Ads lead form extensions.',
    icon: Search,
    connected: false,
    status: 'Not Connected',
    statusSub: 'Inactive',
  },
  {
    name: 'Google Ads',
    description: 'Sync leads from Google Ads campaigns directly.',
    icon: Search,
    connected: false,
    status: 'Not Connected',
    statusSub: 'Inactive',
  },
  {
    name: 'WhatsApp',
    description: 'Receive leads via WhatsApp Business API.',
    icon: MessageCircle,
    connected: false,
    status: 'Not Connected',
    statusSub: 'Inactive',
  },
  {
    name: 'Telephony',
    description: 'Capture leads from inbound and outbound calls.',
    icon: PhoneCall,
    connected: false,
    status: 'Not Connected',
    statusSub: 'Inactive',
  },
];

export default function LeadSourcesPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cable className="h-5 w-5 text-ge-green" />
            <h1 className="text-xl font-semibold text-ge-text">Lead Sources</h1>
          </div>
          <p className="text-sm text-ge-text-secondary">
            Connect, manage, and control all your lead channels from one dashboard.
          </p>
        </div>

        {/* Import CSV trigger */}
        <Button onClick={() => setIsImportModalOpen(true)}>
          <FileUp className="h-4 w-4 mr-1.5" />
          Import Leads via CSV
        </Button>
      </div>

      {/* Lead source cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {leadSources.map((source) => {
          const Icon = source.icon;
          return (
            <Card key={source.name} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-ge-bg flex items-center justify-center border border-ge-border-light">
                    <Icon className="h-5 w-5 text-ge-text-secondary" />
                  </div>
                  <h3 className="text-sm font-semibold text-ge-text">{source.name}</h3>
                </div>
                <p className="text-xs text-ge-text-muted mb-4 leading-relaxed">
                  {source.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-ge-border-light">
                <div className="flex items-center gap-1.5">
                  <WifiOff className="h-3.5 w-3.5 text-ge-text-muted" />
                  <div>
                    <p className="text-xs font-medium text-ge-text-secondary">{source.status}</p>
                    <p className="text-[10px] text-ge-text-muted">{source.statusSub}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  <Wifi className="h-3.5 w-3.5 mr-1.5" />
                  Connect
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CSV Import Modal */}
      <ImportCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
