import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { Goal, GoalStatus, GoalsGroup } from '../../types/goals';
import goalsService from '../../services/goalsService';
import './GoalsSetting.css';

const GoalsReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [goalsGroup, setGoalsGroup] = useState<GoalsGroup | null>(null);
  const [managerComments, setManagerComments] = useState<Record<string, string>>({});
  const [rejectionComments, setRejectionComments] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGoalsGroup();
    }
  }, [id]);

  const fetchGoalsGroup = async () => {
    try {
      setLoading(true);
      const response = await goalsService.getGoalById(id!);
      const goalsData = response.data;
      setGoalsGroup(goalsData);
      
      // Initialize manager comments from existing data
      const commentsMap: Record<string, string> = {};
      goalsData.goals.forEach((goal: Goal) => {
        commentsMap[goal.id] = goal.managerComments || '';
      });
      setManagerComments(commentsMap);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (goalId: string, comment: string) => {
    setManagerComments(prev => ({
      ...prev,
      [goalId]: comment
    }));
  };

  const handleApprove = async () => {
    if (!goalsGroup || !id) return;

    try {
      setLoading(true);
      // First update any manager comments
      for (const goalId in managerComments) {
        if (managerComments[goalId]) {
          await goalsService.updateGoal(goalId, { managerComments: managerComments[goalId] });
        }
      }
      
      await goalsService.approveGoals(id);
      // Refresh data
      await fetchGoalsGroup();
      setError(null);
    } catch (err) {
      console.error('Error approving goals:', err);
      setError('Failed to approve goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!goalsGroup || !id || !rejectionComments.trim()) return;

    try {
      setLoading(true);
      await goalsService.rejectGoals(id, rejectionComments);
      setShowRejectionDialog(false);
      // Refresh data
      await fetchGoalsGroup();
      setError(null);
    } catch (err) {
      console.error('Error rejecting goals:', err);
      setError('Failed to reject goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReview = async () => {
    if (!goalsGroup || !id) return;

    try {
      setLoading(true);
      // First update any manager comments
      for (const goalId in managerComments) {
        if (managerComments[goalId]) {
          await goalsService.updateGoal(goalId, { managerComments: managerComments[goalId] });
        }
      }
      
      await goalsService.completeReview(id);
      // Refresh data
      await fetchGoalsGroup();
      setError(null);
    } catch (err) {
      console.error('Error completing review:', err);
      setError('Failed to complete review. Please try again.');
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
    
    return (
      <div className="goal-status">
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
            <h1>Goals Review</h1>
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
          <h1>Goals Review</h1>
          <p className="goals-header-description">
            Review and approve employee goals
          </p>
        </div>
        <div className="goals-header-right">
          {getStatusBadge(goalsGroup.status)}
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
            <h2>Employee Goals</h2>
            <div className="text-sm text-gray-500">
              Submitted: {format(new Date(goalsGroup.createdAt), 'dd MMM yyyy')}
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

                {(goalsGroup.status === GoalStatus.SUBMITTED || 
                  goalsGroup.status === GoalStatus.REVIEW_PENDING) && (
                  <div className="form-group">
                    <label>Manager Comments</label>
                    <textarea
                      className="form-textarea"
                      value={managerComments[goal.id] || ''}
                      onChange={(e) => handleCommentChange(goal.id, e.target.value)}
                      placeholder="Add your comments or feedback on this goal"
                    />
                  </div>
                )}

                {(goalsGroup.status === GoalStatus.APPROVED || 
                  goalsGroup.status === GoalStatus.IN_PROGRESS || 
                  goalsGroup.status === GoalStatus.COMPLETED) && (
                  <div className="form-group">
                    <label>Manager Comments</label>
                    <p className="form-value">{goal.managerComments || 'No comments provided'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="goals-footer">
        <div>
          {goalsGroup.status === GoalStatus.SUBMITTED && (
            <button
              type="button"
              className="btn btn-danger mr-2"
              onClick={() => setShowRejectionDialog(true)}
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Reject
            </button>
          )}
        </div>

        <div>
          {goalsGroup.status === GoalStatus.SUBMITTED && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApprove}
              disabled={loading}
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Approve
            </button>
          )}

          {goalsGroup.status === GoalStatus.REVIEW_PENDING && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCompleteReview}
              disabled={loading}
            >
              <DocumentCheckIcon className="w-4 h-4 mr-2" />
              Complete Review
            </button>
          )}
        </div>
      </div>

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Reject Goals</h2>
              <button
                onClick={() => setShowRejectionDialog(false)}
                className="close-button"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <p className="mb-4">Please provide a reason for rejecting these goals:</p>
              <textarea
                className="form-textarea"
                value={rejectionComments}
                onChange={(e) => setRejectionComments(e.target.value)}
                placeholder="Enter rejection reason"
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectionDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleReject}
                disabled={!rejectionComments.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsReview; 