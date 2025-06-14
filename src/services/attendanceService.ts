import axios from 'axios';
import {
  AttendanceRecord,
  AttendanceStats,
  Permission,
  Regularization,
  PermissionFormData,
  RegularizationFormData,
  AttendanceSettings
} from '../types/attendance';

const api = axios.create({
  baseURL: 'http://localhost:8090',
  timeout: 30000,
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      }
    });
    return Promise.reject(error);
  }
);

// Attendance endpoints
const attendance = {
  clockIn: () =>
    api.post<AttendanceRecord>('/attendance/clock-in'),
  
  clockOut: () =>
    api.post<AttendanceRecord>('/attendance/clock-out'),
  
  getStatus: () =>
    api.get<AttendanceRecord>('/attendance/status'),
  
  getRecords: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    status?: string;
  }) =>
    api.get<AttendanceRecord[]>('/attendance-records', { params }),
  
  getStats: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }) =>
    api.get<AttendanceStats>('/attendance/stats', { params })
};

// Permission endpoints
const permissions = {
  create: (data: PermissionFormData) =>
    api.post<Permission>('/permissions', data),
  
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    status?: string;
  }) =>
    api.get<Permission[]>('/permissions', { params }),
  
  getById: (id: string) =>
    api.get<Permission>(`/permissions/${id}`),
  
  updateStatus: (id: string, status: string, comments?: string) =>
    api.put<Permission>(`/permissions/${id}/status`, { status, comments }),
  
  getRemainingCount: () =>
    api.get<{ remaining: number }>('/permissions/remaining')
};

// Regularization endpoints
const regularizations = {
  create: (data: RegularizationFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    return api.post<Regularization>('/regularizations', formData);
  },
  
  getAll: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    status?: string;
  }) =>
    api.get<Regularization[]>('/regularizations', { params }),
  
  getById: (id: string) =>
    api.get<Regularization>(`/regularizations/${id}`),
  
  updateStatus: (id: string, status: string, comments?: string) =>
    api.put<Regularization>(`/regularizations/${id}/status`, { status, comments })
};

// Settings endpoints
const settings = {
  get: () =>
    api.get<AttendanceSettings>('/attendance/settings'),
  
  update: (data: Partial<AttendanceSettings>) =>
    api.put<AttendanceSettings>('/attendance/settings', data),
  
  getDepartmentRules: (departmentId: string) =>
    api.get<AttendanceSettings>(`/attendance/settings/departments/${departmentId}`)
};

export default {
  attendance,
  permissions,
  regularizations,
  settings
}; 