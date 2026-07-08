'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Users, Search, RefreshCw, ChevronRight } from 'lucide-react';
import type { CrmStatus } from '@/types/crm';

interface DemoLead {
  name: string;
  email: string;
  contact: string;
  dateCreated: string;
  company: string;
  status: CrmStatus;
  quality: string;
  owner: string;
}

const initialLeads: DemoLead[] = [
  {
    name: 'punnnf g',
    email: 'kjgkhv2@gcghc.com',
    contact: '+917894561177',
    dateCreated: 'Jun 23, 2026, 2:37 PM',
    company: '',
    status: 'SALE_DONE',
    quality: '—',
    owner: 'P',
  },
  {
    name: 'kjkvkh',
    email: 'jkhbkbn@hjf.hfv',
    contact: '+911212121415',
    dateCreated: 'Jun 23, 2026, 12:23 PM',
    company: 'fhtf',
    status: 'DID_NOT_CONNECT',
    quality: '—',
    owner: 'A',
  },
  {
    name: 'kugkkh',
    email: 'ljgbjg@hgdh.hjc',
    contact: '+911212121217',
    dateCreated: 'Jun 23, 2026, 12:17 PM',
    company: 'fhtf',
    status: 'DID_NOT_CONNECT',
    quality: '—',
    owner: 'P',
  },
  {
    name: 'hjvjv',
    email: 'jfgf@fgd.com',
    contact: '+911515151515',
    dateCreated: 'Jun 23, 2026, 12:16 PM',
    company: 'fhtf',
    status: 'GOOD_LEAD_FOLLOW_UP',
    quality: '—',
    owner: 'A',
  },
  {
    name: 'Abhraneel Dhar',
    email: 'abhraneeldhar7@groweasy.ai',
    contact: '+919051589728',
    dateCreated: 'Jun 23, 2026, 11:01 AM',
    company: 'groweasy',
    status: 'GOOD_LEAD_FOLLOW_UP',
    quality: '—',
    owner: 'A',
  },
  {
    name: 'fhjf ghf',
    email: 'tjrf.ft@gfjj.com',
    contact: '+911414141414',
    dateCreated: 'Jun 22, 2026, 4:49 PM',
    company: 'thr rh',
    status: 'DID_NOT_CONNECT',
    quality: '—',
    owner: '7',
  },
  {
    name: 'fhf',
    email: 'gnhfg@fglf.com',
    contact: '+911313131313',
    dateCreated: 'Jun 22, 2026, 4:48 PM',
    company: 'fhtf',
    status: 'DID_NOT_CONNECT',
    quality: '—',
    owner: 'A',
  },
  {
    name: 'Abc 1',
    email: 'abc1@kryf.com',
    contact: '+911212121212',
    dateCreated: 'Jun 22, 2026, 4:44 PM',
    company: '',
    status: 'DID_NOT_CONNECT',
    quality: '—',
    owner: 'A',
  },
];

export default function ManageLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<DemoLead[]>(initialLeads);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact.includes(searchTerm) ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-ge-green" />
          <h1 className="text-xl font-semibold text-ge-text">Manage Your Leads</h1>
        </div>
        <p className="text-sm text-ge-text-secondary">
          Monitor lead status, assign tasks, and close deals faster.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="text-sm font-semibold text-ge-text">
          Your Leads
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ge-text-muted" />
            <input
              type="text"
              placeholder="Enter email or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs w-64 border border-ge-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ge-green/30 focus:border-ge-green"
            />
          </div>
          <button className="p-2 border border-ge-border bg-white rounded-lg hover:bg-gray-50 text-ge-text-secondary">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Leads Table Card */}
      <Card padding={false} className="overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-xs">
            <thead>
              <tr className="bg-ge-bg">
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Lead Name
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Contact
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Date Created
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Company
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Quality
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Lead Owner
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-ge-bg/20 transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-4 border-b border-ge-border-light font-medium text-ge-text whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.email}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.contact}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.dateCreated}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.company || '—'}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light whitespace-nowrap">
                      <Badge status={lead.status} />
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.quality}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.owner}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-center whitespace-nowrap">
                      <button className="inline-flex items-center text-xs font-semibold text-ge-text-secondary hover:text-ge-text">
                        More <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-ge-text-muted">
                    No leads found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more button */}
        <div className="p-4 flex justify-center border-t border-ge-border-light bg-white">
          <button className="px-5 py-2 border border-ge-border hover:bg-gray-50 rounded-full text-xs font-semibold text-ge-text-secondary hover:text-ge-text shadow-sm">
            Load more
          </button>
        </div>
      </Card>
    </div>
  );
}
