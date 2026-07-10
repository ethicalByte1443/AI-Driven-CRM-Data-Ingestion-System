import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.connection';
import { CsvRecord } from '../types/csv.types';

export const IMPORT_QUEUE_NAME = 'csv-import-queue';

export interface ImportJobData {
  records: CsvRecord[];
}

export const importQueue = new Queue<ImportJobData>(IMPORT_QUEUE_NAME, {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true, // Clean up successful jobs to save Redis memory
    removeOnFail: false,   // Keep failed jobs for debugging
  },
});

console.log(`[Queue] Initialized queue: ${IMPORT_QUEUE_NAME}`);
