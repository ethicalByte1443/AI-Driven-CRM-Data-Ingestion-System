import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { CRMRecord, SkippedRecord, CRMStatus, DataSource } from '../types/crm.types';
import { CsvRecord } from '../types/csv.types';
import { normalizeDate } from '../utils/date';
import { normalizePhone } from '../utils/phone';

/**
 * Zod schema for the confirm import request body.
 *
 * Rules:
 * - `records` is required and must be an array
 * - Max 1000 records
 * - Each record must be an object
 * - Empty records array returns error
 * - Values are coerced to strings
 */
const confirmImportSchema = z.object({
  records: z
    .array(
      z.record(z.string(), z.any().transform((val) => {
        if (val === null || val === undefined) return '';
        return String(val);
      }))
    )
    .min(1, 'Records array cannot be empty. Please provide at least one record.')
    .max(1000, 'Too many records. Maximum 1000 records per request.'),
});

export type ConfirmImportInput = z.infer<typeof confirmImportSchema>;

/**
 * Middleware to validate the confirm import request body.
 */
export function validateConfirmImport(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const result = confirmImportSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Invalid request body.',
      details: errors,
    });
    return;
  }

  // Replace body with validated/transformed data
  req.body = result.data;
  next();
}

// Allowed CRM status values
const allowedCrmStatuses: CRMStatus[] = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
  '',
];

// Allowed data source values
const allowedDataSources: DataSource[] = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
  '',
];

// Zod schema for validated CRMRecord (individual record level validation)
export const crmRecordSchema = z.object({
  created_at: z.string().transform((val) => normalizeDate(val)),
  name: z.string().default(''),
  email: z.string().default(''),
  country_code: z.string().default(''),
  mobile_without_country_code: z.string().default(''),
  company: z.string().default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  country: z.string().default(''),
  lead_owner: z.string().default(''),
  crm_status: z.string().transform((val): CRMStatus => {
    const status = val as CRMStatus;
    return allowedCrmStatuses.includes(status) ? status : '';
  }),
  crm_note: z.string().default(''),
  data_source: z.string().transform((val): DataSource => {
    const source = val as DataSource;
    return allowedDataSources.includes(source) ? source : '';
  }),
  possession_time: z.string().default(''),
  description: z.string().default(''),
});

/**
 * Validates the AI batch response.
 * Filters out invalid records, maps them to skipped records, and formats the valid ones.
 */
export function validateAiBatchResponse(
  aiOutput: any,
  originalBatch: CsvRecord[]
): {
  importedRecords: CRMRecord[];
  skippedRecords: SkippedRecord[];
} {
  const importedRecords: CRMRecord[] = [];
  const skippedRecords: SkippedRecord[] = [];

  // Helper to find the original CSV record by name/email/phone from the batch if possible, or fallback
  const getOriginalRecord = (index: number, record: any): CsvRecord => {
    if (originalBatch[index]) {
      return originalBatch[index];
    }
    // Fallback if index is out of bounds
    return {
      name: record?.name || '',
      email: record?.email || '',
      mobile: record?.mobile_without_country_code || '',
    };
  };

  const rawImported = Array.isArray(aiOutput?.importedRecords) ? aiOutput.importedRecords : [];
  const rawSkipped = Array.isArray(aiOutput?.skippedRecords) ? aiOutput.skippedRecords : [];

  // Process raw skipped records first
  rawSkipped.forEach((record: any, index: number) => {
    skippedRecords.push({
      originalRecord: record?.originalRecord || getOriginalRecord(index, record),
      reason: record?.reason || 'AI chose to skip this record.',
    });
  });

  // Process and validate imported records
  rawImported.forEach((record: any, index: number) => {
    const originalRecord = getOriginalRecord(index, record);

    if (!record || typeof record !== 'object') {
      skippedRecords.push({
        originalRecord,
        reason: 'AI output record is not a valid object.',
      });
      return;
    }

    // Fill missing fields with blank strings
    const filledRecord: Record<string, any> = {};
    const schemaKeys = [
      'created_at', 'name', 'email', 'country_code', 'mobile_without_country_code',
      'company', 'city', 'state', 'country', 'lead_owner',
      'crm_status', 'crm_note', 'data_source', 'possession_time', 'description'
    ];

    schemaKeys.forEach((key) => {
      const val = record[key];
      filledRecord[key] = (val === null || val === undefined) ? '' : String(val).trim();
    });

    // Validate using Zod
    const parseResult = crmRecordSchema.safeParse(filledRecord);
    if (!parseResult.success) {
      skippedRecords.push({
        originalRecord,
        reason: `Validation failed: ${parseResult.error.issues.map(e => e.message).join(', ')}`,
      });
      return;
    }

    const validatedData = parseResult.data as CRMRecord;

    // Check date normalization result (created_at is valid or empty string)
    // Rule: "created_at must be blank or valid date."
    // (If it was invalid, normalizeDate returns empty string, which is valid and handled)

    // Check rule: "Imported records must contain at least email or mobile."
    if (!validatedData.email && !validatedData.mobile_without_country_code) {
      skippedRecords.push({
        originalRecord,
        reason: 'Missing both email and mobile number',
      });
      return;
    }

    // If mobile exists, apply normalizePhone as post-processing to ensure +91, etc.
    if (validatedData.mobile_without_country_code) {
      const phoneNorm = normalizePhone(
        (validatedData.country_code ? validatedData.country_code : '') +
        validatedData.mobile_without_country_code
      );
      validatedData.country_code = phoneNorm.country_code;
      validatedData.mobile_without_country_code = phoneNorm.mobile_without_country_code;
    }

    importedRecords.push(validatedData);
  });

  return {
    importedRecords,
    skippedRecords,
  };
}

