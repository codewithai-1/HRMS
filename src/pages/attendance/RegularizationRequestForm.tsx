import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, ClockIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { RegularizationFormData } from '../../types/attendance';
import { format } from 'date-fns';

interface RegularizationRequestFormProps {
  onSubmit: (data: RegularizationFormData) => Promise<void>;
  onClose: () => void;
}

const RegularizationRequestForm: React.FC<RegularizationRequestFormProps> = ({
  onSubmit,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegularizationFormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'CLOCK_IN',
      requestedClockIn: '',
      requestedClockOut: '',
      reason: ''
    }
  });

  const type = watch('type');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should not exceed 5MB');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFormSubmit = async (data: RegularizationFormData) => {
    try {
      if (selectedFile) {
        data.supportingDocument = selectedFile;
      }
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting regularization request:', error);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Regularization</h2>
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="regularization-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              {...register('date', {
                required: 'Date is required'
              })}
              className={`form-input ${errors.date ? 'error' : ''}`}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.date && (
              <span className="error-message">{errors.date.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="type">Regularization Type</label>
            <select
              id="type"
              {...register('type', {
                required: 'Please select regularization type'
              })}
              className={`form-select ${errors.type ? 'error' : ''}`}
            >
              <option value="CLOCK_IN">Clock In</option>
              <option value="CLOCK_OUT">Clock Out</option>
              <option value="BOTH">Both</option>
            </select>
            {errors.type && (
              <span className="error-message">{errors.type.message}</span>
            )}
          </div>

          {(type === 'CLOCK_IN' || type === 'BOTH') && (
            <div className="form-group">
              <label htmlFor="requestedClockIn">Requested Clock In Time</label>
              <div className="time-input-wrapper">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  id="requestedClockIn"
                  {...register('requestedClockIn', {
                    required: 'Clock in time is required'
                  })}
                  className={`form-input ${errors.requestedClockIn ? 'error' : ''}`}
                />
              </div>
              {errors.requestedClockIn && (
                <span className="error-message">{errors.requestedClockIn.message}</span>
              )}
            </div>
          )}

          {(type === 'CLOCK_OUT' || type === 'BOTH') && (
            <div className="form-group">
              <label htmlFor="requestedClockOut">Requested Clock Out Time</label>
              <div className="time-input-wrapper">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  id="requestedClockOut"
                  {...register('requestedClockOut', {
                    required: 'Clock out time is required'
                  })}
                  className={`form-input ${errors.requestedClockOut ? 'error' : ''}`}
                />
              </div>
              {errors.requestedClockOut && (
                <span className="error-message">{errors.requestedClockOut.message}</span>
              )}
            </div>
          )}

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
              placeholder="Please provide a detailed reason for your regularization request"
              rows={3}
            />
            {errors.reason && (
              <span className="error-message">{errors.reason.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="supportingDocument">Supporting Document</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="supportingDocument"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <label
                htmlFor="supportingDocument"
                className="file-input-label"
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                <span>
                  {selectedFile ? selectedFile.name : 'Upload Document'}
                </span>
              </label>
              <span className="file-input-help">
                Max file size: 5MB. Supported formats: PDF, JPG, PNG
              </span>
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
              disabled={isSubmitting}
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

export default RegularizationRequestForm; 