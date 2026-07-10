import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock the environment config module
vi.mock('../config/env', () => ({
  env: {
    PORT: 5001,
    FRONTEND_URL: 'http://localhost:3000',
    AI_PROVIDER: 'mock',
    GEMINI_API_KEY: '',
    GEMINI_MODEL: 'gemini-2.0-flash',
    AI_BATCH_SIZE: 2,
    MAX_FILE_SIZE_MB: 5,
  }
}));

import { getLeads, addLeads, getLeadById, updateLead } from '../services/lead.store';
import { runEngagementWorkflow } from '../services/agent.service';
import { CRMRecord } from '../types/crm.types';

describe('6. Lead Store & Persistence Database', () => {
  beforeEach(() => {
    // Delete leads.json if it exists to start fresh
    const leadsFile = path.join(process.cwd(), 'leads.json');
    if (fs.existsSync(leadsFile)) {
      try {
        fs.unlinkSync(leadsFile);
      } catch (err) {
        // Ignore
      }
    }
  });

  it('should initialize and fetch the default seed leads', () => {
    const leads = getLeads();
    expect(leads.length).toBeGreaterThan(0);
    expect(leads[0].id).toBeDefined();
    expect(leads[0].engagementStatus).toBe('not_engaged');
  });

  it('should add new records, generating IDs and default engagement statuses', () => {
    const newRecords: CRMRecord[] = [
      {
        created_at: new Date().toISOString(),
        name: 'Test Customer',
        email: 'test@customer.com',
        country_code: '+1',
        mobile_without_country_code: '5550100',
        company: 'ACME Corp',
        city: 'Metropolis',
        state: 'NY',
        country: 'USA',
        lead_owner: 'A',
        crm_status: 'GOOD_LEAD_FOLLOW_UP',
        crm_note: 'Warm lead',
        data_source: 'eden_park',
        possession_time: '',
        description: 'Interested in SaaS'
      }
    ];

    const added = addLeads(newRecords);
    expect(added).toHaveLength(1);
    expect(added[0].id).toBeDefined();
    expect(added[0].name).toBe('Test Customer');
    expect(added[0].engagementStatus).toBe('not_engaged');

    const retrieved = getLeadById(added[0].id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe('test@customer.com');
  });

  it('should update lead fields correctly', () => {
    const leads = getLeads();
    const targetLead = leads[0];

    const updated = updateLead(targetLead.id, {
      engagementStatus: 'draft_ready',
      emailSubject: 'Welcome Draft',
      emailDraft: 'Hello, welcome!'
    });

    expect(updated).not.toBeNull();
    expect(updated?.engagementStatus).toBe('draft_ready');
    expect(updated?.emailSubject).toBe('Welcome Draft');
    expect(updated?.emailDraft).toBe('Hello, welcome!');
  });
});

describe('7. LangGraph Agent Onboarding Workflow', () => {
  it('should run mock LangGraph and draft an onboarding proposal', async () => {
    const leads = getLeads();
    const lead = leads[0];

    const result = await runEngagementWorkflow(lead);

    expect(result.success).toBe(true);
    expect(result.emailSubject).toContain('CRM');
    expect(result.emailDraft).toContain(lead.name);
    expect(result.emailDraft).toContain('UNSUBSCRIBE');
  });
});
