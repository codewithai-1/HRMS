import axios from 'axios';
import { Role } from '../types/role';
import { JobPosting, JobApplication } from '../types/recruitment';
import { Department } from '../types/department';
import { EmployeeTransfer, TransferApproval } from '../types/transfer';
import { Shift, EmployeeShift } from '../types/shift';

const api = axios.create({
  baseURL: 'http://localhost:8090',
  timeout: 30000,
});

// Roles endpoints
export const roles = {
  getAll: () => api.get<Role[]>('/roles'),
  getById: (id: string) => api.get<Role>(`/roles/${id}`),
  create: (role: Omit<Role, 'id' | 'createdAt'>) => api.post<Role>('/roles', role),
  update: (id: string, role: Omit<Role, 'id' | 'createdAt'>) => api.put<Role>(`/roles/${id}`, role),
  delete: (id: string) => api.delete(`/roles/${id}`)
};

// Dashboard endpoints
export const dashboard = {
  getStats: () => api.get('/dashboard-stats'),
  getActivities: () => api.get('/activities'),
  getEvents: () => api.get('/events')
};

// Departments endpoints
export const departments = {
  getAll: () => api.get('/departments'),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: Omit<Department, 'id' | 'createdAt'>) => api.post('/departments', data),
  update: (id: string, data: Omit<Department, 'id' | 'createdAt'>) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`)
};

// Employees endpoints
export const employees = {
  getAll: () => api.get('/employees'),
  getById: (id: string) => api.get(`/employees/${id}`),
  create: (employee: any) => api.post('/employees', employee),
  update: (id: string, employee: any) => api.put(`/employees/${id}`, employee),
  delete: (id: string) => api.delete(`/employees/${id}`)
};

// Recruitment endpoints
export const recruitment = {
  // Job Postings
  getAllJobs: (params?: { status?: string; department?: string }) => 
    api.get<JobPosting[]>('/jobs', { params }),
  getJobById: (id: string) => 
    api.get<JobPosting>(`/jobs/${id}`),
  createJob: (job: Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'applicationsCount'>) => 
    api.post<JobPosting>('/jobs', job),
  updateJob: (id: string, job: Partial<JobPosting>) => 
    api.put<JobPosting>(`/jobs/${id}`, job),
  deleteJob: (id: string) => 
    api.delete(`/jobs/${id}`),
  publishJob: (id: string) => 
    api.post(`/jobs/${id}/publish`),
  closeJob: (id: string) => 
    api.post(`/jobs/${id}/close`),

  // Applications
  getAllApplications: (params?: { jobId?: string; status?: string }) => 
    api.get<JobApplication[]>('/applications', { params }),
  getApplicationById: (id: string) => 
    api.get<JobApplication>(`/applications/${id}`),
  createApplication: (application: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt' | 'timeline'>) => 
    api.post<JobApplication>('/applications', application),
  updateApplicationStatus: (id: string, status: string, note?: string) => 
    api.put<JobApplication>(`/applications/${id}/status`, { status, note }),
  addEvaluation: (applicationId: string, evaluation: Omit<JobApplication['evaluations'][0], 'id' | 'createdAt'>) => 
    api.post(`/applications/${applicationId}/evaluations`, evaluation),
  scheduleInterview: (applicationId: string, interview: Omit<JobApplication['interviews'][0], 'id' | 'status'>) => 
    api.post(`/applications/${applicationId}/interviews`, interview),
  updateInterview: (applicationId: string, interviewId: string, update: Partial<JobApplication['interviews'][0]>) => 
    api.put(`/applications/${applicationId}/interviews/${interviewId}`, update)
};

// Transfer endpoints
export const transfers = {
  // Get all transfers with optional filters
  getAll: (params?: {
    status?: string;
    employeeId?: string;
    departmentId?: string;
    fromDate?: string;
    toDate?: string;
  }) => api.get<EmployeeTransfer[]>('/transfers', { params }),

  // Get transfer by ID
  getById: (id: string) => api.get<EmployeeTransfer>(`/transfers/${id}`),

  // Create new transfer request
  create: (transfer: Omit<EmployeeTransfer, 'id' | 'status' | 'approvals' | 'createdAt' | 'updatedAt'>) => 
    api.post<EmployeeTransfer>('/transfers', transfer),

  // Update transfer
  update: (id: string, transfer: Partial<EmployeeTransfer>) => 
    api.put<EmployeeTransfer>(`/transfers/${id}`, transfer),

  // Delete transfer
  delete: (id: string) => api.delete(`/transfers/${id}`),

  // Cancel transfer
  cancel: (id: string, reason: string) => 
    api.post(`/transfers/${id}/cancel`, { reason }),

  // Add approval
  addApproval: (transferId: string, approval: Omit<TransferApproval, 'id' | 'transferId' | 'timestamp'>) => 
    api.post<TransferApproval>(`/transfers/${transferId}/approvals`, approval),

  // Upload attachment
  uploadAttachment: (transferId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/transfers/${transferId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete attachment
  deleteAttachment: (transferId: string, attachmentId: string) => 
    api.delete(`/transfers/${transferId}/attachments/${attachmentId}`),

  // Get transfer history for an employee
  getEmployeeHistory: (employeeId: string) => 
    api.get<EmployeeTransfer[]>(`/employees/${employeeId}/transfers`),
};

// Shift management endpoints
export const shifts = {
  // Get all shifts
  getAll: () => api.get<Shift[]>('/shifts'),

  // Get shift by ID
  getById: (id: string) => api.get<Shift>(`/shifts/${id}`),

  // Create new shift
  create: (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Shift>('/shifts', shift),

  // Update shift
  update: (id: string, shift: Partial<Shift>) => 
    api.put<Shift>(`/shifts/${id}`, shift),

  // Delete shift
  delete: (id: string) => api.delete(`/shifts/${id}`),

  // Get all employee shifts
  getAllEmployeeShifts: (params?: {
    employeeId?: string;
    shiftId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => api.get<EmployeeShift[]>('/employee-shifts', { params }),

  // Get employee shift by ID
  getEmployeeShiftById: (id: string) => 
    api.get<EmployeeShift>(`/employee-shifts/${id}`),

  // Assign shift to employee
  assignShift: (employeeShift: Omit<EmployeeShift, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<EmployeeShift>('/employee-shifts', employeeShift),

  // Update employee shift
  updateEmployeeShift: (id: string, employeeShift: Partial<EmployeeShift>) => 
    api.put<EmployeeShift>(`/employee-shifts/${id}`, employeeShift),

  // Delete employee shift
  deleteEmployeeShift: (id: string) => 
    api.delete(`/employee-shifts/${id}`)
};

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
    
    if (error.response) {
      console.error('Server responded with error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received:', {
        request: error.request,
        url: error.config?.url
      });
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default {
  roles,
  dashboard,
  departments,
  employees,
  recruitment,
  transfers,
  shifts
}; 