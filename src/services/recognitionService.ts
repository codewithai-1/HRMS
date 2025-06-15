import axios, { AxiosError, AxiosResponse } from 'axios';
import { Category, Nomination, Winner } from '../types/recognition';
import config from '../config';
import { getToken } from '../utils/tokenStorage';
import { handleApiError } from '../utils/errorHandler';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorData = handleApiError(error);
    return Promise.reject(errorData);
  }
);

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

const recognitionService = {
  // Categories
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response: AxiosResponse<Category[]> = await api.get('/categories');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCategoryById: async (id: string): Promise<Category> => {
    try {
      const response: AxiosResponse<Category> = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Nominations
  getAllNominations: async (): Promise<Nomination[]> => {
    try {
      const response: AxiosResponse<Nomination[]> = await api.get('/nominations');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getNominationById: async (id: string): Promise<Nomination> => {
    try {
      const response: AxiosResponse<Nomination> = await api.get(`/nominations/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getNominationsByEmployee: async (employeeId: string): Promise<Nomination[]> => {
    try {
      const response: AxiosResponse<Nomination[]> = await api.get('/nominations', {
        params: { nomineeId: employeeId }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getNominationsByNominator: async (nominatorId: string): Promise<Nomination[]> => {
    try {
      const response: AxiosResponse<Nomination[]> = await api.get('/nominations', {
        params: { nominatorId }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createNomination: async (nomination: Omit<Nomination, 'id' | 'submittedAt' | 'status'>): Promise<Nomination> => {
    try {
      const response: AxiosResponse<Nomination> = await api.post('/nominations', {
        ...nomination,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateNomination: async (id: string, nomination: Partial<Nomination>): Promise<Nomination> => {
    try {
      const response: AxiosResponse<Nomination> = await api.patch(`/nominations/${id}`, nomination);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  reviewNomination: async (id: string, status: 'approved' | 'rejected', comments: string): Promise<Nomination> => {
    try {
      const response: AxiosResponse<Nomination> = await api.patch(`/nominations/${id}`, {
        status,
        managerComments: comments,
        reviewedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Winners
  getAllWinners: async (): Promise<Winner[]> => {
    try {
      const response: AxiosResponse<Winner[]> = await api.get('/winners');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getWinnersByPeriod: async (period: string): Promise<Winner[]> => {
    try {
      const response: AxiosResponse<Winner[]> = await api.get('/winners', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createWinner: async (winner: Omit<Winner, 'id' | 'announcedAt'>): Promise<Winner> => {
    try {
      const response: AxiosResponse<Winner> = await api.post('/winners', {
        ...winner,
        announcedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // File Upload
  uploadDocument: async (file: File): Promise<{ url: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response: AxiosResponse<{ url: string }> = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

export default recognitionService; 