import React, { Suspense } from 'react';
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

// Recognition Management
import RecognitionDashboard from './pages/recognition/RecognitionDashboard';
import NominationForm from './pages/recognition/NominationForm';
import WinnersGallery from './pages/recognition/WinnersGallery';
import MyNominations from './pages/recognition/MyNominations';

// Email Configuration
import EmailConfiguration from './pages/settings/EmailConfiguration';
import EmailTemplatesManagement from './pages/settings/EmailTemplatesManagement';
import EmailVariablesAndTriggers from './pages/settings/EmailVariablesAndTriggers';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

const App = () => {
  console.log('App component rendering');
  
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/auth/login" element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              } />
              
              {/* Redirect root to login if not authenticated */}
              <Route path="/" element={<Navigate to="/auth/login" replace />} />

              {/* Dashboard only */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* All other modules at root level, wrapped in ProtectedRoute and MainLayout */}
              <Route path="/roles" element={<ProtectedRoute><MainLayout><RolesManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute><MainLayout><DepartmentsManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><MainLayout><EmployeesManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/employees/new" element={<ProtectedRoute><MainLayout><EmployeeForm /></MainLayout></ProtectedRoute>} />
              <Route path="/employees/:id/edit" element={<ProtectedRoute><MainLayout><EmployeeForm /></MainLayout></ProtectedRoute>} />
              <Route path="/transfers" element={<ProtectedRoute><MainLayout><TransfersManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/transfers/new" element={<ProtectedRoute><MainLayout><TransferForm /></MainLayout></ProtectedRoute>} />
              <Route path="/transfers/:id" element={<ProtectedRoute><MainLayout><TransferForm /></MainLayout></ProtectedRoute>} />
              <Route path="/shifts" element={<ProtectedRoute><MainLayout><ShiftsManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/shifts/new" element={<ProtectedRoute><MainLayout><ShiftForm /></MainLayout></ProtectedRoute>} />
              <Route path="/shifts/:id" element={<ProtectedRoute><MainLayout><ShiftForm /></MainLayout></ProtectedRoute>} />
              <Route path="/recruitment" element={<ProtectedRoute><MainLayout><RecruitmentPage /></MainLayout></ProtectedRoute>} />
              <Route path="/recruitment/jobs/new" element={<ProtectedRoute><MainLayout><NewJobPosting /></MainLayout></ProtectedRoute>} />
              <Route path="/recruitment/jobs/:id" element={<ProtectedRoute><MainLayout><JobDetails /></MainLayout></ProtectedRoute>} />
              <Route path="/recruitment/jobs/:id/applications" element={<ProtectedRoute><MainLayout><JobApplications /></MainLayout></ProtectedRoute>} />
              <Route path="/recruitment/jobs/:jobId/applications/:applicationId" element={<ProtectedRoute><MainLayout><ApplicationDetails /></MainLayout></ProtectedRoute>} />
              <Route path="/leave" element={<ProtectedRoute><MainLayout><LeaveManagement /></MainLayout></ProtectedRoute>} >
                <Route index element={<LeaveRequestList />} />
                <Route path="calendar" element={<LeaveCalendar />} />
                <Route path="types" element={<LeaveTypeManagement />} />
                <Route path="statistics" element={<LeaveStatistics />} />
              </Route>
              <Route path="/leave/apply" element={<ProtectedRoute><MainLayout><ApplyLeave /></MainLayout></ProtectedRoute>} />
              <Route path="/leave/edit/:id" element={<ProtectedRoute><MainLayout><ApplyLeave /></MainLayout></ProtectedRoute>} />
              <Route path="/holidays" element={<ProtectedRoute><MainLayout><HolidayManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><MainLayout><AttendancePage /></MainLayout></ProtectedRoute>} />
              <Route path="/attendance/permission" element={<ProtectedRoute><MainLayout><PermissionPage /></MainLayout></ProtectedRoute>} />
              <Route path="/attendance/regularization" element={<ProtectedRoute><MainLayout><RegularizationPage /></MainLayout></ProtectedRoute>} />
              <Route path="/attendance/reports" element={<ProtectedRoute><MainLayout><AttendanceReports /></MainLayout></ProtectedRoute>} />
              <Route path="/attendance/settings" element={<ProtectedRoute><MainLayout><AttendanceSettings /></MainLayout></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><MainLayout><GoalsList /></MainLayout></ProtectedRoute>} />
              <Route path="/goals/new" element={<ProtectedRoute><MainLayout><GoalsSetting /></MainLayout></ProtectedRoute>} />
              <Route path="/goals/edit/:id" element={<ProtectedRoute><MainLayout><GoalsSetting /></MainLayout></ProtectedRoute>} />
              <Route path="/goals/review/:id" element={<ProtectedRoute><MainLayout><GoalsReview /></MainLayout></ProtectedRoute>} />
              <Route path="/goals/view/:id" element={<ProtectedRoute><MainLayout><GoalsView /></MainLayout></ProtectedRoute>} />
              <Route path="/recognition" element={<ProtectedRoute><MainLayout><RecognitionDashboard /></MainLayout></ProtectedRoute>} >
                <Route index element={<RecognitionDashboard />} />
                <Route path="nominate" element={<NominationForm />} />
                <Route path="winners" element={<WinnersGallery />} />
                <Route path="my-nominations" element={<MyNominations />} />
              </Route>
              <Route path="/settings/email" element={<ProtectedRoute><MainLayout><EmailConfiguration /></MainLayout></ProtectedRoute>} />
              <Route path="/settings/email/templates" element={<ProtectedRoute><MainLayout><EmailTemplatesManagement /></MainLayout></ProtectedRoute>} />
              <Route path="/settings/email/variables-triggers" element={<ProtectedRoute><MainLayout><EmailVariablesAndTriggers /></MainLayout></ProtectedRoute>} />

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
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
