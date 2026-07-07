import { CsvRecord } from '../types/csv.types';
import { CRMRecord, SkippedRecord, ImportResult } from '../types/crm.types';
import { extractCRMRecordsWithAI } from './ai.service';
import { chunkArray } from '../utils/batch';
import { env } from '../config/env';

/**
 * Process CSV records through AI in batches and return structured import results.
 *
 * Flow:
 * 1. Validate records exist.
 * 2. Split records into batches (size from env).
 * 3. Send each batch to AI service.
 * 4. Combine results.
 * 5. Return totals + imported + skipped.
 */
export async function processImport(records: CsvRecord[]): Promise<ImportResult> {
  if (!records || records.length === 0) {
    return {
      success: true,
      totalImported: 0,
      totalSkipped: 0,
      importedRecords: [],
      skippedRecords: [],
    };
  }

  const batchSize = env.AI_BATCH_SIZE;
  const batches = chunkArray(records, batchSize);

  console.log(`[Import] Processing ${records.length} records in ${batches.length} batch(es) of ${batchSize}`);

  const allImported: CRMRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchNumber = i + 1;

    try {
      const result = await extractCRMRecordsWithAI(batch, batchNumber);

      if (result.importedRecords) {
        allImported.push(...result.importedRecords);
      }
      if (result.skippedRecords) {
        allSkipped.push(...result.skippedRecords);
      }

      console.log(
        `[Import] Batch ${batchNumber}/${batches.length}: ` +
        `${result.importedRecords?.length || 0} imported, ` +
        `${result.skippedRecords?.length || 0} skipped`
      );
    } catch (error) {
      // If a batch fails, skip all records in that batch with error reason
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Import] Batch ${batchNumber} failed: ${message}`);

      for (const record of batch) {
        allSkipped.push({
          originalRecord: record,
          reason: `AI processing failed for this batch: ${message}`,
        });
      }
    }
  }

  console.log(
    `[Import] Complete: ${allImported.length} imported, ${allSkipped.length} skipped`
  );

  return {
    success: true,
    totalImported: allImported.length,
    totalSkipped: allSkipped.length,
    importedRecords: allImported,
    skippedRecords: allSkipped,
  };
}
