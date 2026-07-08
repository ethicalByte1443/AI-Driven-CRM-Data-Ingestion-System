import type { CrmStatus } from '@/types/crm';

/**
 * All CRM fields displayed in the parsed result table, in order.
 */
export const CRM_FIELDS = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
] as const;

/**
 * Human-readable labels for each CRM field.
 */
export const CRM_FIELD_LABELS: Record<string, string> = {
  created_at: 'Created At',
  name: 'Name',
  email: 'Email',
  country_code: 'Country Code',
  mobile_without_country_code: 'Mobile',
  company: 'Company',
  city: 'City',
  state: 'State',
  country: 'Country',
  lead_owner: 'Lead Owner',
  crm_status: 'Status',
  crm_note: 'CRM Note',
  data_source: 'Data Source',
  possession_time: 'Possession Time',
  description: 'Description',
};

/**
 * Badge color mapping for CRM status values.
 */
export const STATUS_BADGE_STYLES: Record<
  CrmStatus,
  { bg: string; text: string; label: string }
> = {
  GOOD_LEAD_FOLLOW_UP: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    label: 'Good Lead',
  },
  DID_NOT_CONNECT: {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    label: 'Not Dialed',
  },
  BAD_LEAD: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    label: 'Bad Lead',
  },
  SALE_DONE: {
    bg: 'bg-teal-50 border-teal-200',
    text: 'text-teal-700',
    label: 'Sale Done',
  },
  '': {
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-500',
    label: '—',
  },
};

/**
 * Allowed data source enum values.
 */
export const DATA_SOURCES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
] as const;

/**
 * Max file size in bytes (5MB).
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Accepted MIME types for CSV upload.
 */
export const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
};

/**
 * Sample CSV template content for download.
 */
export const SAMPLE_CSV_CONTENT = `created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description
2026-05-13 14:20:48,John Doe,john.doe@example.com,+91,9876543210,GrowEasy,Mumbai,Maharashtra,India,test@gmail.com,GOOD_LEAD_FOLLOW_UP,Client is asking to reschedule demo,,,
2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,+91,9876543211,Tech Solutions,Bangalore,Karnataka,India,test@gmail.com,DID_NOT_CONNECT,"Person was busy, will try again next week",,,
2026-05-13 14:30:15,Rajesh Patel,rajesh.patel@example.com,+91,9876543212,Startup Inc,Delhi,Delhi,India,test@gmail.com,BAD_LEAD,Not interested in our services,,,
2026-05-13 14:35:22,Priya Singh,priya.singh@example.com,+91,9876543213,Enterprise Corp,Pune,Maharashtra,India,test@gmail.com,SALE_DONE,"Deal closed, onboarding in progress",,,`;

/**
 * Sidebar navigation items.
 */
export const SIDEBAR_MAIN_MENU = [
  { label: 'Dashboard', icon: 'LayoutDashboard' as const, href: '/dashboard' },
  { label: 'Generate Leads', icon: 'Sparkles' as const, href: '/generate-leads' },
  { label: 'Manage Leads', icon: 'Users' as const, href: '/manage-leads' },
  { label: 'Engage Leads', icon: 'MessageSquare' as const, href: '/engage-leads' },
];

export const SIDEBAR_CONTROL_CENTER = [
  { label: 'Team Members', icon: 'UserCog' as const, href: '/team-members' },
  { label: 'Lead Sources', icon: 'Cable' as const, href: '/' },
  { label: 'Ad Accounts', icon: 'Megaphone' as const, href: '/ad-accounts' },
  { label: 'WhatsApp Account', icon: 'MessageCircle' as const, href: '/whatsapp' },
  { label: 'Tele Calling', icon: 'Phone' as const, href: '/tele-calling' },
  { label: 'CRM Fields', icon: 'Settings' as const, href: '/crm-fields' },
  { label: 'API Center', icon: 'Code' as const, href: '/api-center' },
];
