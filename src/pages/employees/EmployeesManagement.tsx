import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import './EmployeesManagement.css';
import { Employee } from '../../types/employee';

const EmployeesManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'lastName'>('lastName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.employees.getAll();
        setEmployees(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load employees. Please try again later.');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleCreateEmployee = () => {
    navigate('/employees/new');
  };

  const handleEditEmployee = (employee: Employee) => {
    navigate(`/employees/${employee.id}/edit`);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await api.employees.delete(employeeToDelete.id.toString());
        setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
        setIsDeleteModalOpen(false);
        setEmployeeToDelete(null);
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Failed to delete employee. Please try again later.');
      }
    }
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredEmployees = employees
    .filter(employee => 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortDirection === 'asc' 
        ? a.lastName.localeCompare(b.lastName)
        : b.lastName.localeCompare(a.lastName);
    });

  const getSortIcon = () => {
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="employees-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employees-container">
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-container">
      {/* Header Section */}
      <div className="employees-header">
        <div className="employees-title">
          <h1>Employee Management</h1>
          <p className="text-subtitle">Manage organization employees</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10"
            />
          </div>
          <button
            className="create-employee-button"
            onClick={handleCreateEmployee}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Content */}
      <div className="employees-list">
        <div className="employees-grid">
          <div className="employees-grid-header">
            <div 
              className="sortable-header"
              onClick={handleSort}
            >
              <span>Name</span>
              {getSortIcon()}
            </div>
            <div className="col-position">Position</div>
            <div className="col-email">Email</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="employees-grid-body">
            {filteredEmployees.length === 0 ? (
              <div className="empty-message">
                No employees found. Add your first employee to get started.
              </div>
            ) :
              filteredEmployees.map((employee) => (
                <div key={employee.id} className="employees-grid-row">
                  <div className="sortable-column">
                    <span className="employee-name">
                      {employee.firstName} {employee.lastName}
                    </span>
                    <span className="employee-id">{employee.employeeId}</span>
                  </div>
                  <div className="col-position">
                    <span className="employee-position">{employee.position}</span>
                  </div>
                  <div className="col-email">
                    <span className="employee-email">{employee.email}</span>
                  </div>
                  <div className="col-status">
                    <span className={`status-badge ${employee.status.toLowerCase()}`}>
                      {employee.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-button edit"
                      onClick={() => handleEditEmployee(employee)}
                      title="Edit employee"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(employee)}
                      title="Delete employee"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && employeeToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Employee</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete {employeeToDelete.firstName} {employeeToDelete.lastName}?</p>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManagement; 