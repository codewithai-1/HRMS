import axios from 'axios';
import {
  Holiday,
  HolidayList,
  HolidayFormData,
  HolidayListFormData,
  HolidayStatus,
  HolidayListResponse,
  HolidayResponse,
  HolidayListDetailResponse
} from '../types/holiday';

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

// Holiday Lists endpoints
export const holidayLists = {
  getAll: (params?: { 
    status?: HolidayStatus,
    year?: number
  }) => api.get<HolidayListResponse>('/holiday-lists', { params }),
  
  getById: (id: string) =>
    api.get<HolidayListDetailResponse>(`/holiday-lists/${id}`),
  
  create: (data: HolidayListFormData) =>
    api.post<HolidayList>('/holiday-lists', data),
  
  update: (id: string, data: Partial<HolidayListFormData>) =>
    api.put<HolidayList>(`/holiday-lists/${id}`, data),
  
  publish: (id: string) =>
    api.put<HolidayList>(`/holiday-lists/${id}/publish`),
  
  archive: (id: string) =>
    api.put<HolidayList>(`/holiday-lists/${id}/archive`),
  
  delete: (id: string) =>
    api.delete(`/holiday-lists/${id}`)
};

// Holidays endpoints
export const holidays = {
  getAll: (listId: string) =>
    api.get<Holiday[]>(`/holiday-lists/${listId}/holidays`),
  
  getById: (listId: string, holidayId: string) =>
    api.get<HolidayResponse>(`/holiday-lists/${listId}/holidays/${holidayId}`),
  
  create: (listId: string, data: HolidayFormData) =>
    api.post<Holiday>(`/holiday-lists/${listId}/holidays`, data),
  
  createBatch: (listId: string, holidays: HolidayFormData[]) =>
    api.post<Holiday[]>(`/holiday-lists/${listId}/holidays/batch`, { holidays }),
  
  update: (listId: string, holidayId: string, data: Partial<HolidayFormData>) =>
    api.put<Holiday>(`/holiday-lists/${listId}/holidays/${holidayId}`, data),
  
  delete: (listId: string, holidayId: string) =>
    api.delete(`/holiday-lists/${listId}/holidays/${holidayId}`)
};

export default {
  holidayLists,
  holidays
}; 