import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { GoalType, GoalStatus } from '../../types/goals';
import goalsService from '../../services/goalsService';
import './GoalsSetting.css';

interface GoalEntry {
  id?: string;
  name: string;
  description: string;
  accomplishmentDate: string;
  employeeComments: string;
  managerComments: string;
  completionPercentage: number;
  goalType: GoalType;
}

interface FormValues {
  goals: GoalEntry[];
}

const GoalsSetting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<GoalStatus>(GoalStatus.DRAFT);
  const [goalsGroupId, setGoalsGroupId] = useState<string | null>(id || null);
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      goals: [
        {
          name: '',
          description: '',
          accomplishmentDate: format(new Date(), 'yyyy-MM-dd'),
          employeeComments: '',
          managerComments: '',
          completionPercentage: 0,
          goalType: GoalType.INDIVIDUAL
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'goals'
  });

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
      setStatus(goalsData.status);
      reset({ goals: goalsData.goals });
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    append({
      name: '',
      description: '',
      accomplishmentDate: format(new Date(), 'yyyy-MM-dd'),
      employeeComments: '',
      managerComments: '',
      completionPercentage: 0,
      goalType: GoalType.INDIVIDUAL
    });
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setLoading(true);
      if (goalsGroupId) {
        // Update existing goals
        await goalsService.updateGoal(goalsGroupId, data);
      } else {
        // Create new goals
        const response = await goalsService.createGoal(data);
        setGoalsGroupId(response.data.id);
      }
      setError(null);
    } catch (err) {
      console.error('Error saving goals:', err);
      setError('Failed to save goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!goalsGroupId) {
      setError('Please save the goals first before submitting for approval.');
      return;
    }

    try {
      setLoading(true);
      await goalsService.submitGoals(goalsGroupId);
      setStatus(GoalStatus.SUBMITTED);
      setError(null);
    } catch (err) {
      console.error('Error submitting goals:', err);
      setError('Failed to submit goals for approval. Please try again.');
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
      [GoalStatus.SUBMITTED]: <PaperAirplaneIcon className="w-4 h-4" />,
      [GoalStatus.APPROVED]: <DocumentCheckIcon className="w-4 h-4" />,
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

  const getCompletionPercentageClass = (value: number) => {
    if (value < 33) return 'low';
    if (value < 66) return 'medium';
    return 'high';
  };

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
          <h1>{id ? 'Edit Goals' : 'Create Goals'}</h1>
          <p className="goals-header-description">
            {id ? 'Edit your performance goals' : 'Set your performance goals and track your progress'}
          </p>
        </div>
        <div className="goals-header-right">
          {getStatusBadge(status)}
        </div>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="goals-card">
          <div className="goals-card-header">
            <h2>Goals Group</h2>
          </div>
          <div className="goals-card-body">
            {fields.map((field, index) => (
              <div key={field.id} className="goal-form-group">
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="remove-goal"
                    onClick={() => remove(index)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`goals.${index}.name`}>Goal Name</label>
                    <input
                      type="text"
                      id={`goals.${index}.name`}
                      {...register(`goals.${index}.name`, { required: true })}
                      className={errors.goals?.[index]?.name ? 'error' : ''}
                    />
                    {errors.goals?.[index]?.name && (
                      <span className="error-message">Goal name is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`goals.${index}.goalType`}>Goal Type</label>
                    <select
                      id={`goals.${index}.goalType`}
                      {...register(`goals.${index}.goalType`)}
                    >
                      {Object.values(GoalType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`goals.${index}.description`}>Description</label>
                  <textarea
                    id={`goals.${index}.description`}
                    {...register(`goals.${index}.description`, { required: true })}
                    className={errors.goals?.[index]?.description ? 'error' : ''}
                  />
                  {errors.goals?.[index]?.description && (
                    <span className="error-message">Description is required</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`goals.${index}.accomplishmentDate`}>Accomplishment Date</label>
                    <input
                      type="date"
                      id={`goals.${index}.accomplishmentDate`}
                      {...register(`goals.${index}.accomplishmentDate`, { required: true })}
                      className={errors.goals?.[index]?.accomplishmentDate ? 'error' : ''}
                    />
                    {errors.goals?.[index]?.accomplishmentDate && (
                      <span className="error-message">Accomplishment date is required</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`goals.${index}.completionPercentage`}>Completion Percentage</label>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${getCompletionPercentageClass(watch(`goals.${index}.completionPercentage`))}`}
                          style={{ width: `${watch(`goals.${index}.completionPercentage`)}%` }}
                        />
                        <span className="progress-text">
                          {watch(`goals.${index}.completionPercentage`)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        id={`goals.${index}.completionPercentage`}
                        min="0"
                        max="100"
                        step="5"
                        className="progress-input"
                        {...register(`goals.${index}.completionPercentage`, { 
                          valueAsNumber: true 
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="goals-footer">
          {status === GoalStatus.DRAFT && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSubmitForApproval}
              disabled={loading || !goalsGroupId}
            >
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Submit for Approval
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {id ? 'Update Goals' : 'Save Goals'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalsSetting;