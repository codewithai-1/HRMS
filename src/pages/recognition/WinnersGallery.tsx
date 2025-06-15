import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TrophyIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import recognitionService from '../../services/recognitionService';
import { Category, Winner } from '../../types/recognition';
import './WinnersGallery.css';

const WinnersGallery: React.FC = () => {
  const navigate = useNavigate();
  const [winners, setWinners] = useState<Winner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [winnersRes, categoriesRes] = await Promise.all([
        recognitionService.getAllWinners(),
        recognitionService.getAllCategories()
      ]);

      setWinners(winnersRes);
      setCategories(categoriesRes);
      setError(null);
    } catch (err) {
      console.error('Error fetching winners data:', err);
      setError('Failed to load winners data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredWinners = () => {
    if (selectedPeriod === 'all') {
      return winners;
    }
    return winners.filter(winner => winner.period === selectedPeriod);
  };

  const getUniquePeriods = () => {
    const periods = winners.map(winner => winner.period);
    return ['all', ...new Set(periods)].sort().reverse();
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
    <div className="winners-gallery">
      <div className="gallery-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon className="icon" />
          Back
        </button>
        <h1>Winners Gallery</h1>
      </div>

      <div className="period-filter">
        <label htmlFor="period">Filter by Period:</label>
        <select
          id="period"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="form-select"
        >
          {getUniquePeriods().map(period => (
            <option key={period} value={period}>
              {period === 'all' ? 'All Periods' : period}
            </option>
          ))}
        </select>
      </div>

      <div className="winners-grid">
        {getFilteredWinners().map(winner => {
          const category = categories.find(c => c.id === winner.categoryId);
          return (
            <div key={winner.id} className="winner-card">
              <div className="winner-header">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
                <div className="winner-period">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{winner.period}</span>
                </div>
              </div>
              <div className="winner-content">
                <h3>{category?.name}</h3>
                <p className="winner-description">{category?.description}</p>
                <div className="winner-details">
                  <div className="detail-item">
                    <UserIcon className="w-4 h-4" />
                    <span>Employee ID: {winner.employeeId}</span>
                  </div>
                  <div className="detail-item">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Announced: {new Date(winner.announcedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {getFilteredWinners().length === 0 && (
        <div className="no-winners">
          <TrophyIcon className="w-12 h-12 text-gray-400" />
          <p>No winners found for the selected period.</p>
        </div>
      )}
    </div>
  );
};

export default WinnersGallery; 