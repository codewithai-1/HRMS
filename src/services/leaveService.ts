import axios from 'axios';
import {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  LeaveTypeFormData,
  LeaveRequestFormData,
  LeaveBalanceOverride,
  LeaveStatus,
  LeaveBalanceResponse,
  LeaveUsageReport
} from '../types/leave';

const api = axios.create({
  baseURL: 'http://localhost:8090',
  timeout: 30000,
});

// Add request logging interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', {
      method: config.method,
      url: config.url,
      params: config.params,
      baseURL: config.baseURL,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response logging interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Received API response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Leave Types endpoints
export const leaveTypes = {
  getAll: () => 
    api.get<LeaveType[]>('/leave-types'),
  
  getById: (id: string) =>
    api.get<LeaveType>(`/leave-types/${id}`),
  
  create: (data: LeaveTypeFormData) =>
    api.post<LeaveType>('/leave-types', data),
  
  update: (id: string, data: Partial<LeaveTypeFormData>) =>
    api.put<LeaveType>(`/leave-types/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/leave-types/${id}`)
};

// Leave Requests endpoints
export const leaveRequests = {
  getAll: (params?: { 
    status?: LeaveStatus,
    employeeId?: string,
    managerId?: string,
    startDate?: string,
    endDate?: string
  }) => {
    console.log('Calling leaveRequests.getAll with params:', params);
    return api.get<LeaveRequest[]>('/leave-requests', { params });
  },
  
  getById: (id: string) =>
    api.get<LeaveRequest>(`/leave-requests/${id}`),
  
  create: (data: LeaveRequestFormData) =>
    api.post<LeaveRequest>('/leave-requests', data),
  
  update: (id: string, data: Partial<LeaveRequestFormData>) =>
    api.put<LeaveRequest>(`/leave-requests/${id}`, data),
  
  updateStatus: (id: string, status: LeaveStatus, comments?: string) =>
    api.put<LeaveRequest>(`/leave-requests/${id}/status`, { status, comments }),
  
  cancel: (id: string) =>
    api.put<LeaveRequest>(`/leave-requests/${id}/cancel`, {})
};

// Leave Balances endpoints
export const leaveBalances = {
  getAll: () =>
    api.get<LeaveBalance[]>('/leave-balances'),
    
  getEmployeeBalances: (employeeId: string) =>
    api.get<LeaveBalance[]>(`/leave-balances/employee/${employeeId}`),
  
  getTeamBalances: (managerId: string) =>
    api.get<LeaveBalanceResponse[]>(`/leave-balances/team/${managerId}`),
  
  override: (data: LeaveBalanceOverride) =>
    api.post<LeaveBalance>('/leave-balances/override', data)
};

// Leave Calendar endpoints
export const leaveCalendar = {
  getTeamCalendar: (managerId: string, startDate: string, endDate: string) =>
    api.get<LeaveRequest[]>('/leave-calendar/team', {
      params: { managerId, startDate, endDate }
    }),
  
  getDepartmentCalendar: (departmentId: string, startDate: string, endDate: string) =>
    api.get<LeaveRequest[]>('/leave-calendar/department', {
      params: { departmentId, startDate, endDate }
    })
};

// Leave Reports endpoints
export const leaveReports = {
  getLeaveUsage: (params: {
    departmentId?: string,
    startDate: string,
    endDate: string
  }) => api.get<LeaveUsageReport>('/leave-reports/usage', { params }),
  
  getLeaveBalances: (params: {
    departmentId?: string,
    year: number
  }) => api.get<LeaveBalanceResponse[]>('/leave-reports/balances', { params })
};

export default {
  leaveTypes,
  leaveRequests,
  leaveBalances,
  leaveCalendar,
  leaveReports
}; 