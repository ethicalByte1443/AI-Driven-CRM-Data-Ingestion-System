import { parse } from 'csv-parse';
import { CsvParseError } from '../utils/errors';

export interface ParsedCsv {
  headers: string[];
  records: Record<string, string>[];
}

/**
 * Parse a CSV buffer into structured records.
 *
 * - Uses first row as headers.
 * - Trims headers and values.
 * - Supports quoted values, commas inside quotes, empty fields.
 * - Removes fully empty rows.
 * - Preserves original column names.
 * - Returns records as key-value objects.
 */
export function parseCsvBuffer(buffer: Buffer): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    const content = buffer.toString('utf-8').trim();

    if (!content) {
      return reject(new CsvParseError('CSV file is empty. Please upload a file with data.'));
    }

    const records: Record<string, string>[] = [];
    let headers: string[] = [];

    const parser = parse(content, {
      columns: true,         // Use first row as headers
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_empty_values: false,
    });

    parser.on('readable', () => {
      let record: Record<string, string>;
      while ((record = parser.read()) !== null) {
        // Capture headers from the first record
        if (headers.length === 0) {
          headers = Object.keys(record).map((h) => h.trim());
        }

        // Check if the row is entirely empty
        const values = Object.values(record);
        const isEmptyRow = values.every(
          (v) => v === null || v === undefined || String(v).trim() === ''
        );
        if (isEmptyRow) continue;

        // Trim all values and ensure they are strings
        const cleanRecord: Record<string, string> = {};
        for (const [key, value] of Object.entries(record)) {
          cleanRecord[key.trim()] = value === null || value === undefined
            ? ''
            : String(value).trim();
        }

        records.push(cleanRecord);
      }
    });

    parser.on('error', (err: Error) => {
      reject(new CsvParseError(`Failed to parse CSV: ${err.message}`));
    });

    parser.on('end', () => {
      if (headers.length === 0) {
        return reject(new CsvParseError('CSV file has no headers. Please ensure the first row contains column names.'));
      }

      if (records.length === 0) {
        return reject(new CsvParseError('CSV file has headers but no data rows. Please add records to the file.'));
      }

      resolve({ headers, records });
    });
  });
}
