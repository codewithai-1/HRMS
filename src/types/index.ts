// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

// Dashboard types
export interface DashboardStats {
  summary: {
    title: string;
    description: string;
  };
}

// API Error type
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
} 