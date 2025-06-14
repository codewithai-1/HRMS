import React, { useState, useEffect } from 'react';
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
import DepartmentModal from './DepartmentModal';
import './DepartmentsManagement.css';

interface Department {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const DepartmentsManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.departments.getAll();
        setDepartments(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load departments. Please try again later.');
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (departmentToDelete) {
      try {
        await api.departments.delete(departmentToDelete.id.toString());
        setDepartments(departments.filter(dept => dept.id !== departmentToDelete.id));
        setIsDeleteModalOpen(false);
        setDepartmentToDelete(null);
      } catch (err) {
        console.error('Error deleting department:', err);
        setError('Failed to delete department. Please try again later.');
      }
    }
  };

  const handleSaveDepartment = async (departmentData: Omit<Department, 'id' | 'createdAt'>) => {
    try {
      if (selectedDepartment) {
        const response = await api.departments.update(selectedDepartment.id.toString(), departmentData);
        setDepartments(departments.map(dept => 
          dept.id === selectedDepartment.id 
            ? response.data
            : dept
        ));
      } else {
        const response = await api.departments.create(departmentData);
        setDepartments([...departments, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving department:', err);
      setError('Failed to save department. Please try again later.');
    }
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredDepartments = departments
    .filter(department => 
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
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
      <div className="departments-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="departments-container">
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="departments-container">
      {/* Header Section */}
      <div className="departments-header">
        <div className="departments-title">
          <h1>Department Management</h1>
          <p className="text-subtitle">Manage organization departments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10"
            />
          </div>
          <button
            className="create-department-button"
            onClick={handleCreateDepartment}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        </div>
      </div>

      {/* Departments Content */}
      <div className="departments-content">
        <div className="departments-list">
          <div className="departments-grid">
            <div className="departments-grid-header">
              <div 
                className="col-department cursor-pointer hover:bg-gray-50"
                onClick={handleSort}
              >
                <span>Department</span>
                {getSortIcon()}
              </div>
              <div className="col-description">Description</div>
              <div className="col-actions">Actions</div>
            </div>

            <div className="departments-grid-body">
              {filteredDepartments.length === 0 ? (
                <div className="empty-message">
                  No departments found. Create your first department to get started.
                </div>
              ) : (
                filteredDepartments.map((department) => (
                  <div key={department.id} className="departments-grid-row">
                    <div className="col-department">
                      <span className="department-name">{department.name}</span>
                    </div>
                    <div className="col-description">
                      <span className="department-description">{department.description}</span>
                    </div>
                    <div className="col-actions">
                      <button
                        className="action-button edit"
                        onClick={() => handleEditDepartment(department)}
                        title="Edit department"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteClick(department)}
                        title="Delete department"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && departmentToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Department</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the department "{departmentToDelete.name}"?</p>
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

      {/* Department Modal */}
      {isModalOpen && (
        <DepartmentModal
          department={selectedDepartment}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDepartment}
        />
      )}
    </div>
  );
};

export default DepartmentsManagement; 