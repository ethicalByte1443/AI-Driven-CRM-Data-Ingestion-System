import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { CsvRecord } from '../types/csv.types';
import { CRMRecord, SkippedRecord } from '../types/crm.types';
import { safeJsonParse } from '../utils/json';
import { AiKeyMissingError, AiServiceError } from '../utils/errors';
import { validateAiBatchResponse } from '../validators/import.validator';

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert CRM data extraction engine for GrowEasy.

Your task is to map messy CSV lead records into the exact GrowEasy CRM JSON schema.

You must return only valid JSON. No markdown. No explanation.

Required output:
{
  "importedRecords": CRMRecord[],
  "skippedRecords": SkippedRecord[]
}

CRMRecord fields:
created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

SkippedRecord fields:
originalRecord (the original CSV record object), reason (string explaining why it was skipped)

Rules:
1. Extract as many fields as possible.
2. Do not assume fixed CSV column names.
3. Understand alternate names like:
   - name: full name, customer name, lead name, contact person, client
   - email: email, email address, mail, primary email
   - mobile: phone, mobile, contact, phone number, whatsapp, tel
   - created_at: created, created date, date, timestamp, submitted at
   - company: company, organization, firm, business
   - city/state/country: location, address, region
   - lead_owner: owner, assigned to, agent, salesperson
   - crm_note: notes, remarks, comment, feedback, description
   - data_source: source, campaign, project, property, channel
   - possession_time: possession, possession date, handover, availability
4. Allowed crm_status values:
   GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE
   Mapping guidance:
   - good lead / follow up / interested / call back -> GOOD_LEAD_FOLLOW_UP
   - did not connect / no answer / unreachable / busy -> DID_NOT_CONNECT
   - bad lead / not interested / invalid / wrong number -> BAD_LEAD
   - sale done / deal closed / converted / booked -> SALE_DONE
   If status is unknown, use GOOD_LEAD_FOLLOW_UP only when there is clear follow-up intent. Otherwise use empty string.
5. Allowed data_source values:
   leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots
   If data_source does not match confidently, use empty string.
6. created_at must be valid for JavaScript new Date(created_at), otherwise empty string.
7. If multiple emails exist, use the first one and append remaining emails to crm_note.
8. If multiple phone numbers exist, use the first one and append remaining numbers to crm_note.
9. If a record has neither email nor mobile number, skip it with reason "Missing both email and mobile number".
10. Keep every text value as a single-line string. Escape line breaks as \\n.
11. Do not invent personal data that is not present.
12. If a field is missing, return empty string.
13. Return only valid JSON.`;

// ─── AI Batch Response Type ──────────────────────────────────────────────────

interface AiBatchResponse {
  importedRecords: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

// ─── Gemini AI Extraction ────────────────────────────────────────────────────

/**
 * Extract CRM records from CSV records using Gemini AI.
 */
async function extractWithGemini(
  records: CsvRecord[],
  batchNumber: number
): Promise<AiBatchResponse> {
  if (!env.GEMINI_API_KEY) {
    throw new AiKeyMissingError();
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const userPrompt = JSON.stringify({
    batchNumber,
    records,
  });

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Extract CRM records from the following batch:\n\n${userPrompt}` },
    ]);

    const responseText = result.response.text();
    const parsed = safeJsonParse<any>(responseText);

    return validateAiBatchResponse(parsed, records);
  } catch (error) {
    if (error instanceof AiKeyMissingError) throw error;

    const message = error instanceof Error ? error.message : 'Unknown AI error';
    throw new AiServiceError(`Gemini AI extraction failed: ${message}`);
  }
}

// ─── Mock AI Extraction ──────────────────────────────────────────────────────

/**
 * Deterministic heuristic mapping for local testing without an API key.
 * Maps common CSV column names to CRM fields.
 */
function extractWithMock(
  records: CsvRecord[],
  _batchNumber: number
): AiBatchResponse {
  const rawImported: any[] = [];
  const rawSkipped: any[] = [];

  for (const record of records) {
    const mapped = mapRecordHeuristically(record);
    rawImported.push(mapped);
  }

  return validateAiBatchResponse(
    {
      importedRecords: rawImported,
      skippedRecords: rawSkipped,
    },
    records
  );
}

/**
 * Heuristic field mapping — searches CSV keys for common patterns.
 */
function mapRecordHeuristically(record: CsvRecord): Record<string, string> {
  const result: Record<string, string> = {
    created_at: '',
    name: '',
    email: '',
    country_code: '',
    mobile_without_country_code: '',
    company: '',
    city: '',
    state: '',
    country: '',
    lead_owner: '',
    crm_status: '',
    crm_note: '',
    data_source: '',
    possession_time: '',
    description: '',
  };

  const notes: string[] = [];

  for (const [key, value] of Object.entries(record)) {
    const k = key.toLowerCase().trim();
    const v = (value || '').trim();
    if (!v) continue;

    // Name
    if (/^(full\s*name|name|customer\s*name|lead\s*name|contact\s*person|client)$/i.test(k)) {
      result.name = result.name || v;
    }
    // Email
    else if (/^(email|email\s*address|mail|primary\s*email)$/i.test(k)) {
      if (!result.email) {
        result.email = v;
      } else {
        notes.push(`Additional email: ${v}`);
      }
    }
    // Phone/Mobile
    else if (/^(phone|mobile|contact|phone\s*number|whatsapp|tel|mobile\s*number|contact\s*number)$/i.test(k)) {
      if (!result.mobile_without_country_code) {
        // Basic phone extraction
        const cleaned = v.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+91') && cleaned.length >= 13) {
          result.country_code = '+91';
          result.mobile_without_country_code = cleaned.slice(3);
        } else if (cleaned.startsWith('91') && cleaned.length === 12) {
          result.country_code = '+91';
          result.mobile_without_country_code = cleaned.slice(2);
        } else if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
          result.country_code = '+91';
          result.mobile_without_country_code = cleaned;
        } else {
          result.mobile_without_country_code = cleaned;
        }
      } else {
        notes.push(`Additional phone: ${v}`);
      }
    }
    // Country code
    else if (/^(country\s*code)$/i.test(k)) {
      result.country_code = result.country_code || v;
    }
    // Created at / Date
    else if (/^(created|created\s*at|created\s*date|date|timestamp|submitted\s*at)$/i.test(k)) {
      const d = new Date(v);
      result.created_at = isNaN(d.getTime()) ? '' : d.toISOString();
    }
    // Company
    else if (/^(company|organization|firm|business)$/i.test(k)) {
      result.company = result.company || v;
    }
    // City
    else if (/^(city)$/i.test(k)) {
      result.city = result.city || v;
    }
    // State
    else if (/^(state|province)$/i.test(k)) {
      result.state = result.state || v;
    }
    // Country
    else if (/^(country)$/i.test(k)) {
      result.country = result.country || v;
    }
    // Lead owner
    else if (/^(lead\s*owner|owner|assigned\s*to|agent|salesperson)$/i.test(k)) {
      result.lead_owner = result.lead_owner || v;
    }
    // Status
    else if (/^(status|crm\s*status|lead\s*status)$/i.test(k)) {
      result.crm_status = mapStatus(v);
    }
    // Notes/Remarks
    else if (/^(notes?|remarks?|comments?|feedback|crm\s*note)$/i.test(k)) {
      notes.push(v);
    }
    // Data source
    else if (/(source|campaign|project|property|channel)/i.test(k)) {
      result.data_source = mapDataSource(v);
    }
    // Possession time
    else if (/^(possession|possession\s*time|possession\s*date|handover|availability)$/i.test(k)) {
      result.possession_time = result.possession_time || v;
    }
    // Description
    else if (/^(description|desc)$/i.test(k)) {
      result.description = result.description || v;
    }
    // Unmatched fields go to notes
    else {
      notes.push(`${key}: ${v}`);
    }
  }

  if (notes.length > 0) {
    result.crm_note = [result.crm_note, ...notes].filter(Boolean).join(' | ');
  }

  return result;
}

/**
 * Map a status string to allowed CRM status values.
 */
function mapStatus(value: string): string {
  const v = value.toLowerCase().trim();

  if (/good\s*lead|follow\s*up|interested|call\s*back/i.test(v)) return 'GOOD_LEAD_FOLLOW_UP';
  if (/did\s*not\s*connect|no\s*answer|unreachable|busy/i.test(v)) return 'DID_NOT_CONNECT';
  if (/bad\s*lead|not\s*interested|invalid|wrong\s*number/i.test(v)) return 'BAD_LEAD';
  if (/sale\s*done|deal\s*closed|converted|booked/i.test(v)) return 'SALE_DONE';

  return '';
}

/**
 * Map a data source string to allowed values.
 */
function mapDataSource(value: string): string {
  const v = value.toLowerCase().trim();

  const allowed = ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];
  for (const source of allowed) {
    if (v.includes(source.replace(/_/g, ' ')) || v.includes(source)) {
      return source;
    }
  }

  return '';
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Extract CRM records from CSV records using AI (or mock mode).
 *
 * @param records - Raw CSV records
 * @param batchNumber - Batch number for logging
 * @returns Imported and skipped records
 */
export async function extractCRMRecordsWithAI(
  records: CsvRecord[],
  batchNumber: number
): Promise<AiBatchResponse> {
  if (env.AI_PROVIDER === 'mock') {
    console.log(`[Mock AI] Processing batch ${batchNumber} with ${records.length} records`);
    return extractWithMock(records, batchNumber);
  }

  console.log(`[Gemini AI] Processing batch ${batchNumber} with ${records.length} records`);
  return extractWithGemini(records, batchNumber);
}
