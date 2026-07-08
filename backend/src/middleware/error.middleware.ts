import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 *
 * Error response shape:
 * {
 *   "success": false,
 *   "message": "Readable error message",
 *   "details": {}
 * }
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error(`[Error] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle known AppError subclasses
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined,
    });
    return;
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again.',
    details: process.env.NODE_ENV === 'development'
      ? { error: err.message, stack: err.stack }
      : undefined,
  });
}
