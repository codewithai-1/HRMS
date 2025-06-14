import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  BriefcaseIcon,
  UserGroupIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { JobPosting, JobStatus } from '../../types/recruitment';
import api from '../../services/api';
import './recruitment.css';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const RecruitmentPage = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [selectedStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : undefined;
      const response = await api.recruitment.getAllJobs(params);
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load job postings. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: JobStatus) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
      [JobStatus.PUBLISHED]: "bg-green-100 text-green-800",
      [JobStatus.DRAFT]: "bg-gray-100 text-gray-800",
      [JobStatus.CLOSED]: "bg-red-100 text-red-800",
      [JobStatus.CANCELLED]: "bg-yellow-100 text-yellow-800"
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
            <p className="recruitment-subtitle">Loading job postings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recruitment-container">
        <div className="error-message">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="recruitment-container">
      {/* Header */}
      <div className="recruitment-header flex-col lg:flex-row gap-4">
        <div className="recruitment-title">
          <h1>Recruitment Dashboard</h1>
          <p className="recruitment-subtitle">
            Manage your job postings and track applications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[280px] pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-[200px] px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {Object.values(JobStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <button
            className="flex items-center gap-2 bg-[#1d4ed8] hover:bg-blue-800 text-white text-sm font-medium px-5 py-2 rounded-lg shadow-sm transition-colors w-full sm:w-auto justify-center sm:justify-start"
            onClick={() => navigate('/recruitment/jobs/new')}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="recruitment-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <BriefcaseIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {jobs.filter(job => job.status === JobStatus.PUBLISHED).length}
              </p>
              <h3 className="text-sm font-medium text-gray-500 mt-1">Active Jobs</h3>
            </div>
          </div>
        </div>

        <div className="recruitment-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}
              </p>
              <h3 className="text-sm font-medium text-gray-500 mt-1">Total Applicants</h3>
            </div>
          </div>
        </div>

        <div className="recruitment-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + (job.status === JobStatus.PUBLISHED ? job.numberOfPositions : 0), 0)}
              </p>
              <h3 className="text-sm font-medium text-gray-500 mt-1">Open Positions</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="recruitment-card text-center py-8 sm:py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new job posting.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/recruitment/jobs/new')}
                >
                  <PlusIcon className="h-5 w-5" />
                  Post New Job
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="recruitment-card cursor-pointer hover:translate-x-2"
              onClick={() => navigate(`/recruitment/jobs/${job.id}`)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`status-badge ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="h-4 w-4" />
                      {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="w-full sm:w-auto">
                  <button 
                    className="btn btn-secondary w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recruitment/jobs/${job.id}/applications`);
                    }}
                  >
                    View Applications
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecruitmentPage;