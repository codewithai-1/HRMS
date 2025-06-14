import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import attendanceService from '../../services/attendanceService';
import { AttendanceSettings as AttendanceSettingsType } from '../../types/attendance';

const AttendanceSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<AttendanceSettingsType>();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.settings.get();
      reset(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load attendance settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AttendanceSettingsType) => {
    try {
      setLoading(true);
      await attendanceService.settings.update(data);
      setSuccess('Settings updated successfully');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Attendance Settings</h1>
        <p className="page-subtitle">Configure attendance rules and policies</p>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Working Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  {...register('workingHours.startTime', { required: 'Start time is required' })}
                  className={`mt-1 form-input ${errors.workingHours?.startTime ? 'error' : ''}`}
                />
                {errors.workingHours?.startTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.workingHours.startTime.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  {...register('workingHours.endTime', { required: 'End time is required' })}
                  className={`mt-1 form-input ${errors.workingHours?.endTime ? 'error' : ''}`}
                />
                {errors.workingHours?.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.workingHours.endTime.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Attendance Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Late Threshold (minutes)</label>
                <input
                  type="number"
                  min="0"
                  {...register('lateThreshold', {
                    required: 'Late threshold is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                  className={`mt-1 form-input ${errors.lateThreshold ? 'error' : ''}`}
                />
                {errors.lateThreshold && (
                  <p className="mt-1 text-sm text-red-600">{errors.lateThreshold.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Early Exit Threshold (minutes)</label>
                <input
                  type="number"
                  min="0"
                  {...register('earlyExitThreshold', {
                    required: 'Early exit threshold is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                  className={`mt-1 form-input ${errors.earlyExitThreshold ? 'error' : ''}`}
                />
                {errors.earlyExitThreshold && (
                  <p className="mt-1 text-sm text-red-600">{errors.earlyExitThreshold.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Permission Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Permission Limit (per month)</label>
                <input
                  type="number"
                  min="0"
                  {...register('permissionLimit', {
                    required: 'Permission limit is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                  className={`mt-1 form-input ${errors.permissionLimit ? 'error' : ''}`}
                />
                {errors.permissionLimit && (
                  <p className="mt-1 text-sm text-red-600">{errors.permissionLimit.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Permission Max Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  {...register('permissionMaxDuration', {
                    required: 'Permission max duration is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                  className={`mt-1 form-input ${errors.permissionMaxDuration ? 'error' : ''}`}
                />
                {errors.permissionMaxDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.permissionMaxDuration.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Other Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Grace Period (minutes)</label>
                <input
                  type="number"
                  min="0"
                  {...register('gracePeriod', {
                    required: 'Grace period is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                  className={`mt-1 form-input ${errors.gracePeriod ? 'error' : ''}`}
                />
                {errors.gracePeriod && (
                  <p className="mt-1 text-sm text-red-600">{errors.gracePeriod.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weekly Off Days</label>
                <select
                  multiple
                  {...register('weeklyOffDays')}
                  className="mt-1 form-select"
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-secondary"
            disabled={loading || !isDirty}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isDirty}
          >
            {loading ? (
              <>
                <div className="loading-spinner small" />
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettings; 