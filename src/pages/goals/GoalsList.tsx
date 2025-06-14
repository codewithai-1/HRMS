import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  EyeIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { GoalStatus, GoalsGroup } from '../../types/goals';
import goalsService from '../../services/goalsService';
import './GoalsSetting.css';
import useAuth from '../../hooks/useAuth.tsx';

const GoalsList: React.FC = () => {
  const [goals, setGoals] = useState<GoalsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await goalsService.getAllGoals();
      setGoals(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: GoalStatus) => {
    const statusClasses = {
      [GoalStatus.DRAFT]: 'status-badge draft',
      [GoalStatus.SUBMITTED]: 'status-badge submitted',
      [GoalStatus.APPROVED]: 'status-badge approved',
      [GoalStatus.IN_PROGRESS]: 'status-badge in-progress',
      [GoalStatus.REVIEW_PENDING]: 'status-badge review-pending',
      [GoalStatus.COMPLETED]: 'status-badge completed',
      [GoalStatus.REJECTED]: 'status-badge rejected'
    };
    
    return <span className={statusClasses[status]}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="goals-page-container">
      <div className="goals-header">
        <div className="goals-header-left">
          <h1>Performance Goals</h1>
          <p className="goals-header-description">
            Manage your performance goals and objectives
          </p>
        </div>
        <div className="goals-header-right">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => navigate('/goals/new')}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New Goals
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      <div className="goals-content">
        <div className="goals-card">
          <div className="goals-card-header">
            <h2>My Goals</h2>
            <div className="flex items-center">
              <ListBulletIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                {goals.length} Goal Group{goals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="loading-spinner" />
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p>No goals found. Create your first goals to get started.</p>
                <button
                  type="button"
                  className="btn btn-primary mt-4"
                  onClick={() => navigate('/goals/new')}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create New Goals
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goals Group
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {goals.map((goalsGroup) => {
                    // Calculate average progress
                    const totalGoals = goalsGroup.goals.length;
                    const totalProgress = goalsGroup.goals.reduce(
                      (sum, goal) => sum + goal.completionPercentage, 
                      0
                    );
                    const averageProgress = totalGoals > 0 
                      ? Math.round(totalProgress / totalGoals) 
                      : 0;
                      
                    return (
                      <tr key={goalsGroup.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {goalsGroup.name || `Goal Group (${totalGoals})`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {goalsGroup.goals.length} goal{goalsGroup.goals.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(goalsGroup.createdAt), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(goalsGroup.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32">
                            <div className="text-sm text-gray-900 mb-1">{averageProgress}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${averageProgress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* Different actions based on status and role */}
                            {(goalsGroup.status === GoalStatus.DRAFT || goalsGroup.status === GoalStatus.REJECTED) && (
                              <button
                                type="button"
                                onClick={() => navigate(`/goals/edit/${goalsGroup.id}`)}
                                className="btn-icon text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                            )}
                            
                            {(goalsGroup.status === GoalStatus.SUBMITTED || goalsGroup.status === GoalStatus.REVIEW_PENDING) && isManager && (
                              <button
                                type="button"
                                onClick={() => navigate(`/goals/review/${goalsGroup.id}`)}
                                className="btn-icon text-green-600 hover:text-green-900"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                            )}
                            
                            {/* View link is always available */}
                            <button
                              type="button"
                              onClick={() => navigate(`/goals/view/${goalsGroup.id}`)}
                              className="btn-icon text-gray-600 hover:text-gray-900"
                            >
                              <DocumentTextIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isManager && (
          <div className="goals-card mt-8">
            <div className="goals-card-header">
              <h2>Team Goals</h2>
              <div className="flex items-center">
                <ListBulletIcon className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  Pending Reviews
                </span>
              </div>
            </div>
            <div className="goals-card-body">
              {/* Placeholder for team goals - Would be implemented if backend supports */}
              <div className="text-center py-6 text-gray-500">
                <p>Team goals management will be implemented in future updates.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsList; 