import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import recognitionService from '../../services/recognitionService';
import { Category, Nomination, NominationStatus, NominationType } from '../../types/recognition';
import { useAuth } from '../../hooks/useAuth';
import './NominationForm.css';

const NominationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('nomination');
  const [formData, setFormData] = useState({
    categoryId: '',
    nomineeId: '',
    reason: '',
    impact: '',
    examples: '',
    supportingDocuments: [] as File[]
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await recognitionService.getAllCategories();
      setCategories(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        supportingDocuments: Array.from(e.target.files || [])
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    if (!formData.nomineeId) {
      newErrors.nomineeId = 'Please select a nominee';
    }
    if (!formData.reason) {
      newErrors.reason = 'Please provide a reason for nomination';
    }
    if (!formData.impact) {
      newErrors.impact = 'Please describe the impact';
    }
    if (!formData.examples) {
      newErrors.examples = 'Please provide specific examples';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.id) {
      return;
    }

    try {
      setLoading(true);
      const nominationData = {
        categoryId: formData.categoryId,
        nomineeId: formData.nomineeId,
        nominatorId: user.id,
        type: NominationType.PEER,
        justification: formData.reason,
        supportingDocuments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await recognitionService.createNomination(nominationData);
      navigate('/dashboard/recognition/my-nominations');
    } catch (err) {
      console.error('Error submitting nomination:', err);
      setError('Failed to submit nomination. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="nomination-container">
      <div className="nomination-header">
        <div className="header-top-row">
          <button
            className="back-button"
            onClick={() => navigate('/dashboard/recognition')}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Recognition</span>
          </button>
          <h1 className="nomination-title">New Nomination</h1>
        </div>
      </div>

      <div className="nomination-content">
        <div className="tab-panel">
          <div className="tab-header">
            <button
              className={`tab-button ${activeTab === 'nomination' ? 'active' : ''}`}
              onClick={() => setActiveTab('nomination')}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Nomination Details</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'impact' ? 'active' : ''}`}
              onClick={() => setActiveTab('impact')}
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Impact & Examples</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Supporting Documents</span>
            </button>
          </div>

          <div className="tab-content">
            {error && (
              <div className="error-message">
                <XCircleIcon className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="nomination-form">
              {activeTab === 'nomination' && (
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="categoryId">Category</label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={errors.categoryId ? 'error' : ''}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <span className="error-text">{errors.categoryId}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="nomineeId">Nominee</label>
                    <div className="nominee-select">
                      <UserIcon className="w-5 h-5" />
                      <select
                        id="nomineeId"
                        name="nomineeId"
                        value={formData.nomineeId}
                        onChange={handleInputChange}
                        className={errors.nomineeId ? 'error' : ''}
                      >
                        <option value="">Select a nominee</option>
                        {/* Add nominee options here */}
                      </select>
                    </div>
                    {errors.nomineeId && (
                      <span className="error-text">{errors.nomineeId}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason for Nomination</label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={4}
                      className={errors.reason ? 'error' : ''}
                      placeholder="Explain why this person deserves recognition..."
                    />
                    {errors.reason && (
                      <span className="error-text">{errors.reason}</span>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'impact' && (
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="impact">Impact</label>
                    <textarea
                      id="impact"
                      name="impact"
                      value={formData.impact}
                      onChange={handleInputChange}
                      rows={4}
                      className={errors.impact ? 'error' : ''}
                      placeholder="Describe the impact of their contributions..."
                    />
                    {errors.impact && (
                      <span className="error-text">{errors.impact}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="examples">Specific Examples</label>
                    <textarea
                      id="examples"
                      name="examples"
                      value={formData.examples}
                      onChange={handleInputChange}
                      rows={4}
                      className={errors.examples ? 'error' : ''}
                      placeholder="Provide specific examples of their achievements..."
                    />
                    {errors.examples && (
                      <span className="error-text">{errors.examples}</span>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="form-section">
                  <div className="form-group">
                    <label htmlFor="supportingDocuments">Supporting Documents</label>
                    <div className="file-upload">
                      <input
                        type="file"
                        id="supportingDocuments"
                        multiple
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <div className="file-upload-info">
                        <p>Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                        <p>Maximum file size: 5MB per file</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                {activeTab !== 'nomination' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab(activeTab === 'impact' ? 'nomination' : 'impact')}
                  >
                    Previous
                  </button>
                )}
                {activeTab !== 'documents' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setActiveTab(activeTab === 'nomination' ? 'impact' : 'documents')}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Nomination'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominationForm; 