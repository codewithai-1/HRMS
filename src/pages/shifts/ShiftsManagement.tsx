import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import { Shift } from '../../types/shift';
import './ShiftsManagement.css';

const ShiftsManagement = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await api.shifts.getAll();
        setShifts(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load shifts. Please try again later.');
        console.error('Error fetching shifts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  const handleCreateShift = () => {
    navigate('/shifts/new');
  };

  const handleEditShift = (shift: Shift) => {
    navigate(`/shifts/${shift.id}`);
  };

  const handleDeleteClick = (shift: Shift) => {
    setShiftToDelete(shift);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (shiftToDelete) {
      try {
        await api.shifts.delete(shiftToDelete.id);
        setShifts(shifts.filter(s => s.id !== shiftToDelete.id));
        setIsDeleteModalOpen(false);
        setShiftToDelete(null);
      } catch (err) {
        console.error('Error deleting shift:', err);
        setError('Failed to delete shift. Please try again later.');
      }
    }
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredShifts = shifts
    .filter(shift => 
      shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

  const getSortIcon = () => {
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="sort-icon" />
    ) : (
      <ChevronDownIcon className="sort-icon" />
    );
  };

  if (loading) {
    return (
      <div className="shifts-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="shifts-container">
      {/* Header Section */}
      <div className="shifts-header">
        <div className="shifts-title">
          <h1>Shift Management</h1>
          <p className="text-subtitle">Manage employee shifts and schedules</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10"
            />
          </div>
          <button
            className="create-shift-button"
            onClick={handleCreateShift}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Shift</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Shifts Grid */}
      <div className="shifts-list">
        <div className="shifts-grid">
          <div className="shifts-grid-header">
            <div 
              className="sortable-header"
              onClick={handleSort}
            >
              <span>Shift Name</span>
              {getSortIcon()}
            </div>
            <div className="col-type">Type</div>
            <div className="col-time">Time</div>
            <div className="col-timezone">Timezone</div>
            <div className="col-break">Break</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="shifts-grid-body">
            {filteredShifts.length === 0 ? (
              <div className="empty-message">
                No shifts found. Create a new shift to get started.
              </div>
            ) : (
              filteredShifts.map((shift) => (
                <div key={shift.id} className="shifts-grid-row">
                  <div className="sortable-column">
                    <span className="shift-name">
                      {shift.name}
                    </span>
                  </div>
                  <div className="col-type">
                    <span className="shift-type">
                      {shift.type}
                    </span>
                  </div>
                  <div className="col-time">
                    <div className="shift-time">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                    </div>
                  </div>
                  <div className="col-timezone">
                    <span className="shift-timezone">
                      {shift.timezone}
                    </span>
                  </div>
                  <div className="col-break">
                    <span className="break-duration">
                      {shift.breakDuration} min
                    </span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${shift.status.toLowerCase()}`}>
                      {shift.status}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-button edit"
                      onClick={() => handleEditShift(shift)}
                      title="Edit shift"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(shift)}
                      title="Delete shift"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && shiftToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Shift</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the shift "{shiftToDelete.name}"?</p>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsManagement; 