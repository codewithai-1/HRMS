import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';

const MainLayout = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default MainLayout; 