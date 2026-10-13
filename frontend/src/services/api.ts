import { Note, User, NoteReport, SystemStats, HealthStatus, PaginatedResponse } from '../types';

const API_BASE = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  // Default to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // send & receive HttpOnly session cookies
  });

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { success: response.ok, message: await response.text() };
  }

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    register: (payload: { full_name: string; email: string; password: string; department: string; semester: number }) =>
      request<{ success: boolean; user: User; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      request<{ success: boolean; user: User; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST',
      }),
    me: () =>
      request<{ success: boolean; user: User | null }>('/auth/me', {
        method: 'GET',
      }),
  },

  notes: {
    list: (params: Record<string, string | number> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request<PaginatedResponse<Note>>(`/notes${queryString}`);
    },
    get: (id: number) =>
      request<{ success: boolean; note: Note }>(`/notes/${id}`),
    upload: (formData: FormData) =>
      request<{ success: boolean; message: string; note: Note; storage_mode: string }>('/notes', {
        method: 'POST',
        body: formData,
      }),
    delete: (id: number) =>
      request<{ success: boolean; message: string }>(`/notes/${id}`, {
        method: 'DELETE',
      }),
    myNotes: (params: Record<string, string | number> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request<PaginatedResponse<Note>>(`/my-notes${queryString}`);
    },
    report: (id: number, payload: { reason: string; description: string }) =>
      request<{ success: boolean; message: string }>(`/notes/${id}/report`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  downloads: {
    getDownloadUrl: (noteId: number) =>
      request<{
        success: boolean;
        download_url: string;
        original_filename: string;
        file_size: number;
        mime_type: string;
        storage_mode: string;
        expires_in_seconds: number;
      }>(`/notes/${noteId}/download`),
  },

  profile: {
    get: () =>
      request<{ success: boolean; profile: User & { stats: { uploads_count: number; total_downloads_received: number } } }>('/profile'),
    update: (payload: { full_name?: string; department?: string; semester?: number }) =>
      request<{ success: boolean; message: string; profile: User }>('/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  admin: {
    getStats: () =>
      request<{ success: boolean; stats: SystemStats }>('/admin/stats'),
    listUsers: (params: { page?: number; per_page?: number; q?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.per_page) query.append('per_page', String(params.per_page));
      if (params.q) query.append('q', params.q);
      return request<{ success: boolean; users: User[]; total: number; page: number; per_page: number }>(`/admin/users?${query.toString()}`);
    },
    listNotes: (params: { page?: number; per_page?: number; q?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.per_page) query.append('per_page', String(params.per_page));
      if (params.q) query.append('q', params.q);
      return request<{ success: boolean; notes: Note[]; total: number; page: number; per_page: number }>(`/admin/notes?${query.toString()}`);
    },
    deleteNote: (id: number) =>
      request<{ success: boolean; message: string }>(`/admin/notes/${id}`, {
        method: 'DELETE',
      }),
    listReports: (status = 'all') =>
      request<{ success: boolean; reports: NoteReport[] }>(`/admin/reports?status=${status}`),
    updateReport: (id: number, status: string) =>
      request<{ success: boolean; message: string; report: NoteReport }>(`/admin/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  health: {
    check: () => request<HealthStatus>('/health'),
  },
};
