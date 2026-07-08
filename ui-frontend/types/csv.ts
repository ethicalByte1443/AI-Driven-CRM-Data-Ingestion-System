export type CsvRecord = Record<string, string | number | null>;

export interface CsvPreviewResponse {
  success: boolean;
  fileName: string;
  totalRows: number;
  headers: string[];
  previewRows: CsvRecord[];
  records: CsvRecord[];
}
