import { Request, Response, NextFunction } from 'express';
import { parseCsvBuffer } from '../services/csv.service';
import { processImport } from '../services/import.service';
import { CsvPreviewResponse } from '../types/csv.types';

/**
 * POST /api/import/preview
 *
 * Accepts CSV upload, parses it, returns preview.
 * No AI processing happens here.
 */
export async function previewCsv(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a CSV file.',
      });
      return;
    }

    const { headers, records } = await parseCsvBuffer(file.buffer);

    // First 10 rows for preview
    const previewRows = records.slice(0, 10);

    const response: CsvPreviewResponse = {
      success: true,
      fileName: file.originalname,
      totalRows: records.length,
      headers,
      previewRows,
      records,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/import/confirm
 *
 * Validates request body (records array), sends to import service
 * for AI-powered CRM extraction, returns structured result.
 */
export async function confirmImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { records } = req.body;

    const result = await processImport(records);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
