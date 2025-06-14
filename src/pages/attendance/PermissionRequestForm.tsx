import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PermissionFormData } from '../../types/attendance';
import attendanceService from '../../services/attendanceService';
import { differenceInMinutes, parseISO, format } from 'date-fns';

interface PermissionRequestFormProps {
  onSubmit: (data: PermissionFormData) => Promise<void>;
  onClose: () => void;
}

const PermissionRequestForm: React.FC<PermissionRequestFormProps> = ({
  onSubmit,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingPermissions, setRemainingPermissions] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<PermissionFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '',
      endTime: '',
      reason: ''
    }
  });

  useEffect(() => {
    fetchRemainingPermissions();
  }, []);

  const fetchRemainingPermissions = async () => {
    try {
      const response = await attendanceService.permissions.getRemainingCount();
      setRemainingPermissions(response.data.remaining);
      setError(null);
    } catch (err) {
      console.error('Error fetching remaining permissions:', err);
      setError('Failed to load remaining permissions');
    } finally {
      setLoading(false);
    }
  };

  const startTime = watch('startTime');
  const endTime = watch('endTime');

  const validateDuration = () => {
    if (startTime && endTime) {
      const start = parseISO(`2000-01-01T${startTime}`);
      const end = parseISO(`2000-01-01T${endTime}`);
      const duration = differenceInMinutes(end, start);
      return duration <= 120 || 'Permission duration cannot exceed 2 hours';
    }
    return true;
  };

  const handleFormSubmit = async (data: PermissionFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting permission request:', error);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Permission</h2>
          <button
            className="close-button"
            onClick={onClose}
            type="button"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        <div className="permissions-info">
          <div className="info-card">
            <span className="info-label">Remaining Permissions</span>
            <span className="info-value">{remainingPermissions} / 2</span>
            <span className="info-subtitle">this month</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="permission-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              {...register('date', {
                required: 'Date is required'
              })}
              className={`form-input ${errors.date ? 'error' : ''}`}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.date && (
              <span className="error-message">{errors.date.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <div className="time-input-wrapper">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  id="startTime"
                  {...register('startTime', {
                    required: 'Start time is required',
                    validate: validateDuration
                  })}
                  className={`form-input ${errors.startTime ? 'error' : ''}`}
                />
              </div>
              {errors.startTime && (
                <span className="error-message">{errors.startTime.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <div className="time-input-wrapper">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  id="endTime"
                  {...register('endTime', {
                    required: 'End time is required',
                    validate: {
                      afterStart: value => 
                        !startTime || value > startTime || 'End time must be after start time',
                      duration: validateDuration
                    }
                  })}
                  className={`form-input ${errors.endTime ? 'error' : ''}`}
                />
              </div>
              {errors.endTime && (
                <span className="error-message">{errors.endTime.message}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              {...register('reason', {
                required: 'Please provide a reason',
                minLength: {
                  value: 10,
                  message: 'Reason must be at least 10 characters'
                }
              })}
              className={`form-textarea ${errors.reason ? 'error' : ''}`}
              placeholder="Please provide a detailed reason for your permission request"
              rows={3}
            />
            {errors.reason && (
              <span className="error-message">{errors.reason.message}</span>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || remainingPermissions === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner small" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionRequestForm; 