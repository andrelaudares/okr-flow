export interface ExportFormat {
  format: 'CSV' | 'EXCEL' | 'PDF';
  name: string;
  description: string;
  extension: string;
  supports_charts: boolean;
  note?: string;
}

export interface ExportConfig {
  name: string;
  report_type: 'DASHBOARD' | 'OBJECTIVES' | 'KEY_RESULTS' | 'COMPLETE';
  format: 'CSV' | 'EXCEL' | 'PDF';
  filters: {
    search?: string;
    status?: string[];
    owner_id?: string;
    cycle_id?: string;
    start_date?: string;
    end_date?: string;
    include_key_results?: boolean;
    include_checkins?: boolean;
  };
  include_charts?: boolean;
}

export interface Report {
  id: string;
  name: string;
  report_type: string;
  format: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  file_size?: number;
  download_url?: string;
  records_count?: number;
  generation_started_at: string;
  generation_completed_at?: string;
  expires_at?: string;
}

export interface ReportsResponse {
  reports: Report[];
  total: number;
  has_more: boolean;
}

export interface ExportResponse {
  report_id: string;
  status: string;
  message: string;
} 