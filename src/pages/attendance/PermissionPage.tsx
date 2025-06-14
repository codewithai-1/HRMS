import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconSolid,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import attendanceService from '../../services/attendanceService';
import PermissionRequestForm from './PermissionRequestForm';
import './attendance.css';

interface PermissionRequest {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const PermissionPage: React.FC = () => {
  const [permissionRequests, setPermissionRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPermissionRequests();
  }, []);

  const fetchPermissionRequests = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.permissions.getAll();
      setPermissionRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching permission requests:', err);
      setError('Failed to load permission requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionSubmit = async (data: any) => {
    try {
      await attendanceService.permissions.create(data);
      setShowPermissionModal(false);
      await fetchPermissionRequests();
    } catch (err) {
      console.error('Error submitting permission:', err);
      setError('Failed to submit permission request');
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <ClockIconSolid className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getRequestStatusClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'status-badge approved';
      case 'REJECTED':
        return 'status-badge rejected';
      case 'PENDING':
        return 'status-badge pending';
      default:
        return 'status-badge';
    }
  };

  return (
    <div className="attendance-container">
      {/* Header Section */}
      <div className="attendance-header">
        <div className="attendance-title">
          <button 
            onClick={() => navigate('/attendance')}
            className="back-button mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Attendance</span>
          </button>
          <h1>Permission Requests</h1>
          <p className="text-subtitle">Track and manage your permission requests</p>
        </div>
        <button
          onClick={() => setShowPermissionModal(true)}
          className="btn btn-primary"
        >
          Apply for Permission
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="attendance-content">
        {/* Permission Requests Table */}
        <div className="attendance-card">
          <div className="overflow-x-auto">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner" />
                      </div>
                    </td>
                  </tr>
                ) : permissionRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No permission requests found
                    </td>
                  </tr>
                ) : (
                  permissionRequests.map(request => (
                    <tr key={request.id}>
                      <td>{format(new Date(request.date), 'dd MMM yyyy')}</td>
                      <td>{`${format(new Date(request.startTime), 'hh:mm a')} - ${format(new Date(request.endTime), 'hh:mm a')}`}</td>
                      <td>{request.reason}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {getRequestStatusIcon(request.status)}
                          <span className={getRequestStatusClass(request.status)}>
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td>{format(new Date(request.createdAt), 'dd MMM yyyy')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Apply Permission</h2>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="close-button"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <PermissionRequestForm 
              onSubmit={handlePermissionSubmit}
              onClose={() => setShowPermissionModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionPage; 