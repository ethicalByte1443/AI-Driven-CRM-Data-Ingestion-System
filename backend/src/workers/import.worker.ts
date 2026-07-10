import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis.connection';
import { IMPORT_QUEUE_NAME, ImportJobData } from '../queues/import.queue';
import { CRMRecord, SkippedRecord, ImportResult } from '../types/crm.types';
import { extractCRMRecordsWithAI } from '../services/ai.service';
import { chunkArray } from '../utils/batch';
import { env } from '../config/env';
import { addLeads } from '../services/lead.store';


export interface ProgressData {
  percentage: number;
  currentBatch: number;
  totalBatches: number;
  importedCount: number;
  skippedCount: number;
}

export function createImportWorker() {
  const worker = new Worker<ImportJobData, ImportResult>(
    IMPORT_QUEUE_NAME,
    async (job: Job<ImportJobData>) => {
      const { records } = job.data;

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
      const totalBatches = batches.length;

      console.log(`[Worker] Job ${job.id} - Processing ${records.length} records in ${totalBatches} batches`);

      const allImported: CRMRecord[] = [];
      const allSkipped: SkippedRecord[] = [];

      for (let i = 0; i < totalBatches; i++) {
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
            `[Worker] Job ${job.id} - Batch ${batchNumber}/${totalBatches}: ` +
            `${result.importedRecords?.length || 0} imported, ` +
            `${result.skippedRecords?.length || 0} skipped`
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[Worker] Job ${job.id} - Batch ${batchNumber} failed: ${message}`);

          for (const record of batch) {
            allSkipped.push({
              originalRecord: record,
              reason: `AI processing failed for this batch: ${message}`,
            });
          }
        }

        // Update progress on the job
        const percentage = Math.round((batchNumber / totalBatches) * 100);
        const progress: ProgressData = {
          percentage,
          currentBatch: batchNumber,
          totalBatches,
          importedCount: allImported.length,
          skippedCount: allSkipped.length,
        };

        await job.updateProgress(progress);
      }

      console.log(
        `[Worker] Job ${job.id} - Complete: ${allImported.length} imported, ${allSkipped.length} skipped`
      );

      // Save valid imported leads to the local storage database
      if (allImported.length > 0) {
        addLeads(allImported);
      }

      return {
        success: true,
        totalImported: allImported.length,
        totalSkipped: allSkipped.length,
        importedRecords: allImported,
        skippedRecords: allSkipped,
      };
    },
    {
      connection: redisConfig,
      concurrency: 1, // Process one upload job at a time to prevent AI rate limiting issues
    }
  );

  worker.on('active', (job) => {
    console.log(`[Worker] Job ${job.id} has started processing`);
  });

  worker.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} has completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err);
  });

  return worker;
}
