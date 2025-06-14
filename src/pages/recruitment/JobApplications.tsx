import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobPosting, JobApplication, ApplicationStatus } from '../../types/recruitment';
import api from '../../services/api';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import UpdateStatusModal from '../../components/recruitment/UpdateStatusModal';
import './recruitment.css';

const JobApplications = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    fetchJobAndApplications();
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      const [jobResponse, applicationsResponse] = await Promise.all([
        api.recruitment.getJobById(jobId!),
        api.recruitment.getAllApplications({ jobId: jobId })
      ]);
      setJob(jobResponse.data);
      setApplications(applicationsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications. Please try again later.');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: ApplicationStatus, note: string) => {
    if (!selectedApplication) return;

    try {
      await api.recruitment.updateApplicationStatus(selectedApplication.id, status);
      
      // Update the local state
      setApplications(prevApplications =>
        prevApplications.map(app =>
          app.id === selectedApplication.id
            ? {
                ...app,
                status,
                timeline: [
                  {
                    status,
                    note,
                    timestamp: new Date().toISOString()
                  },
                  ...app.timeline
                ]
              }
            : app
        )
      );

      setIsUpdateStatusModalOpen(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Error updating application status:', err);
      // You might want to show an error message to the user here
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.SCREENING:
        return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.INTERVIEW:
        return 'bg-purple-100 text-purple-800';
      case ApplicationStatus.OFFER:
        return 'bg-green-100 text-green-800';
      case ApplicationStatus.HIRED:
        return 'bg-emerald-100 text-emerald-800';
      case ApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter(app => app.status === selectedStatus);

  if (loading) {
    return (
      <div className="recruitment-container">
        <div className="flex items-center justify-center h-full">
          <div>
            <div className="loading-spinner mb-4" />
            <p className="recruitment-subtitle">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="recruitment-container">
        <div className="error-message">
          <XCircleIcon className="h-5 w-5" />
          <span>{error || 'Job not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recruitment-container">
      {/* Header */}
      <div className="recruitment-header flex-col sm:flex-row gap-4">
        <div className="recruitment-title">
          <button
            onClick={() => navigate(`/recruitment/jobs/${jobId}`)}
            className="back-button mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Job Details</span>
          </button>
          <h1>Applications for {job.title}</h1>
          <p className="recruitment-subtitle">
            {applications.length} total applications
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-[200px] px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {Object.values(ApplicationStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="recruitment-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {application.candidate.name}
                    </h3>
                    <span className={`status-badge ${application.status.toLowerCase()}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`mailto:${application.candidate.email}`} className="hover:text-blue-600 truncate">
                      {application.candidate.email}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`tel:${application.candidate.phone}`} className="hover:text-blue-600">
                      {application.candidate.phone}
                    </a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <a
                      href={application.candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <DocumentIcon className="h-4 w-4 mr-1" />
                      Resume
                    </a>
                    {application.candidate.coverLetterUrl && (
                      <a
                        href={application.candidate.coverLetterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <DocumentIcon className="h-4 w-4 mr-1" />
                        Cover Letter
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedApplication(application);
                    setIsUpdateStatusModalOpen(true);
                  }}
                  className="btn btn-secondary w-full sm:w-auto"
                >
                  Update Status
                </button>
                <button
                  onClick={() => navigate(`/recruitment/jobs/${jobId}/applications/${application.id}`)}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Update Status Modal */}
      {isUpdateStatusModalOpen && selectedApplication && (
        <UpdateStatusModal
          currentStatus={selectedApplication.status}
          isOpen={isUpdateStatusModalOpen}
          onClose={() => {
            setIsUpdateStatusModalOpen(false);
            setSelectedApplication(null);
          }}
          onUpdate={(status, note) => handleUpdateStatus(status, note)}
        />
      )}
    </div>
  );
};

export default JobApplications; 