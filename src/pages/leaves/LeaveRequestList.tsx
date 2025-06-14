import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  PencilIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { LeaveRequest, LeaveRequestFormData, LeaveStatus } from '../../types/leave';
import leaveService from '../../services/leaveService';
import { format } from 'date-fns';
import './LeaveRequestList.css';

const LeaveRequestList: React.FC = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeaveStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      console.log('Fetching leave requests with status:', selectedStatus);
      
      const response = await leaveService.leaveRequests.getAll({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus
      });

      console.log('Leave requests response:', response.data);

      // Validate and transform the data if needed
      const validatedRequests = response.data.map(request => {
        if (!request.leaveType) {
          console.warn(`Leave request ${request.id} is missing leave type information`);
          // Add a default leave type if missing
          return {
            ...request,
            leaveType: {
              id: 'unknown',
              name: 'Unknown Leave Type',
              description: 'Leave type information not available',
              defaultDays: 0,
              isActive: true,
              allowCarryForward: false,
              maxCarryForwardDays: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          };
        }
        return request;
      });

      console.log('Processed leave requests:', validatedRequests);
      setLeaveRequests(validatedRequests);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching leave requests:', {
        error: err,
        message: err.message || 'Unknown error',
        response: err.response || null,
        stack: err.stack || 'No stack trace available'
      });
      setError('Failed to load leave requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeaveRequest = async (data: LeaveRequestFormData) => {
    try {
      const response = await leaveService.leaveRequests.create(data);
      setLeaveRequests([response.data, ...leaveRequests]);
      setError(null);
    } catch (err) {
      console.error('Error creating leave request:', err);
      setError('Failed to create leave request. Please try again later.');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await leaveService.leaveRequests.cancel(requestId);
      setLeaveRequests(leaveRequests.map(request =>
        request.id === requestId
          ? { ...request, status: LeaveStatus.CANCELLED }
          : request
      ));
      setError(null);
    } catch (err) {
      console.error('Error cancelling leave request:', err);
      setError('Failed to cancel leave request. Please try again later.');
    }
  };

  const handleEditRequest = (request: LeaveRequest) => {
    navigate(`/leave/edit/${request.id}`);
  };

  const handleUpdateRequest = async (data: LeaveRequestFormData) => {
    if (!selectedRequest) return;

    try {
      const response = await leaveService.leaveRequests.update(selectedRequest.id, data);
      setLeaveRequests(leaveRequests.map(request =>
        request.id === selectedRequest.id ? response.data : request
      ));
      setSelectedRequest(null);
      setError(null);
    } catch (err) {
      console.error('Error updating leave request:', err);
      setError('Failed to update leave request. Please try again later.');
    }
  };

  const handleApproveClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (status: LeaveStatus) => {
    if (!selectedRequest) return;

    try {
      await leaveService.leaveRequests.updateStatus(
        selectedRequest.id,
        status,
        approvalComment
      );

      setLeaveRequests(leaveRequests.map(request =>
        request.id === selectedRequest.id
          ? { ...request, status, managerComments: approvalComment }
          : request
      ));

      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      setApprovalComment('');
      setError(null);
    } catch (err) {
      console.error('Error updating leave request status:', err);
      setError('Failed to update leave request status. Please try again later.');
    }
  };

  const getStatusBadgeClass = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'status-badge approved';
      case LeaveStatus.REJECTED:
        return 'status-badge rejected';
      case LeaveStatus.CANCELLED:
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  };

  if (loading) {
    return (
      <div className="leave-requests-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="leave-requests-container">
        {/* Header Section */}
        <div className="leave-requests-header">
          <div className="leave-requests-title">
            <h1>My Leave Requests</h1>
            <p className="text-subtitle">View and manage your leave requests</p>
          </div>
          <div className="actions-wrapper">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as LeaveStatus | 'ALL')}
              className="status-filter"
            >
              <option value="ALL">All Status</option>
              {Object.values(LeaveStatus).map(status => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <button
              className="create-button"
              onClick={() => navigate('/leave/apply')}
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Leave Requests List */}
        <div className="leave-requests-list">
          {leaveRequests.length === 0 ? (
            <div className="empty-message">
              <p>No leave requests found.</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/leave/apply')}
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create Your First Request</span>
              </button>
            </div>
          ) : (
            leaveRequests.map((request) => (
              <div key={request.id} className="leave-request-card">
                <div className="leave-request-header">
                  <div className="leave-type-info">
                    <h3>{request.leaveType?.name || 'Leave Request'}</h3>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status.charAt(0) + request.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="action-buttons">
                    {request.status === LeaveStatus.PENDING && (
                      <>
                        <button
                          className="action-button approve"
                          onClick={() => handleApproveClick(request)}
                          title="Approve/Reject request"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="action-button edit"
                          onClick={() => handleEditRequest(request)}
                          title="Edit request"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="action-button cancel"
                          onClick={() => handleCancelRequest(request.id)}
                          title="Cancel request"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="leave-request-details">
                  <div className="detail-item">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      {format(new Date(request.startDate), 'MMM d, yyyy')} - {format(new Date(request.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <ClockIcon className="w-4 h-4" />
                    <span>{request.numberOfDays} working days</span>
                  </div>
                  {request.leaveType && (
                    <div className="detail-item">
                      <span className="text-sm text-gray-600">Type: {request.leaveType.name}</span>
                    </div>
                  )}
                </div>

                <div className="leave-request-reason">
                  <p>{request.reason}</p>
                </div>

                {request.managerComments && (
                  <div className="manager-comments">
                    <strong>Manager Comments:</strong>
                    <p>{request.managerComments}</p>
                  </div>
                )}

                <div className="leave-request-footer">
                  <div className="detail-item text-sm text-gray-500">
                    Applied on {format(new Date(request.appliedDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Approve/Reject Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Review Leave Request</h2>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add your comments here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsApproveModalOpen(false);
                  setSelectedRequest(null);
                  setApprovalComment('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger ml-2"
                onClick={() => handleApproveSubmit(LeaveStatus.REJECTED)}
              >
                <XCircleIcon className="w-4 h-4 mr-1" />
                Reject
              </button>
              <button
                className="btn btn-success ml-2"
                onClick={() => handleApproveSubmit(LeaveStatus.APPROVED)}
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveRequestList; 