import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import attendanceService from '../../services/attendanceService';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance';

const AttendanceCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [currentDate]);

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      const response = await attendanceService.attendance.getRecords({
        startDate,
        endDate
      });
      
      setAttendanceRecords(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-green-100 text-green-800';
      case AttendanceStatus.LATE:
        return 'bg-yellow-100 text-yellow-800';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800';
      case AttendanceStatus.HALF_DAY:
        return 'bg-blue-100 text-blue-800';
      case AttendanceStatus.ON_LEAVE:
        return 'bg-purple-100 text-purple-800';
      case AttendanceStatus.ON_PERMISSION:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDayAttendance = (date: Date) => {
    return attendanceRecords.find(record => 
      isSameDay(new Date(record.date), date)
    );
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Attendance Calendar</h1>
        <p className="page-subtitle">View and track your monthly attendance</p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const attendance = getDayAttendance(day);
              return (
                <div
                  key={day.toString()}
                  className={`
                    min-h-[100px] p-2 border rounded-lg
                    ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : ''}
                  `}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'd')}
                  </div>
                  {attendance && (
                    <div className={`mt-1 text-xs rounded-full px-2 py-1 inline-block ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </div>
                  )}
                  {attendance?.clockIn && (
                    <div className="mt-1 text-xs text-gray-600">
                      In: {format(new Date(attendance.clockIn), 'HH:mm')}
                      {attendance.clockOut && (
                        <><br />Out: {format(new Date(attendance.clockOut), 'HH:mm')}</>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="loading-spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCalendar; 