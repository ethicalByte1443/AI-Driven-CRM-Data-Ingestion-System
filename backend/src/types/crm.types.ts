import { CsvRecord } from './csv.types';

export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE'
  | '';

export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots'
  | '';

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CRMStatus;
  crm_note: string;
  data_source: DataSource;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  originalRecord: CsvRecord;
  reason: string;
}

export interface ImportResult {
  success: boolean;
  totalImported: number;
  totalSkipped: number;
  importedRecords: CRMRecord[];
  skippedRecords: SkippedRecord[];
}

export interface ExtendedCRMRecord extends CRMRecord {
  id: string;
  engagementStatus: 'not_engaged' | 'generating' | 'draft_ready' | 'failed';
  emailDraft?: string | null;
  emailSubject?: string | null;
  engagementError?: string | null;
}

