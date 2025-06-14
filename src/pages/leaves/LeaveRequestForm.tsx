import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { LeaveType, LeaveRequestFormData, LeaveRequest } from '../../types/leave';
import leaveService from '../../services/leaveService';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import './LeaveRequestForm.css';

interface LeaveRequestFormProps {
  leaveRequest?: LeaveRequest | null;
  onSubmit: (data: LeaveRequestFormData) => Promise<void>;
  onClose: () => void;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  leaveRequest,
  onSubmit,
  onClose
}) => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LeaveRequestFormData>({
    defaultValues: leaveRequest ? {
      leaveTypeId: leaveRequest.leaveTypeId,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      reason: leaveRequest.reason,
      isHalfDay: leaveRequest.isHalfDay || false,
      halfDayType: leaveRequest.halfDayType
    } : {
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      isHalfDay: false,
      halfDayType: undefined
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const isHalfDay = watch('isHalfDay');
  const halfDayType = watch('halfDayType');

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await leaveService.leaveTypes.getAll();
        setLeaveTypes(response.data.filter(lt => lt.isActive));
        setError(null);
      } catch (err) {
        setError('Failed to load leave types. Please try again later.');
        console.error('Error fetching leave types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const days = differenceInBusinessDays(end, start) + 1;
      const calculatedValue = days > 0 ? days : 0;
      setCalculatedDays(isHalfDay ? calculatedValue - 0.5 : calculatedValue);
    } else {
      setCalculatedDays(0);
    }
  }, [startDate, endDate, isHalfDay]);

  const handleFormSubmit = async (data: LeaveRequestFormData) => {
    try {
      // Validate half-day selection for multi-day leaves
      if (data.isHalfDay && startDate && endDate) {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        const days = differenceInBusinessDays(end, start) + 1;
        
        if (days > 1) {
          setError('For multi-day leaves, please specify which date the half-day applies to');
          return;
        }
      }

      await onSubmit({
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
        isHalfDay: data.isHalfDay,
        halfDayType: data.isHalfDay ? data.halfDayType : undefined
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="loading-container">
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
          <h2>Apply for Leave</h2>
          <button
            className="close-button"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="leave-request-form">
          <div className="form-section">
            <h3 className="section-title">Leave Details</h3>
            
            <div className="form-group">
              <label htmlFor="leaveTypeId">Leave Type</label>
              <select
                id="leaveTypeId"
                {...register('leaveTypeId', {
                  required: 'Please select a leave type'
                })}
                className={`form-select ${errors.leaveTypeId ? 'error' : ''}`}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.defaultDays} days available)
                  </option>
                ))}
              </select>
              {errors.leaveTypeId && (
                <span className="error-message">{errors.leaveTypeId.message}</span>
              )}
            </div>

            <div className="date-section">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <div className="date-input-wrapper">
                  <CalendarIcon className="w-5 h-5" />
                  <input
                    id="startDate"
                    type="date"
                    {...register('startDate', {
                      required: 'Start date is required',
                      validate: value => {
                        const today = new Date().toISOString().split('T')[0];
                        return value >= today || 'Start date cannot be in the past';
                      }
                    })}
                    className={`form-input ${errors.startDate ? 'error' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.startDate && (
                  <span className="error-message">{errors.startDate.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <div className="date-input-wrapper">
                  <CalendarIcon className="w-5 h-5" />
                  <input
                    id="endDate"
                    type="date"
                    {...register('endDate', {
                      required: 'End date is required',
                      validate: value => {
                        if (!startDate) return true;
                        return value >= startDate || 'End date must be after start date';
                      }
                    })}
                    className={`form-input ${errors.endDate ? 'error' : ''}`}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.endDate && (
                  <span className="error-message">{errors.endDate.message}</span>
                )}
              </div>
            </div>

            <div className="half-day-section">
              <div className="half-day-toggle">
                <input
                  type="checkbox"
                  id="isHalfDay"
                  {...register('isHalfDay')}
                  className="form-checkbox"
                />
                <label htmlFor="isHalfDay">
                  <ClockIcon className="w-5 h-5" />
                  <span>Apply for Half Day</span>
                </label>
              </div>

              {isHalfDay && (
                <div className="half-day-options">
                  {startDate && endDate && (
                    <div className="half-day-date-info">
                      {startDate === endDate ? (
                        <p className="info-text">Half-day will be applied to {new Date(startDate).toLocaleDateString()}</p>
                      ) : (
                        <div className="half-day-date-selection">
                          <label>Select date for half-day:</label>
                          <div className="date-options">
                            <label className="date-option">
                              <input
                                type="radio"
                                {...register('halfDayDate', {
                                  required: isHalfDay ? 'Please select a date for half-day' : false
                                })}
                                value="start"
                                className="form-radio"
                              />
                              <div className="date-details">
                                <span className="date-title">First Day</span>
                                <span className="date-value">{new Date(startDate).toLocaleDateString()}</span>
                              </div>
                            </label>
                            <label className="date-option">
                              <input
                                type="radio"
                                {...register('halfDayDate', {
                                  required: isHalfDay ? 'Please select a date for half-day' : false
                                })}
                                value="end"
                                className="form-radio"
                              />
                              <div className="date-details">
                                <span className="date-title">Last Day</span>
                                <span className="date-value">{new Date(endDate).toLocaleDateString()}</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <label>Select Session:</label>
                  <div className="session-options">
                    <label className="session-option">
                      <input
                        type="radio"
                        {...register('halfDayType', {
                          required: isHalfDay ? 'Please select a session' : false
                        })}
                        value="FIRST_HALF"
                        className="form-radio"
                      />
                      <div className="session-details">
                        <span className="session-title">Morning Session</span>
                        <span className="session-time">9:00 AM - 1:00 PM</span>
                      </div>
                    </label>
                    <label className="session-option">
                      <input
                        type="radio"
                        {...register('halfDayType', {
                          required: isHalfDay ? 'Please select a session' : false
                        })}
                        value="SECOND_HALF"
                        className="form-radio"
                      />
                      <div className="session-details">
                        <span className="session-title">Afternoon Session</span>
                        <span className="session-time">2:00 PM - 6:00 PM</span>
                      </div>
                    </label>
                  </div>
                  {errors.halfDayType && (
                    <span className="error-message">{errors.halfDayType.message}</span>
                  )}
                  {errors.halfDayDate && (
                    <span className="error-message">{errors.halfDayDate.message}</span>
                  )}
                </div>
              )}
            </div>

            {calculatedDays > 0 && (
              <div className="days-calculation">
                <ClockIcon className="w-5 h-5" />
                <div className="calculation-details">
                  <span className="calculation-label">Working Days</span>
                  <span className="calculation-value">{calculatedDays} days</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="section-title">Additional Information</h3>
            <div className="form-group">
              <label htmlFor="reason">Reason for Leave</label>
              <textarea
                id="reason"
                {...register('reason', {
                  required: 'Please provide a reason for your leave',
                  minLength: {
                    value: 10,
                    message: 'Reason must be at least 10 characters'
                  }
                })}
                className={`form-textarea ${errors.reason ? 'error' : ''}`}
                placeholder="Please provide a detailed reason for your leave request"
                rows={3}
              />
              {errors.reason && (
                <span className="error-message">{errors.reason.message}</span>
              )}
            </div>
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
              disabled={isSubmitting || calculatedDays <= 0}
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

export default LeaveRequestForm; 