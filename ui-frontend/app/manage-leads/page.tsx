'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { 
  Users, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  Sparkles, 
  Mail, 
  Check, 
  Loader2, 
  X, 
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  fetchLeads, 
  triggerAutoEngage, 
  approveDraft, 
  triggerBulkAutoEngage 
} from '@/lib/api';
import type { ExtendedCRMRecord } from '@/types/crm';

export default function ManageLeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState<ExtendedCRMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states for checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Loading status per lead during engagement triggering
  const [engagingLeadId, setEngagingLeadId] = useState<string | null>(null);
  const [bulkEngaging, setBulkEngaging] = useState(false);

  // Drawer review states
  const [selectedLead, setSelectedLead] = useState<ExtendedCRMRecord | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

  // Load leads from backend
  const loadLeadsData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError(null);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeadsData();
  }, [loadLeadsData]);

  // Handle single auto-engage trigger
  const handleAutoEngage = async (leadId: string) => {
    setEngagingLeadId(leadId);
    try {
      const response = await triggerAutoEngage(leadId);
      if (response.success) {
        // Update local list
        setLeads(prev => prev.map(l => l.id === leadId ? response.lead : l));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Engagement failed');
      // Refresh list to sync state
      loadLeadsData(false);
    } finally {
      setEngagingLeadId(null);
    }
  };

  // Handle bulk auto-engage trigger
  const handleBulkEngage = async () => {
    if (selectedIds.length === 0) return;
    setBulkEngaging(true);
    try {
      const response = await triggerBulkAutoEngage(selectedIds);
      alert(response.message);
      
      // Optimistically update local UI states to 'generating'
      setLeads(prev => prev.map(l => 
        selectedIds.includes(l.id) 
          ? { ...l, engagementStatus: 'generating' as const } 
          : l
      ));
      setSelectedIds([]);
      
      // Periodically refresh list to poll background task results
      setTimeout(() => {
        loadLeadsData(false);
      }, 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bulk engagement failed');
    } finally {
      setBulkEngaging(false);
    }
  };

  // Open draft preview drawer
  const handleReviewDraft = (lead: ExtendedCRMRecord) => {
    setSelectedLead(lead);
    setSubject(lead.emailSubject || '');
    setBody(lead.emailDraft || '');
  };

  // Handle draft approval
  const handleApproveDraft = async () => {
    if (!selectedLead) return;
    setSavingDraft(true);
    try {
      const response = await approveDraft(selectedLead.id, subject, body);
      if (response.success) {
        // Update local list
        setLeads(prev => prev.map(l => l.id === selectedLead.id ? response.lead : l));
        setSelectedLead(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve draft');
    } finally {
      setSavingDraft(false);
    }
  };

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredLeads.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.mobile_without_country_code.includes(searchTerm) ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper to format date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return isoString;
    }
  };

  // Custom engagement status pill
  const getEngagementPill = (lead: ExtendedCRMRecord) => {
    switch (lead.engagementStatus) {
      case 'not_engaged':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border bg-gray-50 border-gray-200 text-gray-500">
            Not Engaged
          </span>
        );
      case 'generating':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-amber-50 border-amber-200 text-amber-600 animate-pulse">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Generating...
          </span>
        );
      case 'draft_ready':
        return (
          <button 
            onClick={() => handleReviewDraft(lead)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
            Draft Ready
          </button>
        );
      case 'failed':
        return (
          <span 
            title={lead.engagementError || 'Agent failed QA checklist'}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-rose-50 border-rose-200 text-rose-600 cursor-help"
          >
            <AlertCircle className="h-2.5 w-2.5 text-rose-500" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen pb-16">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-ge-green" />
          <h1 className="text-xl font-semibold text-ge-text">Manage Your Leads</h1>
        </div>
        <p className="text-sm text-ge-text-secondary">
          Monitor lead status, run automated AI responders, and review drafted onboarding emails.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-ge-text">
            Leads Database ({filteredLeads.length})
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-ge-text-secondary font-medium">
                {selectedIds.length} selected
              </span>
              <button 
                disabled={bulkEngaging}
                onClick={handleBulkEngage}
                className="inline-flex items-center gap-1 px-3 py-1 bg-ge-green hover:bg-ge-green-dark text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {bulkEngaging ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Auto-Engage
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ge-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs w-64 border border-ge-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ge-green/30 focus:border-ge-green"
            />
          </div>
          <button 
            onClick={() => loadLeadsData(false)}
            className="p-2 border border-ge-border bg-white rounded-lg hover:bg-gray-50 text-ge-text-secondary cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Leads Table Card */}
      <Card padding={false} className="overflow-hidden bg-white">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left text-xs">
            <thead>
              <tr className="bg-ge-bg">
                <th className="w-12 px-5 py-3.5 border-b border-ge-border">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-ge-green focus:ring-ge-green h-3.5 w-3.5 cursor-pointer"
                  />
                </th>
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
                  CRM Status
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  AI Engagement
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap">
                  Campaign Source
                </th>
                <th className="px-5 py-3.5 border-b border-ge-border font-bold text-ge-text-secondary uppercase tracking-wider whitespace-nowrap text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton loading rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-4"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-28"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-5 py-4 border-b border-ge-border-light"><div className="h-4 bg-gray-100 rounded w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-ge-bg/10 transition-colors last:border-b-0"
                  >
                    <td className="px-5 py-4 border-b border-ge-border-light">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(lead.id)}
                        onChange={() => handleSelectOne(lead.id)}
                        className="rounded border-gray-300 text-ge-green focus:ring-ge-green h-3.5 w-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light font-medium text-ge-text whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.email}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {lead.country_code ? `${lead.country_code} ` : ''}{lead.mobile_without_country_code}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap font-medium">
                      {lead.company || '—'}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light whitespace-nowrap">
                      <Badge status={lead.crm_status} />
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light whitespace-nowrap">
                      {getEngagementPill(lead)}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-ge-text-secondary whitespace-nowrap uppercase text-[10px]">
                      {lead.data_source || '—'}
                    </td>
                    <td className="px-5 py-4 border-b border-ge-border-light text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {lead.engagementStatus === 'draft_ready' ? (
                          <button 
                            onClick={() => handleReviewDraft(lead)}
                            className="p-1 text-ge-green hover:bg-ge-green-light rounded cursor-pointer"
                            title="Review Draft Onboarding Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            disabled={engagingLeadId === lead.id || lead.engagementStatus === 'generating'}
                            onClick={() => handleAutoEngage(lead.id)}
                            className="p-1 text-ge-text-secondary hover:text-ge-green hover:bg-gray-100 rounded disabled:opacity-50 cursor-pointer"
                            title="Generate AI Onboarding Email"
                          >
                            {engagingLeadId === lead.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-ge-green" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button 
                          onClick={() => handleReviewDraft(lead)}
                          disabled={!lead.emailDraft}
                          className="inline-flex items-center text-xs font-semibold text-ge-text-secondary hover:text-ge-text disabled:opacity-30 cursor-pointer"
                        >
                          More <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-ge-text-muted">
                    No leads found matching your search. Try importing some via CSV!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lead Engagement Review Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setSelectedLead(null)}
          />
          
          {/* Drawer Body */}
          <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-5 border-b border-ge-border flex items-center justify-between bg-ge-bg">
              <div>
                <h3 className="text-sm font-semibold text-ge-text flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-ge-green" />
                  Review Onboarding Email Draft
                </h3>
                <p className="text-[11px] text-ge-text-secondary mt-0.5">
                  Tailored specifically for <strong>{selectedLead.name}</strong> at <strong>{selectedLead.company || 'Individual'}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:bg-gray-200 text-ge-text-secondary hover:text-ge-text cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-[11px] text-amber-700 flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  This copy was generated by a multi-agent LangGraph workflow. It analyzed the lead source, role, and industry context to pass standard marketing compliance checks. Feel free to tweak before sending.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ge-text-secondary mb-1">
                  Recipient
                </label>
                <input
                  type="text"
                  disabled
                  value={`${selectedLead.name} <${selectedLead.email}>`}
                  className="w-full px-3 py-2 text-xs border border-ge-border rounded-lg bg-gray-50 text-ge-text-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ge-text-secondary mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full px-3 py-2 text-xs border border-ge-border rounded-lg bg-white text-ge-text focus:outline-none focus:ring-2 focus:ring-ge-green/30 focus:border-ge-green font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ge-text-secondary mb-1">
                  Email Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Draft onboarding email content here..."
                  rows={14}
                  className="w-full px-3 py-2.5 text-xs border border-ge-border rounded-lg bg-white text-ge-text focus:outline-none focus:ring-2 focus:ring-ge-green/30 focus:border-ge-green font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-ge-border bg-ge-bg flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-ge-border rounded-lg text-xs font-semibold bg-white text-ge-text-secondary hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveDraft}
                disabled={savingDraft || !subject || !body}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-ge-green hover:bg-ge-green-dark text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {savingDraft ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Approve & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
