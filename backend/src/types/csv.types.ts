// CSV types
export type CsvRecord = Record<string, string>;

export interface CsvPreviewResponse {
  success: boolean;
  fileName: string;
  totalRows: number;
  headers: string[];
  previewRows: CsvRecord[];
  records: CsvRecord[];
}
