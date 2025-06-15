import { ReactNode } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default MainLayout; 