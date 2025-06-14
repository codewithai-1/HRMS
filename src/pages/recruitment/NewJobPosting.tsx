import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPosting, JobStatus } from '../../types/recruitment';
import api from '../../services/api';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import './recruitment.css';

type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: JobType;
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: {
    min: string;
    max: string;
    currency: string;
  };
  benefits: string[];
  numberOfPositions: number;
  closingDate: string;
}

const NewJobPosting = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    type: 'FULL_TIME',
    experience: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    salary: {
      min: '',
      max: '',
      currency: 'USD'
    },
    benefits: [''],
    numberOfPositions: 1,
    closingDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index: number, value: string, field: 'requirements' | 'responsibilities' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleAddArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (index: number, field: 'requirements' | 'responsibilities' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Format the data
      const jobData = {
        ...formData,
        status: JobStatus.DRAFT,
        salary: {
          ...formData.salary,
          min: parseInt(formData.salary.min),
          max: parseInt(formData.salary.max)
        },
        numberOfPositions: parseInt(formData.numberOfPositions.toString()),
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== '')
      };

      const response = await api.recruitment.createJob(jobData);
      navigate(`/recruitment/jobs/${response.data.id}`);
    } catch (err) {
      setError('Failed to create job posting. Please try again.');
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recruitment-container">
      <div className="recruitment-header">
        <div className="recruitment-title">
          <button
            onClick={() => navigate('/recruitment')}
            className="back-button"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Jobs</span>
          </button>
          <h1>Create New Job Posting</h1>
          <p className="recruitment-subtitle">Create and publish a new job opportunity</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department" className="form-label">
                Department *
              </label>
              <input
                type="text"
                name="department"
                id="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location *
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Employment Type *
              </label>
              <select
                name="type"
                id="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience" className="form-label">
                Experience Required *
              </label>
              <input
                type="text"
                name="experience"
                id="experience"
                required
                value={formData.experience}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 3+ years"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfPositions" className="form-label">
                Number of Positions *
              </label>
              <input
                type="number"
                name="numberOfPositions"
                id="numberOfPositions"
                required
                min="1"
                value={formData.numberOfPositions}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="closingDate" className="form-label">
                Closing Date *
              </label>
              <input
                type="date"
                name="closingDate"
                id="closingDate"
                required
                value={formData.closingDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="form-section">
          <h3 className="form-section-title">Job Description</h3>
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description *
            </label>
            <textarea
              name="description"
              id="description"
              required
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows={6}
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="form-section">
          <h3 className="form-section-title">Requirements</h3>
          {formData.requirements.map((req, index) => (
            <div key={index} className="form-group flex gap-2">
              <input
                type="text"
                value={req}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                className="form-input"
                placeholder="Add a requirement"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(index, 'requirements')}
                className="btn btn-secondary"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('requirements')}
            className="btn btn-secondary mt-2"
          >
            Add Requirement
          </button>
        </div>

        {/* Responsibilities */}
        <div className="form-section">
          <h3 className="form-section-title">Responsibilities</h3>
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="form-group flex gap-2">
              <input
                type="text"
                value={resp}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'responsibilities')}
                className="form-input"
                placeholder="Add a responsibility"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(index, 'responsibilities')}
                className="btn btn-secondary"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('responsibilities')}
            className="btn btn-secondary mt-2"
          >
            Add Responsibility
          </button>
        </div>

        {/* Salary and Benefits */}
        <div className="form-section">
          <h3 className="form-section-title">Salary and Benefits</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="salary.currency" className="form-label">
                Currency
              </label>
              <select
                name="currency"
                value={formData.salary.currency}
                onChange={handleSalaryChange}
                className="form-select"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="salary.min" className="form-label">
                Minimum Salary
              </label>
              <input
                type="number"
                name="min"
                value={formData.salary.min}
                onChange={handleSalaryChange}
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary.max" className="form-label">
                Maximum Salary
              </label>
              <input
                type="number"
                name="max"
                value={formData.salary.max}
                onChange={handleSalaryChange}
                className="form-input"
                min="0"
              />
            </div>
          </div>

          <h4 className="text-sm font-medium text-gray-700 mt-6 mb-3">Benefits</h4>
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="form-group flex gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'benefits')}
                className="form-input"
                placeholder="Add a benefit"
              />
              <button
                type="button"
                onClick={() => handleRemoveArrayItem(index, 'benefits')}
                className="btn btn-secondary"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddArrayItem('benefits')}
            className="btn btn-secondary mt-2"
          >
            Add Benefit
          </button>
        </div>

        <div className="form-footer">
          <button
            type="button"
            onClick={() => navigate('/recruitment')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewJobPosting; 