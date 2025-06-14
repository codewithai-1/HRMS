import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth, { AuthProvider } from './hooks/useAuth.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './components/layout/MainLayout';
import routes from './config/routes';

// Auth pages
import Login from './pages/auth/Login';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Role Management
import RolesManagement from './pages/roles/RolesManagement';

// Department Management
import DepartmentsManagement from './pages/departments/DepartmentsManagement';

// Employee Management
import EmployeesManagement from './pages/employees/EmployeesManagement';
import EmployeeForm from './pages/employees/EmployeeForm';

// Transfer Management
import TransfersManagement from './pages/transfers/TransfersManagement';
import TransferForm from './pages/transfers/TransferForm';

// Shift Management
import ShiftsManagement from './pages/shifts/ShiftsManagement';
import ShiftForm from './pages/shifts/ShiftForm';

// Recruitment
import RecruitmentPage from './pages/recruitment/RecruitmentPage';
import JobDetails from './pages/recruitment/JobDetails';
import JobApplications from './pages/recruitment/JobApplications';
import NewJobPosting from './pages/recruitment/NewJobPosting';
import ApplicationDetails from './pages/recruitment/ApplicationDetails';

// Leave Management
import LeaveManagement from './pages/leaves/LeaveManagement';
import LeaveTypeManagement from './pages/leaves/LeaveTypeManagement';
import LeaveRequestList from './pages/leaves/LeaveRequestList';
import LeaveCalendar from './pages/leaves/LeaveCalendar';
import LeaveStatistics from './pages/leaves/LeaveStatistics';
import ApplyLeave from './pages/leaves/ApplyLeave';

// Holiday Management
import HolidayManagement from './pages/holidays/HolidayManagement';

// Attendance Management
import AttendancePage from './pages/attendance/AttendancePage';
import AttendanceCalendar from './pages/attendance/AttendanceCalendar';
import AttendanceReports from './pages/attendance/AttendanceReports';
import AttendanceSettings from './pages/attendance/AttendanceSettings';
import PermissionPage from './pages/attendance/PermissionPage';
import RegularizationPage from './pages/attendance/RegularizationPage';

// Goals Management
import GoalsList from './pages/goals/GoalsList';
import GoalsSetting from './pages/goals/GoalsSetting';
import GoalsReview from './pages/goals/GoalsReview';
import GoalsView from './pages/goals/GoalsView';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route path="/" element={<Navigate to={routes.dashboard.path} replace />} />
          
          {/* Auth routes */}
          <Route path="/auth/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />
          
          {/* Protected routes wrapped in MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path={routes.dashboard.path} element={<Dashboard />} />
            
            {/* Role Management */}
            <Route path={routes.roles.path} element={<RolesManagement />} />

            {/* Department Management */}
            <Route path={routes.departments.path} element={<DepartmentsManagement />} />

            {/* Employee Management */}
            <Route path={routes.employees.path} element={<EmployeesManagement />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />

            {/* Transfer Management */}
            <Route path="/transfers" element={<TransfersManagement />} />
            <Route path="/transfers/new" element={<TransferForm />} />
            <Route path="/transfers/:id" element={<TransferForm />} />

            {/* Shift Management */}
            <Route path={routes.shifts.path} element={<ShiftsManagement />} />
            <Route path="/shifts/new" element={<ShiftForm />} />
            <Route path="/shifts/:id" element={<ShiftForm />} />

            {/* Recruitment */}
            <Route path={routes.recruitment.path} element={<RecruitmentPage />} />
            <Route path="/recruitment/jobs/new" element={<NewJobPosting />} />
            <Route path="/recruitment/jobs/:id" element={<JobDetails />} />
            <Route path="/recruitment/jobs/:id/applications" element={<JobApplications />} />
            <Route path="/recruitment/jobs/:jobId/applications/:applicationId" element={<ApplicationDetails />} />

            {/* Leave Management */}
            <Route path={routes.leave.path} element={<LeaveManagement />}>
              <Route index element={<LeaveRequestList />} />
              <Route path="calendar" element={<LeaveCalendar />} />
              <Route path="types" element={<LeaveTypeManagement />} />
              <Route path="statistics" element={<LeaveStatistics />} />
            </Route>
            <Route path="/leave/apply" element={<ApplyLeave />} />
            <Route path="/leave/edit/:id" element={<ApplyLeave />} />

            {/* Holiday Management */}
            <Route path={routes.holidays.path} element={<HolidayManagement />} />

            {/* Attendance Management */}
            <Route path={routes.attendance.path} element={<AttendancePage />} />
            <Route path="/attendance/permission" element={<PermissionPage />} />
            <Route path="/attendance/regularization" element={<RegularizationPage />} />
            <Route path="/attendance/reports" element={<AttendanceReports />} />
            <Route path="/attendance/settings" element={<AttendanceSettings />} />

            {/* Goals Management */}
            <Route path="/goals" element={<GoalsList />} />
            <Route path="/goals/new" element={<GoalsSetting />} />
            <Route path="/goals/edit/:id" element={<GoalsSetting />} />
            <Route path="/goals/review/:id" element={<GoalsReview />} />
            <Route path="/goals/view/:id" element={<GoalsView />} />
          </Route>
          
          {/* 404 route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-slate-900 dark:text-white">404</h1>
                  <p className="text-xl mt-4 text-slate-600 dark:text-slate-400">Page not found</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="mt-6 btn btn-primary"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
