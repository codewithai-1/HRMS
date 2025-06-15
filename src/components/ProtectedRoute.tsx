import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.tsx';
import config from '../config';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const auth = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!auth.isAuthenticated) {
    // Pass the current location to redirect back after login
    return <Navigate to={config.routes.auth.login} state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && auth.user?.role !== requiredRole) {
    return <Navigate to={config.routes.dashboard} replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 