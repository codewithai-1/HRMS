import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import useAuth from '../../hooks/useAuth.tsx';
import config from '../../config';

const EmailVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  
  const auth = useAuth();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  
  // If token exists, verify it on mount
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      // Try to get email from location state
      const locationState = location.state as { email?: string } | null;
      if (locationState?.email) {
        setEmail(locationState.email);
      }
    }
  }, [token, location]);
  
  const verifyEmail = async (verificationToken: string) => {
    setVerifying(true);
    setError(null);
    
    try {
      await auth.verifyEmail(verificationToken);
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Failed to verify your email');
    } finally {
      setVerifying(false);
    }
  };
  
  const resendVerificationEmail = async () => {
    if (!email) return;
    
    setError(null);
    
    try {
      await auth.resendVerificationEmail(email);
      
      // Show success message
      setError('Verification email sent. Please check your inbox.');
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification email');
    }
  };
  
  // Show verification in progress
  if (verifying) {
    return (
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="animate-pulse flex justify-center items-center">
            <EnvelopeIcon className="h-12 w-12 text-primary-500" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verifying your email...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md w-full space-y-8">
      {/* Header */}
      <div className="text-center">
        <img 
          src="/logo.svg" 
          alt="Logo" 
          className="mx-auto h-12 w-auto" 
        />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          {success ? 'Email Verified!' : 'Verify Your Email'}
        </h2>
        {!success && !token && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification link to{' '}
            <span className="font-medium">{email || 'your email address'}</span>.
            Please check your inbox and click the link to verify your account.
          </p>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className={`rounded-md ${error.includes('sent') ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} p-4`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {error.includes('sent') ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${error.includes('sent') ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your email has been verified successfully. You will be redirected to the login page shortly.
            </p>
            <div className="mt-5">
              <Link
                to={config.routes.auth.login}
                className="btn btn-primary w-full"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!success && !token && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try resending it.
            </p>
          </div>
          
          <div>
            <button
              onClick={resendVerificationEmail}
              disabled={auth.loading || !email}
              className="btn btn-primary w-full py-3 flex justify-center"
            >
              {auth.loading ? (
                <svg 
                  className="animate-spin h-5 w-5 mr-2 text-white" 
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
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              Resend Verification Email
            </button>
          </div>
          
          <div className="text-center">
            <Link
              to={config.routes.auth.login}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Back to login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification; 