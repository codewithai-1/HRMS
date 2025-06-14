import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobApplication, ApplicationStatus } from '../../types/recruitment';
import api from '../../services/api';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import UpdateStatusModal from '../../components/recruitment/UpdateStatusModal';
import ScheduleInterviewModal from '../../components/recruitment/ScheduleInterviewModal';
import AddEvaluationModal from '../../components/recruitment/AddEvaluationModal';
import './recruitment.css';

const ApplicationDetails = () => {
  const { jobId, applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [isAddEvaluationModalOpen, setIsAddEvaluationModalOpen] = useState(false);

  useEffect(() => {
    if (applicationId) {
      fetchApplicationDetails();
    } else {
      setError('Application ID is missing');
    }
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state before fetching
      const response = await api.recruitment.getApplicationById(applicationId!);
      if (response.data) {
        setApplication(response.data);
      } else {
        setError('No application data found');
      }
    } catch (err) {
      setError('Failed to load application details. Please try again later.');
      console.error('Error fetching application details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: ApplicationStatus, note: string) => {
    if (!application) return;

    try {
      await api.recruitment.updateApplicationStatus(application.id, status);
      
      // Update the local state
      setApplication(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status,
          timeline: [
            {
              status,
              note,
              timestamp: new Date().toISOString()
            },
            ...prev.timeline
          ]
        };
      });

      setIsUpdateStatusModalOpen(false);
    } catch (err) {
      console.error('Error updating application status:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleScheduleInterview = async (data: {
    type: string;
    interviewerName: string;
    scheduledAt: string;
    notes?: string;
  }) => {
    if (!application) return;

    try {
      const interviewData = {
        type: data.type as "PHONE" | "VIDEO" | "IN_PERSON",
        interviewerId: "temp-" + Date.now(), // You might want to get this from the logged-in user
        interviewerName: data.interviewerName,
        scheduledAt: data.scheduledAt
      };

      await api.recruitment.scheduleInterview(application.id, interviewData);
      
      // Update the local state
      setApplication(prev => {
        if (!prev) return null;
        return {
          ...prev,
          interviews: [
            ...prev.interviews,
            {
              ...interviewData,
              id: Date.now().toString(), // Temporary ID until API returns the real one
              status: "SCHEDULED" as const,
              feedback: undefined,
              rating: undefined
            }
          ]
        };
      });

      setIsScheduleInterviewModalOpen(false);
    } catch (err) {
      console.error('Error scheduling interview:', err);
    }
  };

  const handleAddEvaluation = async (data: {
    evaluatorName: string;
    score: number;
    comments: string;
  }) => {
    if (!application) return;

    try {
      const evaluationData = {
        evaluatorId: "temp-" + Date.now(), // You might want to get this from the logged-in user
        evaluatorName: data.evaluatorName,
        score: data.score,
        comments: data.comments
      };

      await api.recruitment.addEvaluation(application.id, evaluationData);
      
      // Update the local state
      setApplication(prev => {
        if (!prev) return null;
        return {
          ...prev,
          evaluations: [
            ...prev.evaluations,
            {
              ...evaluationData,
              id: Date.now().toString(), // Temporary ID until API returns the real one
              createdAt: new Date().toISOString()
            }
          ]
        };
      });

      setIsAddEvaluationModalOpen(false);
    } catch (err) {
      console.error('Error adding evaluation:', err);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
      [ApplicationStatus.NEW]: "bg-blue-100 text-blue-800",
      [ApplicationStatus.SCREENING]: "bg-yellow-100 text-yellow-800",
      [ApplicationStatus.INTERVIEW]: "bg-purple-100 text-purple-800",
      [ApplicationStatus.OFFER]: "bg-green-100 text-green-800",
      [ApplicationStatus.HIRED]: "bg-emerald-100 text-emerald-800",
      [ApplicationStatus.REJECTED]: "bg-red-100 text-red-800",
      [ApplicationStatus.WITHDRAWN]: "bg-gray-100 text-gray-800"
    };
    
    return (
      <span className={`${baseClasses} ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="recruitment-container">
        <div className="flex items-center justify-center h-full">
          <div>
            <div className="loading-spinner mb-4" />
            <p className="recruitment-subtitle">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="recruitment-container">
        <div className="error-message">
          <XCircleIcon className="h-5 w-5" />
          <span>{error || 'Application not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recruitment-container">
      <div className="recruitment-header flex-col sm:flex-row gap-4">
        <div className="recruitment-title flex-1 min-w-0">
          <button
            onClick={() => navigate(`/recruitment/jobs/${jobId}/applications`)}
            className="back-button mb-4 w-full sm:w-auto"
          >
            <ArrowLeftIcon className="h-5 w-5 shrink-0" />
            <span className="truncate">Back to Applications</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="truncate">{application.candidate.name}</h1>
            <span className={`status-badge ${application.status.toLowerCase()} w-fit`}>
              {application.status}
            </span>
          </div>
          <p className="recruitment-subtitle truncate">
            Application for Job ID: {application.jobId}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsUpdateStatusModalOpen(true)}
            className="btn btn-primary w-full sm:w-auto"
          >
            Update Status
          </button>
          <button
            onClick={() => setIsScheduleInterviewModalOpen(true)}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Schedule Interview
          </button>
          <button
            onClick={() => setIsAddEvaluationModalOpen(true)}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Add Evaluation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Information */}
          <div className="recruitment-card">
            <h2 className="form-section-title">Candidate Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2 min-w-0">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 shrink-0" />
                <a href={`mailto:${application.candidate.email}`} className="hover:text-blue-600 truncate">
                  {application.candidate.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-5 w-5 text-gray-400 shrink-0" />
                <a href={`tel:${application.candidate.phone}`} className="hover:text-blue-600">
                  {application.candidate.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400 shrink-0" />
                <span>Applied on {format(new Date(application.appliedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Resume & Cover Letter */}
          <div className="recruitment-card">
            <h2 className="form-section-title">Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Resume</h3>
                <a
                  href={application.candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex w-full sm:w-auto justify-center"
                >
                  <DocumentIcon className="h-5 w-5 shrink-0" />
                  <span>Download Resume</span>
                </a>
              </div>
              {application.candidate.coverLetterUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h3>
                  <a
                    href={application.candidate.coverLetterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary inline-flex w-full sm:w-auto justify-center"
                  >
                    <DocumentIcon className="h-5 w-5 shrink-0" />
                    <span>Download Cover Letter</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="recruitment-card">
            <h2 className="form-section-title">Application Timeline</h2>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {application.timeline.map((event, eventIdx) => (
                  <li key={eventIdx}>
                    <div className="relative pb-8">
                      {eventIdx !== application.timeline.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex gap-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              event.status === ApplicationStatus.REJECTED
                                ? 'bg-red-100'
                                : event.status === ApplicationStatus.HIRED
                                ? 'bg-green-100'
                                : 'bg-blue-100'
                            }`}
                          >
                            {event.status === ApplicationStatus.REJECTED ? (
                              <XCircleIcon className="h-5 w-5 text-red-600" />
                            ) : event.status === ApplicationStatus.HIRED ? (
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-blue-600" />
                            )}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              Status changed to {event.status}
                            </span>
                          </div>
                          {event.note && (
                            <p className="mt-1 text-sm text-gray-600">{event.note}</p>
                          )}
                          <p className="mt-1 text-sm text-gray-500">
                            {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interviews */}
          <div className="recruitment-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="form-section-title mb-0">Interviews</h2>
              <button
                onClick={() => setIsScheduleInterviewModalOpen(true)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Schedule Interview
              </button>
            </div>

            {application.interviews.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No interviews scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {application.interviews.map((interview, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{interview.type} Interview</span>
                          <span className={`status-badge ${interview.status.toLowerCase()}`}>
                            {interview.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="truncate">Interviewer: {interview.interviewerName}</p>
                          <p>
                            Scheduled for:{' '}
                            {format(new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evaluations */}
          <div className="recruitment-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="form-section-title mb-0">Evaluations</h2>
              <button
                onClick={() => setIsAddEvaluationModalOpen(true)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Add Evaluation
              </button>
            </div>

            {application.evaluations.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No evaluations added yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {application.evaluations.map((evaluation, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-medium text-gray-900 truncate">{evaluation.evaluatorName}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(evaluation.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-5 w-5 ${
                              i < evaluation.score ? 'fill-current' : 'stroke-current'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 break-words">{evaluation.comments}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="recruitment-card">
            <h2 className="form-section-title">Application Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Job ID</h3>
                  <p className="text-gray-600 truncate">{application.jobId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <CalendarIcon className="h-6 w-6 text-green-500 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Applied Date</h3>
                  <p className="text-gray-600">
                    {format(new Date(application.appliedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <ClockIcon className="h-6 w-6 text-yellow-500 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Last Updated</h3>
                  <p className="text-gray-600">
                    {format(new Date(application.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isUpdateStatusModalOpen && (
        <UpdateStatusModal
          currentStatus={application.status}
          isOpen={isUpdateStatusModalOpen}
          onClose={() => setIsUpdateStatusModalOpen(false)}
          onUpdate={handleUpdateStatus}
        />
      )}

      {isScheduleInterviewModalOpen && (
        <ScheduleInterviewModal
          isOpen={isScheduleInterviewModalOpen}
          onClose={() => setIsScheduleInterviewModalOpen(false)}
          onSchedule={handleScheduleInterview}
        />
      )}

      {isAddEvaluationModalOpen && (
        <AddEvaluationModal
          isOpen={isAddEvaluationModalOpen}
          onClose={() => setIsAddEvaluationModalOpen(false)}
          onSubmit={handleAddEvaluation}
        />
      )}
    </div>
  );
};

export default ApplicationDetails; 