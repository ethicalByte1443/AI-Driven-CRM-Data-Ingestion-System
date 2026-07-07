import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

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
    const errors = result.error.errors.map((e) => ({
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
