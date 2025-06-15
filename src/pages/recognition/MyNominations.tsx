import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import recognitionService from '../../services/recognitionService';
import { Category, Nomination, NominationStatus } from '../../types/recognition';
import { useAuth } from '../../hooks/useAuth';
import './MyNominations.css';

const MyNominations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nominationsRes, categoriesRes] = await Promise.all([
        recognitionService.getNominationsByNominator(user?.id || ''),
        recognitionService.getAllCategories()
      ]);

      setNominations(nominationsRes);
      setCategories(categoriesRes);
      setError(null);
    } catch (err) {
      console.error('Error fetching nominations data:', err);
      setError('Failed to load nominations data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: NominationStatus) => {
    switch (status) {
      case NominationStatus.PENDING:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case NominationStatus.UNDER_REVIEW:
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      case NominationStatus.APPROVED:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case NominationStatus.REJECTED:
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case NominationStatus.WINNER:
        return <TrophyIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: NominationStatus) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            className="btn btn-primary"
            onClick={fetchData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-nominations">
      <div className="page-header">
        <button
          className="btn btn-text"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1>My Nominations</h1>
      </div>

      <div className="nominations-list">
        {nominations.length === 0 ? (
          <div className="empty-state">
            <p>You haven't submitted any nominations yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/recognition/nominate')}
            >
              Submit a Nomination
            </button>
          </div>
        ) : (
          nominations.map(nomination => (
            <div key={nomination.id} className="nomination-card">
              <div className="nomination-header">
                <div className="nomination-category">
                  {categories.find(c => c.id === nomination.categoryId)?.name}
                </div>
                <div className="nomination-status">
                  {getStatusIcon(nomination.status)}
                  <span>{getStatusText(nomination.status)}</span>
                </div>
              </div>
              <div className="nomination-content">
                <p className="nomination-justification">{nomination.justification}</p>
                {nomination.managerComments && (
                  <div className="manager-comments">
                    <h4>Manager Comments</h4>
                    <p>{nomination.managerComments}</p>
                  </div>
                )}
              </div>
              <div className="nomination-footer">
                <span className="nomination-date">
                  Submitted on {new Date(nomination.submittedAt).toLocaleDateString()}
                </span>
                {nomination.reviewedAt && (
                  <span className="review-date">
                    Reviewed on {new Date(nomination.reviewedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyNominations; 