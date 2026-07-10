import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ExtendedCRMRecord, CRMRecord } from '../types/crm.types';

const LEADS_FILE = path.join(process.cwd(), 'leads.json');

// Seed mock leads
const seedLeads: ExtendedCRMRecord[] = [
  {
    id: 'lead-1',
    name: 'punnnf g',
    email: 'kjgkhv2@gcghc.com',
    country_code: '+91',
    mobile_without_country_code: '7894561177',
    created_at: '2026-06-23T14:37:00.000Z',
    company: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lead_owner: 'P',
    crm_status: 'SALE_DONE',
    crm_note: 'Imported via CSV',
    data_source: 'leads_on_demand',
    possession_time: '',
    description: 'Seed Lead',
    engagementStatus: 'not_engaged',
  },
  {
    id: 'lead-2',
    name: 'kjkvkh',
    email: 'jkhbkbn@hjf.hfv',
    country_code: '+91',
    mobile_without_country_code: '1212121415',
    created_at: '2026-06-23T12:23:00.000Z',
    company: 'fhtf',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    lead_owner: 'A',
    crm_status: 'DID_NOT_CONNECT',
    crm_note: 'No response',
    data_source: 'sarjapur_plots',
    possession_time: '',
    description: 'Seed Lead',
    engagementStatus: 'not_engaged',
  },
  {
    id: 'lead-3',
    name: 'Abhraneel Dhar',
    email: 'abhraneeldhar7@groweasy.ai',
    country_code: '+91',
    mobile_without_country_code: '9051589728',
    created_at: '2026-06-23T11:01:00.000Z',
    company: 'groweasy',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    lead_owner: 'A',
    crm_status: 'GOOD_LEAD_FOLLOW_UP',
    crm_note: 'Highly interested in automated CRM solutions.',
    data_source: 'eden_park',
    possession_time: '',
    description: 'Active lead pursuing product demo.',
    engagementStatus: 'not_engaged',
  }
];

let leadsCache: ExtendedCRMRecord[] = [];

export function loadLeads(): ExtendedCRMRecord[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf8');
      leadsCache = JSON.parse(data);
    } else {
      leadsCache = [...seedLeads];
      saveLeads();
    }
  } catch (err) {
    console.error('[LeadStore] Failed to load leads:', err);
    leadsCache = [...seedLeads];
  }
  return leadsCache;
}

export function saveLeads(): void {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leadsCache, null, 2), 'utf8');
  } catch (err) {
    console.error('[LeadStore] Failed to save leads:', err);
  }
}

export function getLeads(): ExtendedCRMRecord[] {
  if (leadsCache.length === 0) {
    loadLeads();
  }
  return leadsCache;
}

export function addLeads(newRecords: CRMRecord[]): ExtendedCRMRecord[] {
  const added: ExtendedCRMRecord[] = newRecords.map(record => ({
    ...record,
    id: crypto.randomUUID(),
    engagementStatus: 'not_engaged',
    emailDraft: null,
    emailSubject: null,
    engagementError: null
  }));

  leadsCache = [...added, ...leadsCache]; // Prepend new leads
  saveLeads();
  return added;
}

export function updateLead(id: string, updates: Partial<ExtendedCRMRecord>): ExtendedCRMRecord | null {
  const leadIndex = leadsCache.findIndex(l => l.id === id);
  if (leadIndex === -1) return null;

  leadsCache[leadIndex] = {
    ...leadsCache[leadIndex],
    ...updates
  };

  saveLeads();
  return leadsCache[leadIndex];
}

export function getLeadById(id: string): ExtendedCRMRecord | null {
  return leadsCache.find(l => l.id === id) || null;
}
