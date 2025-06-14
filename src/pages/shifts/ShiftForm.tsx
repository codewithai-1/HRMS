import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Shift, ShiftType, commonTimezones } from '../../types/shift';
import api from '../../services/api';
import './ShiftForm.css';

const SHIFT_TYPES: ShiftType[] = ['MORNING', 'AFTERNOON', 'NIGHT', 'CUSTOM'];

type ShiftFormData = Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>;

const ShiftForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ShiftFormData>({
    name: '',
    type: 'MORNING',
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'UTC',
    breakDuration: 60,
    status: 'ACTIVE',
    description: ''
  });

  useEffect(() => {
    if (isEditing && id) {
      const fetchShift = async () => {
        try {
          setLoading(true);
          const response = await api.shifts.getById(id);
          const { id: _, createdAt: __, updatedAt: ___, ...shiftData } = response.data;
          setFormData(shiftData);
          setError(null);
        } catch (err) {
          setError('Failed to load shift details. Please try again later.');
          console.error('Error fetching shift:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchShift();
    }
  }, [id, isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (isEditing && id) {
        await api.shifts.update(id, formData);
      } else {
        await api.shifts.create(formData);
      }
      navigate('/shifts');
    } catch (err) {
      setError('Failed to save shift. Please try again later.');
      console.error('Error saving shift:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="shift-form-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="shift-form-container">
      <div className="header">
        <button
          onClick={() => navigate('/shifts')}
          className="back-button"
          title="Back to shifts"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1>{isEditing ? 'Edit Shift' : 'Create New Shift'}</h1>
          <p className="text-subtitle">
            {isEditing ? 'Update shift details' : 'Add a new shift schedule'}
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shift-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Shift Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter shift name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Shift Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                {SHIFT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Schedule Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                required
              >
                {commonTimezones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="breakDuration">Break Duration (minutes)</label>
              <input
                type="number"
                id="breakDuration"
                name="breakDuration"
                value={formData.breakDuration}
                onChange={handleInputChange}
                min="0"
                max="240"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Additional Information</h2>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter shift description"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/shifts')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-sm" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Shift' : 'Create Shift'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShiftForm; 