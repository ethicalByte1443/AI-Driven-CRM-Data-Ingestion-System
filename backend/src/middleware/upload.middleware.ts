import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import { env } from '../config/env';

/**
 * File filter: accept only .csv files.
 */
function csvFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypes = [
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'text/plain', // Some systems send CSV as text/plain
  ];

  if (ext !== '.csv') {
    return callback(new Error('Only CSV files are allowed. Please upload a .csv file.'));
  }

  if (!mimeTypes.includes(file.mimetype)) {
    return callback(new Error('Invalid file type. Please upload a valid CSV file.'));
  }

  callback(null, true);
}

/**
 * Multer upload middleware.
 * - Accepts field name: "file"
 * - Memory storage (no disk writes)
 * - Max file size from env (default 5MB)
 * - CSV files only
 */
export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: csvFileFilter,
}).single('file');

/**
 * Wrapper middleware that catches Multer errors and returns JSON.
 */
export function handleUpload(
  req: Request,
  res: import('express').Response,
  next: import('express').NextFunction
): void {
  uploadCsv(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          message: `File too large. Maximum size is ${env.MAX_FILE_SIZE_MB}MB.`,
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
      return;
    }

    if (err) {
      res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a CSV file.',
      });
      return;
    }

    next();
  });
}
