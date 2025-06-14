import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import attendanceService from '../../services/attendanceService';
import { AttendanceStats } from '../../types/attendance';

const AttendanceReports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceStats();
  }, [dateRange]);

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.attendance.getStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
      setError('Failed to load attendance statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-semibold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg')}/10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Attendance Reports</h1>
        <p className="page-subtitle">View attendance statistics and analytics</p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="card mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 form-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1 form-input"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Present Days"
            value={stats.totalPresent}
            icon={ChartBarIcon}
            color="text-green-600"
          />
          <StatCard
            title="Average Working Hours"
            value={`${stats.averageWorkingHours.toFixed(1)}h`}
            icon={ClockIcon}
            color="text-blue-600"
          />
          <StatCard
            title="Late Entries"
            value={stats.lateEntries}
            icon={ExclamationTriangleIcon}
            color="text-yellow-600"
          />
          <StatCard
            title="Permissions Taken"
            value={stats.permissions}
            icon={CalendarIcon}
            color="text-purple-600"
          />
        </div>
      ) : null}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Attendance Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Present</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${(stats.totalPresent / (stats.totalPresent + stats.totalAbsent + stats.totalHalfDay)) * 100}%`
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{stats.totalPresent}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Absent</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{
                        width: `${(stats.totalAbsent / (stats.totalPresent + stats.totalAbsent + stats.totalHalfDay)) * 100}%`
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{stats.totalAbsent}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Half Day</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${(stats.totalHalfDay / (stats.totalPresent + stats.totalAbsent + stats.totalHalfDay)) * 100}%`
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{stats.totalHalfDay}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Time Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>On Time</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${((stats.totalPresent - stats.lateEntries) / stats.totalPresent) * 100}%`
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{stats.totalPresent - stats.lateEntries}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Late Entries</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${(stats.lateEntries / stats.totalPresent) * 100}%`
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{stats.lateEntries}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Early Exits</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500"
                      style={{
                        width: `${(stats.earlyExits / stats.totalPresent) * 100}%`
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm">{stats.earlyExits}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports; 