import { describe, it, expect, vi } from 'vitest';

// Mock the environment config module before any services are imported
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

import { parseCsvBuffer } from '../services/csv.service';
import { normalizePhone } from '../utils/phone';
import { normalizeDate } from '../utils/date';
import { extractCRMRecordsWithAI } from '../services/ai.service';
import { processImport } from '../services/import.service';
import { CsvRecord } from '../types/csv.types';

describe('1. CSV Parser Service', () => {
  it('should parse a normal CSV successfully', async () => {
    const csvContent = 'Full Name,Email,Phone\nJohn Doe,john@example.com,9876543210\nJane Smith,jane@example.com,9876543211';
    const result = await parseCsvBuffer(Buffer.from(csvContent));
    
    expect(result.headers).toEqual(['Full Name', 'Email', 'Phone']);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]['Full Name']).toBe('John Doe');
    expect(result.records[1]['Email']).toBe('jane@example.com');
  });

  it('should support quoted commas correctly', async () => {
    const csvContent = 'Name,Company,Notes\nJohn Doe,GrowEasy,"Interested, looking for demo"\nJane Smith,Tech Corp,"Busy, call later"';
    const result = await parseCsvBuffer(Buffer.from(csvContent));
    
    expect(result.records[0]['Notes']).toBe('Interested, looking for demo');
    expect(result.records[1]['Notes']).toBe('Busy, call later');
  });

  it('should skip empty rows completely', async () => {
    const csvContent = 'Name,Email\n\nJohn Doe,john@example.com\n\n\n';
    const result = await parseCsvBuffer(Buffer.from(csvContent));
    
    expect(result.records).toHaveLength(1);
    expect(result.records[0]['Name']).toBe('John Doe');
  });

  it('should reject an empty CSV with an error', async () => {
    const csvContent = '';
    await expect(parseCsvBuffer(Buffer.from(csvContent))).rejects.toThrow();
  });
});

describe('2. Phone Normalization', () => {
  it('should handle Indian numbers with +91 prefix', () => {
    const norm = normalizePhone('+91 98765 43210');
    expect(norm.country_code).toBe('+91');
    expect(norm.mobile_without_country_code).toBe('9876543210');
  });

  it('should handle Indian numbers with 91 prefix (no plus)', () => {
    const norm = normalizePhone('919876543210');
    expect(norm.country_code).toBe('+91');
    expect(norm.mobile_without_country_code).toBe('9876543210');
  });

  it('should handle 10-digit Indian numbers without country code', () => {
    const norm = normalizePhone('9876543210');
    expect(norm.country_code).toBe('+91');
    expect(norm.mobile_without_country_code).toBe('9876543210');
  });

  it('should normalize international numbers with plus prefix', () => {
    const norm = normalizePhone('+1 202 555 0143');
    expect(norm.country_code).toBe('+1');
    expect(norm.mobile_without_country_code).toBe('2025550143');
  });
});

describe('3. Date Normalization', () => {
  it('should format a valid date to ISO string', () => {
    const dateStr = '2026-05-13 14:20:48';
    const normalized = normalizeDate(dateStr);
    expect(new Date(normalized).getTime()).not.toBeNaN();
  });

  it('should normalize Indian DD/MM/YYYY dates', () => {
    const normalized = normalizeDate('13/05/2026');
    expect(normalized).toContain('2026-05-13');
  });

  it('should return empty string for invalid dates', () => {
    const normalized = normalizeDate('not-a-date');
    expect(normalized).toBe('');
  });
});

describe('4. Mock AI Extraction', () => {
  it('should heuristically extract common columns', async () => {
    const csvRecords: CsvRecord[] = [
      {
        'Full Name': 'John Doe',
        'Email Address': 'john@example.com',
        'Mobile Number': '9876543210',
        'Company': 'GrowEasy',
        'City': 'Mumbai',
        'Status': 'Interested',
        'Campaign Source': 'leads_on_demand'
      }
    ];

    // Force mock mode
    process.env.AI_PROVIDER = 'mock';

    const result = await extractCRMRecordsWithAI(csvRecords, 1);
    
    expect(result.importedRecords).toHaveLength(1);
    const lead = result.importedRecords[0];
    expect(lead.name).toBe('John Doe');
    expect(lead.email).toBe('john@example.com');
    expect(lead.mobile_without_country_code).toBe('9876543210');
    expect(lead.company).toBe('GrowEasy');
    expect(lead.city).toBe('Mumbai');
    expect(lead.crm_status).toBe('GOOD_LEAD_FOLLOW_UP');
    expect(lead.data_source).toBe('leads_on_demand');
  });

  it('should skip records missing both email and mobile', async () => {
    const csvRecords: CsvRecord[] = [
      {
        'Full Name': 'No Contacts',
        'City': 'Pune'
      }
    ];

    process.env.AI_PROVIDER = 'mock';

    const result = await extractCRMRecordsWithAI(csvRecords, 1);
    expect(result.importedRecords).toHaveLength(0);
    expect(result.skippedRecords).toHaveLength(1);
    expect(result.skippedRecords[0].reason).toContain('Missing both email and mobile number');
  });
});

describe('5. Import Service Batch Processing', () => {
  it('should batch process records and combine totals', async () => {
    const csvRecords: CsvRecord[] = [
      { 'Full Name': 'A', 'Email': 'a@example.com' },
      { 'Full Name': 'B', 'Email': 'b@example.com' },
      { 'Full Name': 'C', 'Email': 'c@example.com' }
    ];

    // Force mock mode and batch size of 2
    process.env.AI_PROVIDER = 'mock';
    process.env.AI_BATCH_SIZE = '2';

    const result = await processImport(csvRecords);
    
    expect(result.success).toBe(true);
    expect(result.totalImported).toBe(3);
    expect(result.totalSkipped).toBe(0);
    expect(result.importedRecords).toHaveLength(3);
    expect(result.importedRecords[0].name).toBe('A');
    expect(result.importedRecords[1].name).toBe('B');
    expect(result.importedRecords[2].name).toBe('C');
  });
});
