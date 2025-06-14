import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobPosting, JobStatus } from '../../types/recruitment';
import api from '../../services/api';
import { format } from 'date-fns';
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import './recruitment.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.recruitment.getJobById(id!);
      setJob(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load job details. Please try again later.');
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="recruitment-container">
        <div className="flex items-center justify-center h-full">
          <div>
            <div className="loading-spinner mb-4" />
            <p className="recruitment-subtitle">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="recruitment-container">
        <div className="error-message">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error || 'Job not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recruitment-container">
      {/* Header */}
      <div className="recruitment-header">
        <div className="recruitment-title">
          <button
            onClick={() => navigate('/recruitment')}
            className="back-button mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Jobs</span>
          </button>
          <div className="flex items-center gap-3">
            <h1>{job.title}</h1>
            {getStatusBadge(job.status)}
          </div>
          <p className="recruitment-subtitle">
            View and manage job posting details
          </p>
        </div>
        <button
          onClick={() => navigate(`/recruitment/jobs/${id}/applications`)}
          className="btn btn-primary"
        >
          <UserGroupIcon className="h-5 w-5" />
          <span>View Applications ({job.applicationsCount})</span>
        </button>
      </div>

      <div className="job-details-container">
        {/* Main Content */}
        <div className="job-details-main">
          <div className="recruitment-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span>Closing on {format(new Date(job.closingDate), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="recruitment-card">
            <h2 className="form-section-title">About the Role</h2>
            <p className="text-gray-600 whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>

          <div className="recruitment-card">
            <h2 className="form-section-title">Requirements</h2>
            <ul className="space-y-3 text-gray-600">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="recruitment-card">
            <h2 className="form-section-title">Key Responsibilities</h2>
            <ul className="space-y-3 text-gray-600">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="job-details-sidebar">
          <div className="recruitment-card">
            <h2 className="form-section-title">Job Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <AcademicCapIcon className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Experience</h3>
                  <p className="text-gray-600">{job.experience}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <UserGroupIcon className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Open Positions</h3>
                  <p className="text-gray-600">{job.numberOfPositions}</p>
                </div>
              </div>

              {job.salary && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Salary Range</h3>
                    <p className="text-gray-600">
                      {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="recruitment-card">
            <h2 className="form-section-title">Benefits & Perks</h2>
            <ul className="space-y-3">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-600">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails; 