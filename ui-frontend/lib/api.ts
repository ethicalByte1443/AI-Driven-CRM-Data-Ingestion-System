import axios from 'axios';
import type { CsvPreviewResponse, CsvRecord } from '@/types/csv';
import type { ImportResultResponse } from '@/types/crm';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
  timeout: 15_000,
});

/**
 * Upload a CSV file for preview (no AI processing).
 * Sends the file as multipart/form-data to the backend preview endpoint.
 */
export async function uploadCsvForPreview(
  file: File
): Promise<CsvPreviewResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<CsvPreviewResponse>(
      '/api/import/preview',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Confirm CSV import — sends parsed records to backend for AI extraction.
 * Uses a longer timeout since AI batch processing can take time.
 */
export async function confirmCsvImport(
  records: CsvRecord[]
): Promise<ImportResultResponse> {
  try {
    const { data } = await api.post<ImportResultResponse>(
      '/api/import/confirm',
      { records },
      {
        timeout: 120_000, // 2 minute timeout for AI processing
      }
    );

    return data;
  } catch (error) {
    throw normalizeError(error);
  }
}

/**
 * Normalize Axios/network errors into a user-friendly message.
 */
function normalizeError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return new Error(
        'Request timed out. The server might be processing a large file. Please try again.'
      );
    }

    if (!error.response) {
      return new Error(
        'Cannot connect to the server. Please check if the backend is running on ' +
          (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001')
      );
    }

    const status = error.response.status;
    const serverMessage =
      error.response.data?.error || error.response.data?.message;

    if (status === 400) {
      return new Error(serverMessage || 'Invalid request. Please check your CSV file.');
    }
    if (status === 413) {
      return new Error('File is too large. Maximum allowed size is 5MB.');
    }
    if (status === 429) {
      return new Error(
        'AI rate limit reached. Please wait a moment and try again.'
      );
    }
    if (status >= 500) {
      return new Error(
        serverMessage || 'Server error. Please try again later.'
      );
    }

    return new Error(serverMessage || `Request failed with status ${status}.`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('An unexpected error occurred.');
}
