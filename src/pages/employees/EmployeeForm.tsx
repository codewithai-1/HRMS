import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Employee } from '../../types/employee';
import { JobPosting } from '../../types/recruitment';
import api from '../../services/api';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import './EmployeeForm.css';

type TabType = 'personal' | 'employment' | 'documents' | 'banking';

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    departmentId: 1,
    jobId: undefined as number | undefined,
    position: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE',
    joinDate: '',
    shiftId: undefined as string | undefined,
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchName: ''
    },
    documents: [] as Array<{
      type: string;
      number: string;
      expiryDate?: string;
    }>
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableJobs, setAvailableJobs] = useState<JobPosting[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: number; name: string }>>([]);
  const [availableShifts, setAvailableShifts] = useState<Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    timezone: string;
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsResponse, departmentsResponse, shiftsResponse] = await Promise.all([
          api.recruitment.getAllJobs({ status: 'OPEN' }),
          api.departments.getAll(),
          api.shifts.getAll()
        ]);

        setAvailableJobs(jobsResponse.data);
        setDepartments(departmentsResponse.data);
        setAvailableShifts(shiftsResponse.data);

        if (id) {
          const employeeResponse = await api.employees.getById(id);
          const employee = employeeResponse.data;
          setFormData({
            ...employee,
            joinDate: employee.joinDate.split('T')[0]
          });
        }
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobChange = (selectedJobId: string) => {
    const selectedJob = availableJobs.find(job => job.id === selectedJobId);
    if (selectedJob) {
      const dept = departments.find(d => d.name === selectedJob.department);
      setFormData(prev => ({
        ...prev,
        jobId: Number(selectedJobId),
        position: selectedJob.title,
        departmentId: dept?.id || prev.departmentId
      }));
    }
  };

  const handleEmergencyContactChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [name]: value
      }
    }));
  };

  const handleBankDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { type: '', number: '' }]
    }));
  };

  const updateDocument = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) => 
        i === index ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Personal Information
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    // Employment Details
    if (!formData.position.trim()) newErrors.position = 'Position is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!formData.shiftId) newErrors.shiftId = 'Shift assignment is required';

    // Emergency Contact
    if (!formData.emergencyContact.name.trim()) {
      newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    }
    if (!formData.emergencyContact.phoneNumber.trim()) {
      newErrors['emergencyContact.phoneNumber'] = 'Emergency contact phone is required';
    }
    if (!formData.emergencyContact.relationship.trim()) {
      newErrors['emergencyContact.relationship'] = 'Relationship is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const employeeData = {
        ...formData,
        joinDate: new Date(formData.joinDate).toISOString()
      };

      let savedEmployee;
      if (id) {
        savedEmployee = await api.employees.update(id, employeeData);
      } else {
        savedEmployee = await api.employees.create(employeeData);
      }

      // Create or update employee shift assignment
      if (formData.shiftId) {
        const selectedShift = availableShifts.find(shift => shift.id === formData.shiftId);
        const shiftAssignment = {
          employeeId: savedEmployee.data.id,
          employeeName: `${formData.firstName} ${formData.lastName}`,
          shiftId: formData.shiftId,
          shiftName: selectedShift?.name || '',
          startDate: formData.joinDate,
          status: 'ACTIVE' as const
        };

        if (id) {
          await api.shifts.updateEmployeeShift(id, shiftAssignment);
        } else {
          await api.shifts.assignShift(shiftAssignment);
        }
      }

      navigate('/employees');
    } catch (err) {
      setError('Failed to save employee. Please try again.');
      console.error('Error saving employee:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'documents', label: 'Documents' },
    { id: 'banking', label: 'Banking Information' }
  ];

  const renderEmploymentDetails = () => {
    return (
      <div className="form-section">
        <h3>Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={errors.position ? 'error' : ''}
            />
            {errors.position && <span className="error-message">{errors.position}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="joinDate">Join Date</label>
            <input
              type="date"
              id="joinDate"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleInputChange}
              className={errors.joinDate ? 'error' : ''}
            />
            {errors.joinDate && <span className="error-message">{errors.joinDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="shiftId">Assigned Shift</label>
            <select
              id="shiftId"
              name="shiftId"
              value={formData.shiftId || ''}
              onChange={handleInputChange}
              className={errors.shiftId ? 'error' : ''}
            >
              <option value="">Select Shift</option>
              {availableShifts.map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime}-{shift.endTime} {shift.timezone})
                </option>
              ))}
            </select>
            {errors.shiftId && <span className="error-message">{errors.shiftId}</span>}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="employee-form-container">
      <div className="header">
        <button
          onClick={() => navigate('/employees')}
          className="back-button"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Employees</span>
        </button>
        <h1>{id ? 'Edit Employee' : 'Add New Employee'}</h1>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className="tab-container">
        <div className="tab-progress">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`progress-step ${
                index <= tabs.findIndex(tab => tab.id === activeTab) ? 'completed' : ''
              }`}
            />
          ))}
        </div>

        <div className="tab-list">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <p>{getTabDescription(tab.id)}</p>
            </button>
          ))}
        </div>

        <div className="tab-content">
          <form onSubmit={handleSubmit}>
            {/* Personal Information Tab */}
            <div className={`tab-panel ${activeTab === 'personal' ? 'active' : ''}`}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                  />
                  {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                  />
                  {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                  />
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group col-span-2">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.address ? 'error' : ''}`}
                    rows={3}
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-section col-span-2">
                  <h3>Emergency Contact</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="emergencyName" className="form-label">Name</label>
                      <input
                        type="text"
                        id="emergencyName"
                        name="name"
                        value={formData.emergencyContact.name}
                        onChange={handleEmergencyContactChange}
                        className={`form-input ${errors['emergencyContact.name'] ? 'error' : ''}`}
                      />
                      {errors['emergencyContact.name'] && (
                        <span className="error-text">{errors['emergencyContact.name']}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergencyRelationship" className="form-label">Relationship</label>
                      <input
                        type="text"
                        id="emergencyRelationship"
                        name="relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={handleEmergencyContactChange}
                        className={`form-input ${errors['emergencyContact.relationship'] ? 'error' : ''}`}
                      />
                      {errors['emergencyContact.relationship'] && (
                        <span className="error-text">{errors['emergencyContact.relationship']}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="emergencyPhone" className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        id="emergencyPhone"
                        name="phoneNumber"
                        value={formData.emergencyContact.phoneNumber}
                        onChange={handleEmergencyContactChange}
                        className={`form-input ${errors['emergencyContact.phoneNumber'] ? 'error' : ''}`}
                      />
                      {errors['emergencyContact.phoneNumber'] && (
                        <span className="error-text">{errors['emergencyContact.phoneNumber']}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details Tab */}
            <div className={`tab-panel ${activeTab === 'employment' ? 'active' : ''}`}>
              {renderEmploymentDetails()}
            </div>

            {/* Documents Tab */}
            <div className={`tab-panel ${activeTab === 'documents' ? 'active' : ''}`}>
              <div className="documents-header">
                <h3>Employee Documents</h3>
                <button
                  type="button"
                  onClick={addDocument}
                  className="btn btn-secondary btn-sm"
                >
                  Add Document
                </button>
              </div>

              <div className="documents-list">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <div className="form-group">
                      <label className="form-label">Document Type</label>
                      <input
                        type="text"
                        value={doc.type}
                        onChange={(e) => updateDocument(index, 'type', e.target.value)}
                        className="form-input"
                        placeholder="e.g., Passport, ID Card"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Document Number</label>
                      <input
                        type="text"
                        value={doc.number}
                        onChange={(e) => updateDocument(index, 'number', e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={doc.expiryDate?.split('T')[0] || ''}
                          onChange={(e) => updateDocument(index, 'expiryDate', e.target.value)}
                          className="form-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="btn btn-danger btn-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banking Information Tab */}
            <div className={`tab-panel ${activeTab === 'banking' ? 'active' : ''}`}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="accountName" className="form-label">Account Name</label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={formData.bankDetails.accountName}
                    onChange={handleBankDetailsChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="accountNumber" className="form-label">Account Number</label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleBankDetailsChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bankName" className="form-label">Bank Name</label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleBankDetailsChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="branchName" className="form-label">Branch Name</label>
                  <input
                    type="text"
                    id="branchName"
                    name="branchName"
                    value={formData.bankDetails.branchName}
                    onChange={handleBankDetailsChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="tab-navigation">
              <button
                type="button"
                className="tab-nav-button"
                onClick={handlePreviousTab}
                disabled={activeTab === tabs[0].id}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Previous
              </button>
              
              {activeTab === tabs[tabs.length - 1].id ? (
                <button
                  type="submit"
                  className="tab-nav-button next"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Employee'}
                </button>
              ) : (
                <button
                  type="button"
                  className="tab-nav-button next"
                  onClick={handleNextTab}
                >
                  Next
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper function to get tab descriptions
const getTabDescription = (tabId: TabType): string => {
  switch (tabId) {
    case 'personal':
      return 'Basic information and contact details';
    case 'employment':
      return 'Job role and department details';
    case 'documents':
      return 'Identity and employment documents';
    case 'banking':
      return 'Salary and payment information';
    default:
      return '';
  }
};

export default EmployeeForm; 