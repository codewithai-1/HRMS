import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth.tsx';
import config from '../../config';
import './Login.css';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || config.routes.dashboard;
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  
  const onSubmit = async (data: LoginForm) => {
    setError(null);
    
    try {
      await auth.login(data);
      // Navigation is handled by the login function
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="decorative-circle decorative-circle-1" />
        <div className="decorative-circle decorative-circle-2" />
        
        <div className="login-card">
          <div className="logo-container">
            <div className="logo-wrapper">
              <div className="logo-inner">
                <img 
                  src="/GX-Thofa-Logo.png" 
                  alt="GX Thofa Logo" 
                  className="logo-login-size"
                />
              </div>
            </div>
            <h1 className="welcome-text">
              Welcome to
              <img 
                src="/Staffin-Blue-Black-Logo.png" 
                alt="StaffIn logo" 
              />
            </h1>
            <p className="signin-text">
              Sign in to your account
            </p>
          </div>
          
          {error && (
            <div className="error-message">
              <div className="flex">
                <ExclamationCircleIcon className="error-icon" />
                <div className="error-text">
                  {error}
                </div>
              </div>
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="input-error">{errors.email.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  {...register('password', { 
                    required: 'Password is required'
                  })}
                />
              </div>
              {errors.password && (
                <p className="input-error">{errors.password.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || auth.loading}
              className="submit-button"
            >
              <span className="relative flex items-center justify-center">
                {(isSubmitting || auth.loading) && (
                  <svg 
                    className="loading-spinner" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                Sign In
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;