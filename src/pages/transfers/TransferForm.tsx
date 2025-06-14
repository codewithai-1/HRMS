import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { EmployeeTransfer, TransferType } from '../../types/transfer';
import { Department } from '../../types/department';
import { Employee } from '../../types/employee';
import './TransferForm.css';

const TransferForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    transferType: 'DEPARTMENT' as TransferType,
    currentDepartmentId: '',
    currentDepartmentName: '',
    currentTeamId: '',
    currentTeamName: '',
    currentPosition: '',
    currentManager: '',
    newDepartmentId: '',
    newDepartmentName: '',
    newTeamId: '',
    newTeamName: '',
    newPosition: '',
    newManager: '',
    effectiveDate: '',
    reason: '',
    comments: ''
  });

  // Reference data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptResponse, empResponse] = await Promise.all([
          api.departments.getAll(),
          api.employees.getAll()
        ]);

        setDepartments(deptResponse.data);
        setEmployees(empResponse.data);

        if (id) {
          const transferResponse = await api.transfers.getById(id);
          const transfer = transferResponse.data;
          setFormData({
            employeeId: transfer.employeeId || '',
            employeeName: transfer.employeeName || '',
            transferType: transfer.transferType,
            currentDepartmentId: transfer.currentDepartmentId || '',
            currentDepartmentName: transfer.currentDepartmentName || '',
            currentTeamId: transfer.currentTeamId || '',
            currentTeamName: transfer.currentTeamName || '',
            currentPosition: transfer.currentPosition || '',
            currentManager: transfer.currentManager || '',
            newDepartmentId: transfer.newDepartmentId || '',
            newDepartmentName: transfer.newDepartmentName || '',
            newTeamId: transfer.newTeamId || '',
            newTeamName: transfer.newTeamName || '',
            newPosition: transfer.newPosition || '',
            newManager: transfer.newManager || '',
            effectiveDate: transfer.effectiveDate.split('T')[0],
            reason: transfer.reason || '',
            comments: transfer.comments || ''
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

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(emp => emp.id.toString() === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id.toString(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        currentDepartmentId: employee.departmentId.toString(),
        currentDepartmentName: departments.find(d => d.id === employee.departmentId)?.name || '',
        currentPosition: employee.position
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newDepartmentId') {
      const department = departments.find(d => d.id.toString() === value);
      if (department) {
        setFormData(prev => ({
          ...prev,
          newDepartmentName: department.name
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const transferData = {
        ...formData,
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        requestedBy: formData.employeeName,
        requestedDate: new Date().toISOString()
      };

      if (id) {
        await api.transfers.update(id, transferData);
      } else {
        await api.transfers.create(transferData);
      }

      navigate('/transfers');
    } catch (err) {
      setError('Failed to save transfer request. Please try again.');
      console.error('Error saving transfer:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="transfer-form-container">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="transfer-form-container">
      <div className="transfer-form-header">
        <div className="transfer-form-title">
          <button
            onClick={() => navigate('/transfers')}
            className="back-button"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Transfers</span>
          </button>
          <h1>{id ? 'Edit Transfer Request' : 'New Transfer Request'}</h1>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="form-content">
        <form onSubmit={handleSubmit}>
          {/* Employee Information Section */}
          <div className="form-section">
            <h3 className="form-section-title">Employee Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="employeeId" className="form-label">
                  Select Employee
                </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="form-select"
                  disabled={!!id}
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Current Department</label>
                <input
                  type="text"
                  value={formData.currentDepartmentName}
                  className="form-input"
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Position</label>
                <input
                  type="text"
                  value={formData.currentPosition}
                  className="form-input"
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Manager</label>
                <input
                  type="text"
                  name="currentManager"
                  value={formData.currentManager}
                  onChange={handleInputChange}
                  className="form-input"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Transfer Details Section */}
          <div className="form-section">
            <h3 className="form-section-title">Transfer Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="transferType" className="form-label">
                  Transfer Type
                </label>
                <select
                  id="transferType"
                  name="transferType"
                  value={formData.transferType}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="DEPARTMENT">Department Transfer</option>
                  <option value="TEAM">Team Transfer</option>
                  <option value="POSITION">Position Change</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="effectiveDate" className="form-label">
                  Effective Date
                </label>
                <input
                  type="date"
                  id="effectiveDate"
                  name="effectiveDate"
                  value={formData.effectiveDate}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newDepartmentId" className="form-label">
                  New Department
                </label>
                <select
                  id="newDepartmentId"
                  name="newDepartmentId"
                  value={formData.newDepartmentId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="newPosition" className="form-label">
                  New Position
                </label>
                <input
                  type="text"
                  id="newPosition"
                  name="newPosition"
                  value={formData.newPosition}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newManager" className="form-label">
                  New Manager
                </label>
                <select
                  id="newManager"
                  name="newManager"
                  value={formData.newManager}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select manager</option>
                  {employees
                    .filter(emp => emp.id.toString() !== formData.employeeId)
                    .map(emp => (
                      <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group col-span-2">
                <label htmlFor="reason" className="form-label">
                  Reason for Transfer
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group col-span-2">
                <label htmlFor="comments" className="form-label">
                  Additional Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="form-footer">
            <button
              type="button"
              onClick={() => navigate('/transfers')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : (id ? 'Update Transfer' : 'Submit Transfer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm; 