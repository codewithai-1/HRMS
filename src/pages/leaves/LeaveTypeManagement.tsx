import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LeaveType, LeaveTypeFormData } from '../../types/leave';
import leaveService from '../../services/leaveService';
import LeaveTypeForm from './LeaveTypeForm';
import './LeaveTypeManagement.css';

const LeaveTypeManagement = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState<LeaveType | null>(null);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        console.log('Fetching leave types...');
        const response = await leaveService.leaveTypes.getAll();
        console.log('Leave types response:', response);
        setLeaveTypes(response.data);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load leave types';
        setError(`Error: ${errorMessage}. Please try again later.`);
        console.error('Detailed error fetching leave types:', {
          error: err,
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveTypes();
  }, []);

  const handleCreateLeaveType = () => {
    setSelectedLeaveType(null);
    setIsModalOpen(true);
  };

  const handleEditLeaveType = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (leaveType: LeaveType) => {
    setLeaveTypeToDelete(leaveType);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (leaveTypeToDelete) {
      try {
        await leaveService.leaveTypes.delete(leaveTypeToDelete.id);
        setLeaveTypes(leaveTypes.filter(lt => lt.id !== leaveTypeToDelete.id));
        setIsDeleteModalOpen(false);
        setLeaveTypeToDelete(null);
      } catch (err) {
        console.error('Error deleting leave type:', err);
        setError('Failed to delete leave type. Please try again later.');
      }
    }
  };

  const handleSubmitLeaveType = async (data: LeaveTypeFormData) => {
    try {
      if (selectedLeaveType) {
        // Update existing leave type
        const response = await leaveService.leaveTypes.update(selectedLeaveType.id, data);
        setLeaveTypes(leaveTypes.map(lt =>
          lt.id === selectedLeaveType.id ? response.data : lt
        ));
      } else {
        // Create new leave type
        const response = await leaveService.leaveTypes.create(data);
        setLeaveTypes([...leaveTypes, response.data]);
      }
      setIsModalOpen(false);
      setSelectedLeaveType(null);
      setError(null);
    } catch (err) {
      console.error('Error submitting leave type:', err);
      setError('Failed to save leave type. Please try again later.');
    }
  };

  const filteredLeaveTypes = leaveTypes.filter(leaveType =>
    leaveType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leaveType.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="leave-types-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="leave-types-container">
      {/* Header Section */}
      <div className="leave-types-header">
        <div className="leave-types-title">
          <h1>Leave Type Management</h1>
          <p className="text-subtitle">Manage organization leave types and policies</p>
        </div>
        <div className="actions-wrapper">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search leave types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10"
            />
          </div>
          <button
            className="create-button"
            onClick={handleCreateLeaveType}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Leave Type</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Leave Types Grid */}
      <div className="leave-types-list">
        <div className="leave-types-grid">
          <div className="leave-types-grid-header">
            <div className="col-name">Name</div>
            <div className="col-description">Description</div>
            <div className="col-days">Default Days</div>
            <div className="col-carry-forward">Carry Forward</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="leave-types-grid-body">
            {filteredLeaveTypes.length === 0 ? (
              <div className="empty-message">
                No leave types found. Create your first leave type to get started.
              </div>
            ) : (
              filteredLeaveTypes.map((leaveType) => (
                <div key={leaveType.id} className="leave-types-grid-row">
                  <div className="col-name">
                    <span className="leave-type-name">
                      {leaveType.name}
                    </span>
                  </div>
                  <div className="col-description">
                    <span className="leave-type-description">
                      {leaveType.description}
                    </span>
                  </div>
                  <div className="col-days">
                    <span className="leave-type-days">
                      {leaveType.defaultDays} days
                    </span>
                  </div>
                  <div className="col-carry-forward">
                    {leaveType.allowCarryForward ? (
                      <span className="carry-forward-badge">
                        Up to {leaveType.maxCarryForwardDays} days
                      </span>
                    ) : (
                      <span className="carry-forward-badge disabled">
                        Not allowed
                      </span>
                    )}
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${leaveType.isActive ? 'active' : 'inactive'}`}>
                      {leaveType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-button edit"
                      onClick={() => handleEditLeaveType(leaveType)}
                      title="Edit leave type"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(leaveType)}
                      title="Delete leave type"
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
      {isDeleteModalOpen && leaveTypeToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Leave Type</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the leave type "{leaveTypeToDelete.name}"?</p>
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

      {/* Leave Type Form Modal */}
      {isModalOpen && (
        <LeaveTypeForm
          leaveType={selectedLeaveType}
          onSubmit={handleSubmitLeaveType}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLeaveType(null);
          }}
        />
      )}
    </div>
  );
};

export default LeaveTypeManagement; 