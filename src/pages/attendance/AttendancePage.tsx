import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import attendanceService from '../../services/attendanceService';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';
import './attendance.css';

interface FilterState {
  status: string[];
  lateArrival: boolean;
  earlyDeparture: boolean;
  hasPermission: boolean;
  hasShortage: boolean;
  hasExcess: boolean;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    lateArrival: false,
    earlyDeparture: false,
    hasPermission: false,
    hasShortage: false,
    hasExcess: false
  });

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [currentMonth]);

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const response = await attendanceService.attendance.getRecords({
        startDate,
        endDate
      });
      
      setMonthlyAttendance(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
      setError('Failed to load monthly attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'status-badge present';
      case AttendanceStatus.LATE:
        return 'status-badge late';
      case AttendanceStatus.ABSENT:
        return 'status-badge absent';
      case AttendanceStatus.HALF_DAY:
        return 'status-badge half-day';
      case AttendanceStatus.ON_LEAVE:
        return 'status-badge on-leave';
      case AttendanceStatus.ON_PERMISSION:
        return 'status-badge on-permission';
      default:
        return 'status-badge';
    }
  };

  const filteredAttendance = monthlyAttendance.filter(record => {
    if (filters.status.length > 0 && !filters.status.includes(record.status)) {
      return false;
    }
    if (filters.lateArrival && record.lateMinutes === 0) {
      return false;
    }
    if (filters.earlyDeparture && record.earlyExitMinutes === 0) {
      return false;
    }
    if (filters.hasPermission && record.status !== AttendanceStatus.ON_PERMISSION) {
      return false;
    }
    if (filters.hasShortage && record.totalHours >= 8) {
      return false;
    }
    if (filters.hasExcess && record.totalHours <= 8) {
      return false;
    }
    return true;
  });

  return (
    <div className="attendance-container">
      {/* Header Section */}
      <div className="attendance-header">
        <div className="attendance-title">
          <h1>Attendance Management</h1>
          <p className="text-subtitle">Track and manage your daily attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
          <span className="text-gray-600">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="attendance-content">
        {/* Actions Card */}
        <div className="attendance-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(true)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={() => navigate('/attendance/regularization')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <ClockIcon className="w-5 h-5" />
                Regularization Requests
              </button>
              <button
                onClick={() => navigate('/attendance/permission')}
                className="btn btn-secondary flex items-center gap-2"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Permission Requests
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="attendance-card">
          <h2 className="section-title">Attendance Records</h2>
          <div className="overflow-x-auto">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                  <th>Hours</th>
                  <th>Late By</th>
                  <th>Early Exit</th>
                  <th>Shortage/Excess</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner" />
                      </div>
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map(record => (
                    <tr key={record.id}>
                      <td>{format(new Date(record.date), 'dd MMM yyyy')}</td>
                      <td>
                        <span className={getStatusBadgeClass(record.status)}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.clockIn ? format(new Date(record.clockIn), 'hh:mm a') : '-'}</td>
                      <td>{record.clockOut ? format(new Date(record.clockOut), 'hh:mm a') : '-'}</td>
                      <td>{record.totalHours.toFixed(2)}</td>
                      <td>{record.lateMinutes > 0 ? `${record.lateMinutes} min` : '-'}</td>
                      <td>{record.earlyExitMinutes > 0 ? `${record.earlyExitMinutes} min` : '-'}</td>
                      <td>
                        {record.totalHours < 8 ? `${(8 - record.totalHours).toFixed(2)}h short` : 
                         record.totalHours > 8 ? `${(record.totalHours - 8).toFixed(2)}h excess` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      {showFilters && (
        <div className="filter-dialog-backdrop">
          <div className="filter-dialog">
            <div className="filter-dialog-header">
              <h2>Filter Attendance Records</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="close-button"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="filter-dialog-content">
              {/* Month Filter */}
              <div className="filter-group">
                <label className="filter-label">Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                  <option value="on-permission">On Permission</option>
                </select>
              </div>

              {/* Department Filter */}
              <div className="filter-group">
                <label className="filter-label">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Departments</option>
                  <option value="it">IT</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
            </div>

            <div className="filter-dialog-footer">
              <button
                onClick={() => {
                  setSelectedMonth(format(new Date(), 'yyyy-MM'));
                  setSelectedStatus('all');
                  setSelectedDepartment('all');
                }}
                className="btn btn-secondary"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  fetchMonthlyAttendance();
                  setShowFilters(false);
                }}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage; 