import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  PlusIcon,
  TrophyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import recognitionService from '../../services/recognitionService';
import { Category, Nomination, Winner, RecognitionStats } from '../../types/recognition';
import { useAuth } from '../../hooks/useAuth';
import './RecognitionDashboard.css';

const RecognitionDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState<RecognitionStats>({
    totalNominations: 0,
    pendingNominations: 0,
    approvedNominations: 0,
    rejectedNominations: 0,
    totalWinners: 0,
    recentWinners: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we're on a nested route
  const isNestedRoute = location.pathname !== '/dashboard/recognition';

  useEffect(() => {
    if (user && !isNestedRoute) {
      fetchDashboardData();
    }
  }, [user, isNestedRoute]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, nominationsRes, winnersRes] = await Promise.all([
        recognitionService.getAllCategories(),
        recognitionService.getAllNominations(),
        recognitionService.getAllWinners()
      ]);

      setCategories(categoriesRes);
      setNominations(nominationsRes);
      setWinners(winnersRes);

      // Calculate stats
      const stats: RecognitionStats = {
        totalNominations: nominationsRes.length,
        pendingNominations: nominationsRes.filter(n => n.status === 'pending').length,
        approvedNominations: nominationsRes.filter(n => n.status === 'approved').length,
        rejectedNominations: nominationsRes.filter(n => n.status === 'rejected').length,
        totalWinners: winnersRes.length,
        recentWinners: winnersRes
          .sort((a, b) => new Date(b.announcedAt).getTime() - new Date(a.announcedAt).getTime())
          .slice(0, 3)
      };
      setStats(stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNestedRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !isNestedRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            className="btn btn-primary"
            onClick={fetchDashboardData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If we're on a nested route, only render the Outlet
  if (isNestedRoute) {
    return <Outlet />;
  }

  // Otherwise, render the dashboard content
  return (
    <div className="recognition-dashboard">
      <div className="dashboard-header">
        <h1>Employee Recognition</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard/recognition/nominate')}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Nomination
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          <div className="stat-content">
            <h3>Total Nominations</h3>
            <p>{stats.totalNominations}</p>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
          <div className="stat-content">
            <h3>Approved</h3>
            <p>{stats.approvedNominations}</p>
          </div>
        </div>
        <div className="stat-card">
          <ClockIcon className="w-6 h-6 text-blue-500" />
          <div className="stat-content">
            <h3>Under Review</h3>
            <p>{stats.pendingNominations}</p>
          </div>
        </div>
        <div className="stat-card">
          <UserGroupIcon className="w-6 h-6 text-purple-500" />
          <div className="stat-content">
            <h3>Categories</h3>
            <p>{categories.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Winners</h2>
            <button
              className="btn btn-text"
              onClick={() => navigate('/dashboard/recognition/winners')}
            >
              View All
            </button>
          </div>
          <div className="winners-list">
            {stats.recentWinners.map(winner => (
              <div key={winner.id} className="winner-item">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                <div className="winner-info">
                  <h4>{winner.period}</h4>
                  <p>{categories.find(c => c.id === winner.categoryId)?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Nominations</h2>
            <button
              className="btn btn-text"
              onClick={() => navigate('/dashboard/recognition/my-nominations')}
            >
              View All
            </button>
          </div>
          <div className="nominations-list">
            {nominations
              .filter(n => n.nominatorId === user?.id)
              .slice(0, 3)
              .map(nomination => (
                <div key={nomination.id} className="nomination-item">
                  <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                  <div className="nomination-info">
                    <h4>{categories.find(c => c.id === nomination.categoryId)?.name}</h4>
                    <p className="nomination-status">{nomination.status}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecognitionDashboard; 