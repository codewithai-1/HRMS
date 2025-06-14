import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  children?: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-200 to-sky-200 dark:from-blue-900 dark:to-blue-95">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-240 h-130 p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-700">
          {children || <Outlet />}
        </div>
      </main>
      
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        &copy; {new Date().getFullYear()} StaffIn. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout; 