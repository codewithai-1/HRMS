import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import { handleApiError } from '../utils/errorHandler';
import { saveToken, getToken, removeToken } from '../utils/tokenStorage';
import { UserRole } from '../types/enums';

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Types for request parameters
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  socialLogin: (provider: string) => Promise<void>;
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('AuthProvider rendering');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear error helper function
  const clearError = () => setError(null);

  // Check if user is already logged in on initial load
  useEffect(() => {
    console.log('AuthProvider useEffect running');
    let mounted = true;

    const checkAuth = async () => {
      try {
        const token = getToken();
        console.log('Token found:', !!token);
        
        if (!mounted) return;

        if (token) {
          // TODO: Replace with actual API call to validate token and get user data
          const mockUser = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: UserRole.ADMIN // Always set as ADMIN for testing
          };
          console.log('Setting user:', mockUser);
          setUser(mockUser);
        } else {
          console.log('No token found, redirecting to login');
          if (mounted) {
            navigate(config.routes.auth.login);
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        if (!mounted) return;
        
        removeToken();
        setError('Authentication failed. Please log in again.');
        if (mounted) {
          navigate(config.routes.auth.login);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Login function
  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    clearError();
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const token = 'mock-auth-token';
      saveToken(token, credentials.rememberMe || false);
      
      // Set admin user for john.doe@company.com
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: credentials.email,
        role: credentials.email === 'john.doe@company.com' ? UserRole.ADMIN : UserRole.EMPLOYEE
      };
      console.log('Setting user:', mockUser);
      setUser(mockUser);
      
      navigate(config.routes.dashboard);
    } catch (err) {
      const errorData = handleApiError(err);
      console.error('Login failed:', err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setUser(null);
    navigate(config.routes.auth.login);
  };

  // Register function
  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    clearError();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/auth/verify-email', {
        state: { email: userData.email }
      });
    } catch (err) {
      const errorData = handleApiError(err);
      console.error('Registration failed:', err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset function
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      const errorData = handleApiError(err);
      console.error('Password reset request failed:', err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(config.routes.auth.login);
    } catch (err) {
      const errorData = handleApiError(err);
      console.error('Password reset failed:', err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification function
  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate(config.routes.auth.login);
    } catch (err) {
      const errorData = handleApiError(err);
      console.error('Email verification failed:', err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email function
  const resendVerificationEmail = async (email: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      const errorData = handleApiError(err);
      console.error('Resend verification email failed:', err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login function
  const socialLogin = async (provider: string) => {
    setIsLoading(true);
    clearError();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser({
        id: '1',
        name: provider === 'github' ? 'Github User' : 'Social User',
        email: `user@${provider}.com`,
        role: UserRole.EMPLOYEE
      });
      
      navigate(config.routes.dashboard);
    } catch (err) {
      const errorData = handleApiError(err);
      console.error(`${provider} login failed:`, err);
      setError(errorData.message);
      throw new Error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create the auth value object
  const authValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loading: isLoading,
    error,
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    socialLogin,
    clearError
  };

  console.log('AuthProvider state:', { user, isLoading, error });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;