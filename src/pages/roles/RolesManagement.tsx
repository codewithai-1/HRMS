import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  DocumentPlusIcon, 
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '../../types/enums';
import { Role } from '../../types/role';
import api from '../../services/api';
import RoleModal from './RoleModal';
import PermissionsDialog from './PermissionsDialog.tsx';
import './RolesManagement.css';

const RolesManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.roles.getAll();
        setRoles(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load roles. Please try again later.');
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      try {
        await api.roles.delete(roleToDelete.id);
        setRoles(roles.filter(role => role.id !== roleToDelete.id));
        setIsDeleteModalOpen(false);
        setRoleToDelete(null);
      } catch (err) {
        console.error('Error deleting role:', err);
        setError('Failed to delete role. Please try again later.');
      }
    }
  };

  const handleSaveRole = async (roleData: Omit<Role, 'id' | 'createdAt'>) => {
    try {
      if (selectedRole) {
        const response = await api.roles.update(selectedRole.id, roleData);
        setRoles(roles.map(role => 
          role.id === selectedRole.id 
            ? response.data
            : role
        ));
      } else {
        const response = await api.roles.create(roleData);
        setRoles([...roles, response.data]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Failed to save role. Please try again later.');
    }
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const formatPermission = (permission: string) => {
    const [page, action] = permission.split('_');
    if (!action) return permission;
    
    const icons = {
      view: <EyeIcon className="w-3 h-3 text-blue-500" />,
      create: <DocumentPlusIcon className="w-3 h-3 text-green-500" />,
      edit: <PencilSquareIcon className="w-3 h-3 text-yellow-500" />,
      delete: <TrashIcon className="w-3 h-3 text-red-500" />
    };

    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-md">
        {icons[action as keyof typeof icons]}
        <span className="text-xs capitalize">
          {page} - {action}
        </span>
      </div>
    );
  };

  const filteredRoles = roles
    .filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewPermissions = (role: Role) => {
    setSelectedRoleForPermissions(role);
    setIsPermissionsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="roles-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="roles-container">
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-container">
      {/* Header Section */}
      <div className="roles-header">
        <div className="roles-title">
          <h1>Role Management</h1>
          <p className="text-subtitle">Manage user roles and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10"
            />
          </div>
          <button
            className="create-role-button"
            onClick={handleCreateRole}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Role</span>
          </button>
        </div>
      </div>

      {/* Roles Content */}
      <div className="roles-content">
        <div className="roles-list">
          <div className="roles-grid">
            <div className="roles-grid-header">
              <div 
                className="col-role cursor-pointer hover:bg-gray-50"
                onClick={handleSort}
              >
                <span>Role</span>
                {getSortIcon()}
              </div>
              <div className="col-description">Description</div>
              <div className="col-actions">Actions</div>
            </div>

            <div className="roles-grid-body">
              {filteredRoles.map((role) => (
                <div key={role.id} className="roles-grid-row">
                  <div className="col-role">
                    <span className="role-name">{role.name}</span>
                  </div>
                  <div className="col-description">
                    <span className="role-description">{role.description}</span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-button view"
                      onClick={() => handleViewPermissions(role)}
                      title="View permissions"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="action-button edit"
                      onClick={() => handleEditRole(role)}
                      title="Edit role"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(role)}
                      title="Delete role"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredRoles.length === 0 && (
                <div className="empty-message">
                  No roles found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        role={selectedRole}
        existingRoles={roles}
      />

      {/* Permissions Dialog */}
      <PermissionsDialog
        isOpen={isPermissionsDialogOpen}
        onClose={() => {
          setIsPermissionsDialogOpen(false);
          setSelectedRoleForPermissions(null);
        }}
        role={selectedRoleForPermissions}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Role
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
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

export default RolesManagement; 