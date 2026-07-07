/**
 * Custom error classes for structured error handling.
 */

export class AppError extends Error {
  public statusCode: number;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class CsvParseError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'CsvParseError';
  }
}

export class AiServiceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 502, details);
    this.name = 'AiServiceError';
  }
}

export class AiKeyMissingError extends AppError {
  constructor() {
    super(
      'AI API key is not configured. Please set GEMINI_API_KEY in your .env file.',
      503
    );
    this.name = 'AiKeyMissingError';
  }
}
