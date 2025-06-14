import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Goal, GoalStatus, GoalsGroup } from '../../types/goals';
import goalsService from '../../services/goalsService';
import './GoalsSetting.css';

const GoalsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalsGroup, setGoalsGroup] = useState<GoalsGroup | null>(null);

  useEffect(() => {
    if (id) {
      fetchGoalsGroup();
    }
  }, [id]);

  const fetchGoalsGroup = async () => {
    try {
      setLoading(true);
      const response = await goalsService.getGoalById(id!);
      setGoalsGroup(response.data);
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

    const statusIcons = {
      [GoalStatus.DRAFT]: <DocumentTextIcon className="w-4 h-4" />,
      [GoalStatus.SUBMITTED]: <ClockIcon className="w-4 h-4" />,
      [GoalStatus.APPROVED]: <CheckCircleIcon className="w-4 h-4" />,
      [GoalStatus.IN_PROGRESS]: <ClockIcon className="w-4 h-4" />,
      [GoalStatus.REVIEW_PENDING]: <ClockIcon className="w-4 h-4" />,
      [GoalStatus.COMPLETED]: <CheckCircleIcon className="w-4 h-4" />,
      [GoalStatus.REJECTED]: <XCircleIcon className="w-4 h-4" />
    };
    
    return (
      <div className="goal-status">
        {statusIcons[status]}
        <span className={statusClasses[status]}>{status.replace('_', ' ')}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="goals-page-container">
        <div className="goals-content">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !goalsGroup) {
    return (
      <div className="goals-page-container">
        <div className="goals-header">
          <div className="goals-header-left">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="icon" />
              Back
            </button>
            <h1>Goal Details</h1>
          </div>
        </div>
        <div className="goals-content">
          <div className="error-alert">
            {error || 'Goals not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="goals-page-container">
      <div className="goals-header">
        <div className="goals-header-left">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="icon" />
            Back
          </button>
          <h1>Goal Details</h1>
          <p className="goals-header-description">
            View your performance goals and progress
          </p>
        </div>
        <div className="goals-header-right">
          {getStatusBadge(goalsGroup.status)}
        </div>
      </div>

      <div className="goals-content">
        <div className="goals-card">
          <div className="goals-card-header">
            <h2>Performance Goals</h2>
            <div className="text-sm text-gray-500">
              Created: {format(new Date(goalsGroup.createdAt), 'dd MMM yyyy')}
            </div>
          </div>
          <div className="goals-card-body">
            {goalsGroup.goals.map((goal, index) => (
              <div key={goal.id} className="goal-form-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Goal Name</label>
                    <p className="form-value">{goal.name}</p>
                  </div>

                  <div className="form-group">
                    <label>Goal Type</label>
                    <p className="form-value">{goal.goalType}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Goal Description</label>
                  <p className="form-value">{goal.description}</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Accomplishment Date</label>
                    <p className="form-value">{format(new Date(goal.accomplishmentDate), 'dd MMM yyyy')}</p>
                  </div>

                  <div className="form-group">
                    <label>Completion Percentage</label>
                    <div className="form-value">
                      <div className="slider-container">
                        <div className="slider-label">
                          <span className="completion-percentage">
                            {goal.completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${goal.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Employee Comments</label>
                  <p className="form-value">{goal.employeeComments || 'No comments provided'}</p>
                </div>

                {goal.managerComments && (
                  <div className="form-group">
                    <label>Manager Comments</label>
                    <p className="form-value">{goal.managerComments}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status timeline */}
        <div className="goals-card mt-6">
          <div className="goals-card-header">
            <h2>Status Timeline</h2>
          </div>
          <div className="goals-card-body p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created</h3>
                  <p className="text-xs text-gray-500">
                    {format(new Date(goalsGroup.createdAt), 'dd MMM yyyy, h:mm a')}
                  </p>
                  <p className="text-sm mt-1">Goals were created in draft status.</p>
                </div>
              </div>

              {goalsGroup.status !== GoalStatus.DRAFT && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Submitted</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(goalsGroup.updatedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    <p className="text-sm mt-1">Goals were submitted for manager approval.</p>
                  </div>
                </div>
              )}

              {(goalsGroup.status === GoalStatus.APPROVED || 
                goalsGroup.status === GoalStatus.IN_PROGRESS ||
                goalsGroup.status === GoalStatus.REVIEW_PENDING ||
                goalsGroup.status === GoalStatus.COMPLETED) && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Approved</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(goalsGroup.updatedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    <p className="text-sm mt-1">Goals were approved by manager.</p>
                  </div>
                </div>
              )}

              {goalsGroup.status === GoalStatus.REJECTED && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircleIcon className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Rejected</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(goalsGroup.updatedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    <p className="text-sm mt-1">Goals were rejected by manager.</p>
                  </div>
                </div>
              )}

              {(goalsGroup.status === GoalStatus.IN_PROGRESS ||
                goalsGroup.status === GoalStatus.REVIEW_PENDING ||
                goalsGroup.status === GoalStatus.COMPLETED) && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">In Progress</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(goalsGroup.updatedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    <p className="text-sm mt-1">Work on goals in progress.</p>
                  </div>
                </div>
              )}

              {(goalsGroup.status === GoalStatus.REVIEW_PENDING ||
                goalsGroup.status === GoalStatus.COMPLETED) && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="h-full w-0.5 bg-gray-200 mt-2"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Review Pending</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(goalsGroup.updatedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    <p className="text-sm mt-1">Final review pending from manager.</p>
                  </div>
                </div>
              )}

              {goalsGroup.status === GoalStatus.COMPLETED && (
                <div className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Completed</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(goalsGroup.updatedAt), 'dd MMM yyyy, h:mm a')}
                    </p>
                    <p className="text-sm mt-1">Goals have been completed and reviewed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsView; 