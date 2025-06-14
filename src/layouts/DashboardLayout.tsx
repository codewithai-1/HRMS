import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Bars3Icon,
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import Sidebar from '../components/layout/Sidebar';
import useAuth from '../hooks/useAuth';
import attendanceService from '../services/attendanceService';
import './DashboardLayout.css';

const DashboardLayout = ({ children }: { children?: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 730);
  const [notifications, setNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<{ clockIn: string | null; clockOut: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      console.log('Fetching attendance status...');
      const response = await attendanceService.attendance.getStatus();
      console.log('Attendance status response:', response.data);
      setAttendanceStatus(response.data);
    } catch (err: any) {
      console.error('Error fetching attendance status:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      // Show error to user
      alert('Failed to fetch attendance status. Please refresh the page.');
    }
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      await attendanceService.attendance.clockIn();
      await fetchAttendanceStatus();
    } catch (err) {
      console.error('Error clocking in:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      console.log('Attempting to clock out...');
      const response = await attendanceService.attendance.clockOut();
      console.log('Clock out response:', response);
      await fetchAttendanceStatus();
    } catch (err: any) {
      console.error('Error clocking out:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      // Show error to user
      alert('Failed to clock out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/auth/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 730);
      setSidebarOpen(width >= 730);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          {/* Left section */}
          <div className="header-left">
            {isMobile && (
              <button
                className="menu-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            
            <img 
              src="/GX-Thofa-Logo.png"
              alt="GenX Thofa" 
              className="logo"
            />
          </div>

          {/* Center section */}
          <div className="header-center">             
            <img 
              src="/Staffin-Blue-Black-Logo.png"
              alt="StaffIn"
              className="title-logo"
            />
          </div>

          {/* Right section */}
          <div className="header-controls">
            <div className="flex items-center gap-4">
              {/* Clock Section */}
              <div className="clock-section">
                <ClockIcon className="clock-icon" />
                <div>
                  <div className="clock-time">
                    {format(currentTime, 'hh:mm:ss a')}
                  </div>
                  <div className="clock-date">
                    {format(currentTime, 'EEEE, MMMM d')}
                  </div>
                </div>
              </div>

              {/* Clock In/Out Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClockIn}
                  disabled={loading || !!attendanceStatus?.clockIn}
                  className="clock-button clock-in"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Clock In</span>
                </button>
                <button
                  onClick={handleClockOut}
                  disabled={loading || !attendanceStatus?.clockIn || !!attendanceStatus?.clockOut}
                  className="clock-button clock-out"
                >
                  <ArrowUpTrayIcon className="w-4 h-4" />
                  <span>Clock Out</span>
                </button>
                {attendanceStatus?.clockOut && (
                  <div className="text-xs text-white/80">
                    Clocked out at {format(new Date(attendanceStatus.clockOut), 'hh:mm a')}
                  </div>
                )}
              </div>
            </div>

            <button 
              className="notification-button"
              onClick={() => setNotifications(notifications + 1)}
            >
              <BellIcon className="notification-icon" />
              {notifications > 0 && (
                <span className="notification-badge">
                  {notifications}
                </span>
              )}
            </button>
            
            <div className="relative">
              <button 
                className="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <UserCircleIcon className="profile-icon" />
              </button>

              {showProfileMenu && (
                <div className="profile-menu">
                  <button className="profile-menu-item" onClick={() => navigate('/profile')}>
                    <UserCircleIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  <button className="profile-menu-item" onClick={() => navigate('/settings')}>
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  <button className="profile-menu-item text-red-600" onClick={handleLogout}>
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="main-content">
        <Sidebar 
          isOpen={sidebarOpen}
          isMobile={isMobile}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <main className="content-area">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 