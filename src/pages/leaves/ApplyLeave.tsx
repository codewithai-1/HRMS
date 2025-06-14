import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CalendarIcon, ClockIcon, ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { LeaveType, LeaveRequestFormData, LeaveRequest } from '../../types/leave';
import leaveService from '../../services/leaveService';
import { parseISO, differenceInBusinessDays, isBefore, isEqual, isWeekend, addDays, format, isSameDay, isPast } from 'date-fns';
import './ApplyLeave.css';

// Updated form data interface to support independent half-days
interface ExtendedLeaveRequestFormData extends Omit<LeaveRequestFormData, 'isHalfDay' | 'halfDayType' | 'halfDayDate'> {
  isStartDateHalfDay: boolean;
  isEndDateHalfDay: boolean;
  startDateHalfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  endDateHalfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
}

const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatedDays, setCalculatedDays] = useState<number>(0);
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    trigger,
    clearErrors,
    setError: setFormError
  } = useForm<ExtendedLeaveRequestFormData>({
    defaultValues: {
      isStartDateHalfDay: false,
      isEndDateHalfDay: false
    },
    mode: 'onChange'
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const isStartDateHalfDay = watch('isStartDateHalfDay');
  const isEndDateHalfDay = watch('isEndDateHalfDay');
  const startDateHalfDayType = watch('startDateHalfDayType');
  const endDateHalfDayType = watch('endDateHalfDayType');
  const leaveTypeId = watch('leaveTypeId');

  // Validate dates whenever they change
  useEffect(() => {
    validateDates();
  }, [startDate, endDate, isStartDateHalfDay, isEndDateHalfDay, startDateHalfDayType, endDateHalfDayType]);

  // Disable end date half-day option if start and end date are the same and start date is half-day
  useEffect(() => {
    if (startDate && endDate && startDate === endDate && isStartDateHalfDay) {
      setValue('isEndDateHalfDay', false);
    }
  }, [startDate, endDate, isStartDateHalfDay, setValue]);

  // If half day is selected, ensure a type is selected
  useEffect(() => {
    if (isStartDateHalfDay && !startDateHalfDayType) {
      setValue('startDateHalfDayType', 'FIRST_HALF');
    }
    if (isEndDateHalfDay && !endDateHalfDayType) {
      setValue('endDateHalfDayType', 'FIRST_HALF');
    }
  }, [isStartDateHalfDay, isEndDateHalfDay, startDateHalfDayType, endDateHalfDayType, setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const typesResponse = await leaveService.leaveTypes.getAll();
        setLeaveTypes(typesResponse.data.filter(lt => lt.isActive));

        if (id) {
          const requestResponse = await leaveService.leaveRequests.getById(id);
          
          // Map old format data to new format
          const isStartHalfDay = requestResponse.data.isHalfDay && requestResponse.data.halfDayDate === 'start';
          const isEndHalfDay = requestResponse.data.isHalfDay && requestResponse.data.halfDayDate === 'end';
          
          reset({
            leaveTypeId: requestResponse.data.leaveTypeId,
            startDate: requestResponse.data.startDate,
            endDate: requestResponse.data.endDate,
            reason: requestResponse.data.reason,
            isStartDateHalfDay: isStartHalfDay,
            isEndDateHalfDay: isEndHalfDay,
            startDateHalfDayType: isStartHalfDay ? requestResponse.data.halfDayType : undefined,
            endDateHalfDayType: isEndHalfDay ? requestResponse.data.halfDayType : undefined
          });
        }

        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const validateDates = () => {
    setDateValidationError(null);
    clearErrors('startDate');
    clearErrors('endDate');
    
    if (!startDate || !endDate) return;
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    // Check if dates are valid
    if (!start || !end) {
      setDateValidationError('Invalid date format');
      return;
    }
    
    // Check if start date is in the past
    if (isPast(start) && !isSameDay(start, new Date())) {
      setDateValidationError('Start date cannot be in the past');
      setFormError('startDate', { type: 'manual', message: 'Start date cannot be in the past' });
      return;
    }
    
    // Check if end date is before start date
    if (isBefore(end, start)) {
      setDateValidationError('End date cannot be before start date');
      setFormError('endDate', { type: 'manual', message: 'End date cannot be before start date' });
      return;
    }
    
    // Check weekend dates
    if (isWeekend(start) && isWeekend(end) && isSameDay(start, end)) {
      setDateValidationError('Cannot request leave for a weekend day');
      return;
    }
    
    // Check if dates are the same, with incompatible half-day selections
    if (isSameDay(start, end) && isStartDateHalfDay && isEndDateHalfDay) {
      setDateValidationError('Cannot select half-day for both start and end date when they are the same day');
      return;
    }
    
    // Check if start date is afternoon and end date is morning on consecutive days
    if (
      isStartDateHalfDay && 
      isEndDateHalfDay && 
      startDateHalfDayType === 'SECOND_HALF' && 
      endDateHalfDayType === 'FIRST_HALF' &&
      differenceInBusinessDays(end, start) <= 1
    ) {
      const nextBusinessDay = addDays(start, 1);
      if (isEqual(nextBusinessDay, end) || isWeekend(nextBusinessDay)) {
        setDateValidationError('No working days in leave period with selected half-day options');
        return;
      }
    }
    
    // Calculate business days
    const businessDays = differenceInBusinessDays(end, start) + 1;
    
    // Check if there are actual working days in the selection
    if (businessDays <= 0) {
      setDateValidationError('Selected period must include at least one working day');
      return;
    }
    
    // Calculate days and check if the leave is valid (at least 0.5 days)
    let calculatedValue = businessDays > 0 ? businessDays : 0;
    
    // Subtract half days accordingly
    if (isStartDateHalfDay) calculatedValue -= 0.5;
    if (isEndDateHalfDay && !isSameDay(start, end)) calculatedValue -= 0.5;
    
    if (calculatedValue <= 0) {
      setDateValidationError('Selected leave must be at least half a day');
      return;
    }
    
    setCalculatedDays(calculatedValue);
  };

  useEffect(() => {
    if (startDate && endDate) {
      validateDates();
    } else {
      setCalculatedDays(0);
    }
  }, [startDate, endDate, isStartDateHalfDay, isEndDateHalfDay, startDateHalfDayType, endDateHalfDayType]);

  const handleHalfDayChange = (field: 'isStartDateHalfDay' | 'isEndDateHalfDay', value: boolean) => {
    setValue(field, value);
    
    // If toggling on, set a default half day type
    if (value) {
      if (field === 'isStartDateHalfDay') {
        setValue('startDateHalfDayType', 'FIRST_HALF');
      } else {
        setValue('endDateHalfDayType', 'FIRST_HALF');
      }
    }
    
    // If toggling off, clear the half day type
    if (!value) {
      if (field === 'isStartDateHalfDay') {
        setValue('startDateHalfDayType', undefined);
      } else {
        setValue('endDateHalfDayType', undefined);
      }
    }
    
    // If dates are the same and toggling start date half day on, disable end date half day
    if (startDate && endDate && startDate === endDate) {
      if (field === 'isStartDateHalfDay' && value) {
        setValue('isEndDateHalfDay', false);
        setValue('endDateHalfDayType', undefined);
      } else if (field === 'isEndDateHalfDay' && value) {
        setValue('isStartDateHalfDay', false);
        setValue('startDateHalfDayType', undefined);
      }
    }
    
    validateDates();
  };

  const handleFormSubmit = async (data: ExtendedLeaveRequestFormData) => {
    try {
      // Validate again before submission
      validateDates();
      if (dateValidationError) {
        return;
      }
      
      // Check available leave balance if applicable
      if (leaveTypeId) {
        const selectedLeaveType = leaveTypes.find(lt => String(lt.id) === leaveTypeId);
        if (selectedLeaveType && calculatedDays > selectedLeaveType.defaultDays) {
          setError(`Requested leave (${calculatedDays} days) exceeds your available balance (${selectedLeaveType.defaultDays} days)`);
          return;
        }
      }

      // Convert the extended form data back to the API format
      const apiData: LeaveRequestFormData = {
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        isHalfDay: data.isStartDateHalfDay || data.isEndDateHalfDay,
        halfDayDate: data.isStartDateHalfDay ? 'start' : data.isEndDateHalfDay ? 'end' : undefined,
        halfDayType: data.isStartDateHalfDay ? data.startDateHalfDayType : data.isEndDateHalfDay ? data.endDateHalfDayType : undefined
      };
      
      if (id) {
        await leaveService.leaveRequests.update(id, apiData);
      } else {
        await leaveService.leaveRequests.create(apiData);
      }
      navigate('/leave');
    } catch (err) {
      setError('Failed to submit leave request. Please try again.');
      console.error('Error submitting leave request:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leave request form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button 
          onClick={() => navigate('/leave')}
          className="back-button"
        >
          <ArrowLeftIcon className="icon" />
          <span>Back to Leave Requests</span>
        </button>
        <h1>{id ? 'Edit Leave Request' : 'Apply for Leave'}</h1>
        <p className="description">
          {id ? 'Update your leave request details' : 'Request time off with your preferred dates'}
        </p>
      </div>

      {error && (
        <div className="error-alert">
          <ExclamationCircleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Leave Type Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Leave Details</h2>
              {calculatedDays > 0 && !dateValidationError && (
                <div className="days-info">
                  <ClockIcon className="icon" />
                  <span>{calculatedDays} working day{calculatedDays !== 1 ? 's' : ''}</span>
                </div>
              )}
              {dateValidationError && (
                <div className="error-badge">
                  <ExclamationCircleIcon className="icon" />
                  <span>{dateValidationError}</span>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="leaveTypeId">Leave Type</label>
              <div className="select-wrapper">
                <select
                  id="leaveTypeId"
                  {...register('leaveTypeId', { required: 'Please select a leave type' })}
                  className={errors.leaveTypeId ? 'error' : ''}
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.defaultDays} days available)
                    </option>
                  ))}
                </select>
              </div>
              {errors.leaveTypeId && <span className="error-message">{errors.leaveTypeId.message}</span>}
            </div>

            <div className="date-container">
              {/* Start Date Column */}
              <div className="date-column">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <div className="date-input-wrapper">
                    <CalendarIcon className="icon" />
                    <input
                      type="date"
                      id="startDate"
                      {...register('startDate', { 
                        required: 'Start date is required',
                        onChange: () => validateDates()
                      })}
                      className={errors.startDate ? 'error' : ''}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  {errors.startDate && <span className="error-message">{errors.startDate.message}</span>}
                </div>

                <div className="half-day-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isStartDateHalfDay}
                      onChange={(e) => handleHalfDayChange('isStartDateHalfDay', e.target.checked)}
                    />
                    <span>Half Day</span>
                  </label>
                  
                  {isStartDateHalfDay && (
                    <div className="half-day-options">
                      <div className="radio-group-title">Session</div>
                      <div className="radio-options">
                        <label className="radio-label">
                          <input
                            type="radio"
                            value="FIRST_HALF"
                            checked={startDateHalfDayType === 'FIRST_HALF'}
                            onChange={() => setValue('startDateHalfDayType', 'FIRST_HALF')}
                          />
                          <span>Morning</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            value="SECOND_HALF"
                            checked={startDateHalfDayType === 'SECOND_HALF'}
                            onChange={() => setValue('startDateHalfDayType', 'SECOND_HALF')}
                          />
                          <span>Afternoon</span>
                        </label>
                      </div>
                      {errors.startDateHalfDayType && (
                        <span className="error-message">{errors.startDateHalfDayType.message}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* End Date Column */}
              <div className="date-column">
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <div className="date-input-wrapper">
                    <CalendarIcon className="icon" />
                    <input
                      type="date"
                      id="endDate"
                      {...register('endDate', { 
                        required: 'End date is required',
                        onChange: () => validateDates()
                      })}
                      className={errors.endDate ? 'error' : ''}
                      min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  {errors.endDate && <span className="error-message">{errors.endDate.message}</span>}
                </div>

                <div className="half-day-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isEndDateHalfDay}
                      onChange={(e) => handleHalfDayChange('isEndDateHalfDay', e.target.checked)}
                      disabled={startDate === endDate && isStartDateHalfDay}
                    />
                    <span>Half Day</span>
                  </label>
                  
                  {isEndDateHalfDay && (
                    <div className="half-day-options">
                      <div className="radio-group-title">Session</div>
                      <div className="radio-options">
                        <label className="radio-label">
                          <input
                            type="radio"
                            value="FIRST_HALF"
                            checked={endDateHalfDayType === 'FIRST_HALF'}
                            onChange={() => setValue('endDateHalfDayType', 'FIRST_HALF')}
                          />
                          <span>Morning</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            value="SECOND_HALF"
                            checked={endDateHalfDayType === 'SECOND_HALF'}
                            onChange={() => setValue('endDateHalfDayType', 'SECOND_HALF')}
                          />
                          <span>Afternoon</span>
                        </label>
                      </div>
                      {errors.endDateHalfDayType && (
                        <span className="error-message">{errors.endDateHalfDayType.message}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Reason</h2>
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason for Leave</label>
              <textarea
                id="reason"
                {...register('reason', { required: 'Please provide a reason for your leave' })}
                className={errors.reason ? 'error' : ''}
                rows={4}
                placeholder="Please provide a detailed reason for your leave request..."
              />
              {errors.reason && <span className="error-message">{errors.reason.message}</span>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/leave')}
              className="button secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={isSubmitting || !!dateValidationError}
            >
              {isSubmitting ? 'Submitting...' : id ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;