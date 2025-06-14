import React from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LeaveType, LeaveTypeFormData } from '../../types/leave';
import './LeaveTypeForm.css';

interface LeaveTypeFormProps {
  leaveType?: LeaveType | null;
  onSubmit: (data: LeaveTypeFormData) => Promise<void>;
  onClose: () => void;
}

const LeaveTypeForm: React.FC<LeaveTypeFormProps> = ({
  leaveType,
  onSubmit,
  onClose
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<LeaveTypeFormData>({
    defaultValues: leaveType ? {
      name: leaveType.name,
      description: leaveType.description,
      defaultDays: leaveType.defaultDays,
      isActive: leaveType.isActive
    } : {
      name: '',
      description: '',
      defaultDays: 0,
      isActive: true
    }
  });

  const handleFormSubmit = async (data: LeaveTypeFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting leave type:', error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{leaveType ? 'Edit Leave Type' : 'Create Leave Type'}</h2>
          <button
            className="close-button"
            onClick={onClose}
            type="button"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="leave-type-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              })}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter leave type name"
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters'
                }
              })}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Enter leave type description"
              rows={3}
            />
            {errors.description && (
              <span className="error-message">{errors.description.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="defaultDays">Default Days</label>
            <input
              id="defaultDays"
              type="number"
              {...register('defaultDays', {
                required: 'Default days is required',
                min: {
                  value: 0,
                  message: 'Default days must be 0 or greater'
                },
                max: {
                  value: 365,
                  message: 'Default days cannot exceed 365'
                }
              })}
              className={`form-input ${errors.defaultDays ? 'error' : ''}`}
              placeholder="Enter default days allowed"
            />
            {errors.defaultDays && (
              <span className="error-message">{errors.defaultDays.message}</span>
            )}
          </div>

          <div className="form-group toggle-group">
            <div className="toggle-wrapper">
              <span className="toggle-label">Active</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  {...register('isActive')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <span className="toggle-description">Enable or disable this leave type for employees</span>
          </div>

          <div className="form-group toggle-group">
            <div className="toggle-wrapper">
              <span className="toggle-label">Allow Carry Forward</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  {...register('allowCarryForward')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <span className="toggle-description">Allow unused leave days to be carried forward to next year</span>
          </div>

          {watch('allowCarryForward') && (
            <div className="form-group">
              <label htmlFor="maxCarryForwardDays">Maximum Carry Forward Days</label>
              <input
                id="maxCarryForwardDays"
                type="number"
                {...register('maxCarryForwardDays', {
                  required: 'Maximum carry forward days is required when carry forward is enabled',
                  min: {
                    value: 1,
                    message: 'Maximum carry forward days must be at least 1'
                  },
                  max: {
                    value: watch('defaultDays'),
                    message: 'Maximum carry forward days cannot exceed default days'
                  }
                })}
                className={`form-input ${errors.maxCarryForwardDays ? 'error' : ''}`}
                placeholder="Enter maximum days that can be carried forward"
              />
              {errors.maxCarryForwardDays && (
                <span className="error-message">{errors.maxCarryForwardDays.message}</span>
              )}
            </div>
          )}

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner small" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{leaveType ? 'Update' : 'Create'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveTypeForm; 