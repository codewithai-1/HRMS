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
import { Regularization } from '../../types/attendance';
import RegularizationRequestForm from './RegularizationRequestForm';
import './attendance.css';

const RegularizationPage: React.FC = () => {
  const navigate = useNavigate();
  const [regularizationRequests, setRegularizationRequests] = useState<Regularization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);

  useEffect(() => {
    fetchRegularizationRequests();
  }, []);

  const fetchRegularizationRequests = async () => {
    try {
      setLoading(true);
      const response = await attendanceService.regularizations.getAll();
      setRegularizationRequests(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching regularization requests:', err);
      setError('Failed to load regularization requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRegularizationSubmit = async (data: any) => {
    try {
      await attendanceService.regularizations.create(data);
      setShowRegularizationModal(false);
      await fetchRegularizationRequests();
    } catch (err) {
      console.error('Error submitting regularization:', err);
      setError('Failed to submit regularization request');
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
          <h1>Regularization Requests</h1>
          <p className="text-subtitle">Track and manage your attendance regularization requests</p>
        </div>
        <button
          onClick={() => setShowRegularizationModal(true)}
          className="btn btn-primary"
        >
          Request Regularization
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="attendance-content">
        {/* Regularization Requests Table */}
        <div className="attendance-card">
          <div className="overflow-x-auto">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner" />
                      </div>
                    </td>
                  </tr>
                ) : regularizationRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No regularization requests found
                    </td>
                  </tr>
                ) : (
                  regularizationRequests.map(request => (
                    <tr key={request.id}>
                      <td>{format(new Date(request.date), 'dd MMM yyyy')}</td>
                      <td>{request.requestedClockIn ? format(new Date(request.requestedClockIn), 'hh:mm a') : '-'}</td>
                      <td>{request.requestedClockOut ? format(new Date(request.requestedClockOut), 'hh:mm a') : '-'}</td>
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

      {/* Regularization Modal */}
      {showRegularizationModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Request Regularization</h2>
              <button
                onClick={() => setShowRegularizationModal(false)}
                className="close-button"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <RegularizationRequestForm 
              onSubmit={handleRegularizationSubmit}
              onClose={() => setShowRegularizationModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularizationPage; 