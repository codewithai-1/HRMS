import { useState, useEffect } from 'react';
import api from '../../services/api';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
}

interface ActivityProps {
  id: number;
  title: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface EventProps {
  id: number;
  name: string;
  role: string;
  date: string;
  status: string;
  statusColor: string;
}

interface DashboardData {
  stats: StatCardProps[];
  activities: ActivityProps[];
  events: EventProps[];
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    stats: [],
    activities: [],
    events: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, activitiesResponse, eventsResponse] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getActivities(),
          api.dashboard.getEvents()
        ]);
        
        setData({
          stats: statsResponse.data,
          activities: activitiesResponse.data,
          events: eventsResponse.data
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner mb-4 mx-auto" />
          <p className="text-gray-500 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate max-w-[70%]">
                {stat.title}
              </h3>
              <span className={`text-xs font-medium ${
                stat.trendDirection === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Activity and Events Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {data.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3"
              >
                <div className={`flex-shrink-0 mt-1 ${activity.color}`}>
                  <span className="sr-only">{activity.icon}</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Events
          </h2>
          <div className="space-y-3">
            {data.events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {event.name}
                    </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {event.role}
                    </p>
                  </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                      <p className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
                    {event.date}
                  </p>
                      <p className={`text-xs mt-1 ${event.statusColor}`}>
                    {event.status}
                  </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            View all events
          </button>
        </div>
      </div>
    </div>
  );
}