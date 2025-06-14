import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { LeaveCalendarEvent } from '../../types/leave';
import leaveService from '../../services/leaveService';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './LeaveCalendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const LeaveCalendar: React.FC = () => {
  const [events, setEvents] = useState<LeaveCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        console.log('Starting to fetch leave requests...');
        
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2);

        const dateRange = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };
        
        console.log('Fetching leave requests with date range:', dateRange);

        const response = await leaveService.leaveRequests.getAll(dateRange);

        if (!response || !response.data) {
          throw new Error('No data received from the server');
        }

        console.log('Received leave requests:', response.data);

        if (!Array.isArray(response.data)) {
          throw new Error('Expected an array of leave requests but received: ' + typeof response.data);
        }

        // Transform leave requests into calendar events
        const calendarEvents = response.data.map(leave => {
          try {
            // Parse the date strings into Date objects
            const start = new Date(leave.startDate + 'T00:00:00');
            const end = new Date(leave.endDate + 'T23:59:59');

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              throw new Error(`Invalid date for leave request ${leave.id}: start=${leave.startDate}, end=${leave.endDate}`);
            }

            const event = {
              ...leave,
              title: `${leave.employeeName} - ${leave.leaveType?.name || 'Leave'}`,
              start,
              end
            };

            console.log('Created calendar event:', event);
            return event;
          } catch (err) {
            console.error('Error processing leave request:', leave, err);
            return null;
          }
        }).filter(Boolean) as LeaveCalendarEvent[];

        console.log('Final calendar events:', calendarEvents);
        setEvents(calendarEvents);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
        console.error('Error fetching leave requests:', {
          error: err,
          message: errorMessage,
          response: err.response,
          stack: err.stack
        });
        setError(`Failed to load leave calendar: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const eventStyleGetter = (event: LeaveCalendarEvent) => {
    let backgroundColor = '#3b82f6'; // Default blue

    switch (event.status) {
      case 'APPROVED':
        backgroundColor = '#22c55e';
        break;
      case 'REJECTED':
        backgroundColor = '#ef4444';
        break;
      case 'CANCELLED':
        backgroundColor = '#94a3b8';
        break;
      case 'PENDING':
        backgroundColor = '#f59e0b';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
        padding: '2px 4px'
      }
    };
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 250px)' }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
        tooltipAccessor={event => `${event.employeeName} - ${event.reason}`}
        formats={{
          eventTimeRangeFormat: () => '', // Hide time range in event title
          timeGutterFormat: (date: Date, culture?: string, localizer?: any) => 
            localizer.format(date, 'HH:mm', culture)
        }}
      />
    </div>
  );
};

export default LeaveCalendar; 