export interface User {
  id: number;
  full_name: string;
  email: string;
  department: string;
  semester: number;
  role: 'student' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  description: string;
  subject: string;
  department: string;
  semester: number;
  unit_number: number;
  uploader_id: number;
  uploader_name?: string;
  uploader_department?: string;
  storage_key: string;
  original_filename: string;
  file_extension: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  download_count: number;
}

export interface NoteReport {
  id: number;
  note_id: number;
  reporter_id: number;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  note_title?: string;
  note_subject?: string;
  reporter_name?: string;
  reporter_email?: string;
}

export interface SystemStats {
  total_users: number;
  total_notes: number;
  total_downloads: number;
  pending_reports: number;
  storage_provider: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded';
  database: {
    connected: boolean;
    error: string | null;
  };
  storage: {
    provider: string;
    is_aws_s3: boolean;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  notes: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
