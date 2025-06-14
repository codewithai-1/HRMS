import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { UserRole } from '../../types/enums';
import { Role } from '../../types/role';
import { getAllRoutes } from '../../config/routes';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Omit<Role, 'id' | 'createdAt'>) => void;
  role?: Role | null;
  existingRoles: Role[];
}

interface PagePermission {
  id: string;
  name: string;
  description: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
}

const RoleModal = ({ isOpen, onClose, onSave, role, existingRoles }: RoleModalProps) => {
  const [formData, setFormData] = useState({
    name: UserRole.EMPLOYEE,
    description: '',
    permissions: [] as string[]
  });

  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([]);

  const pages = getAllRoutes();

  // Initialize page permissions based on role or empty state
  const initializePagePermissions = (rolePermissions: string[] = []) => {
    return pages.map(page => ({
      ...page,
      permissions: {
        view: rolePermissions.includes(`${page.id}_view`),
        create: rolePermissions.includes(`${page.id}_create`),
        edit: rolePermissions.includes(`${page.id}_edit`),
        delete: rolePermissions.includes(`${page.id}_delete`)
      }
    }));
  };

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
      setPagePermissions(initializePagePermissions(role.permissions));
    } else {
      setFormData({
        name: UserRole.EMPLOYEE,
        description: '',
        permissions: []
      });
      setPagePermissions(initializePagePermissions());
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert page permissions to flat permission array
    const permissions = pagePermissions.flatMap(page => {
      const perms = [];
      if (page.permissions.view) perms.push(`${page.id}_view`);
      if (page.permissions.create) perms.push(`${page.id}_create`);
      if (page.permissions.edit) perms.push(`${page.id}_edit`);
      if (page.permissions.delete) perms.push(`${page.id}_delete`);
      return perms;
    });

    onSave({
      name: formData.name,
      description: formData.description,
      permissions
    });
    onClose();
  };

  const togglePermission = (pageId: string, permissionType: keyof PagePermission['permissions']) => {
    setPagePermissions(prevPermissions =>
      prevPermissions.map(page =>
        page.id === pageId
          ? {
              ...page,
              permissions: {
                ...page.permissions,
                [permissionType]: !page.permissions[permissionType],
                // If a higher permission is granted, automatically grant view permission
                view: permissionType === 'view' 
                  ? !page.permissions.view 
                  : true
              }
            }
          : page
      )
    );
  };

  const handleCopyPermissions = (roleId: string) => {
    const selectedRole = existingRoles.find(r => r.id === roleId);
    if (selectedRole) {
      setPagePermissions(initializePagePermissions(selectedRole.permissions));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {role ? 'Edit Role' : 'Create New Role'}
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name
                </label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={1}
                  required
                />
              </div>
            </div>

            {/* Copy Permissions Dropdown - Only show when creating new role */}
            {!role && existingRoles.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Copy Permissions From</h3>
                    <p className="text-sm text-blue-600">Quickly set up permissions by copying from an existing role</p>
                  </div>
                  <select
                    onChange={(e) => handleCopyPermissions(e.target.value)}
                    className="ml-4 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm"
                    defaultValue=""
                  >
                    <option value="">Select a role</option>
                    {existingRoles.map((existingRole) => (
                      <option key={existingRole.id} value={existingRole.id}>
                        {existingRole.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Page Permissions</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page/Feature
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        View
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Create
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Edit
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagePermissions.map((page) => (
                      <tr key={page.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{page.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{page.description}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={page.permissions.view}
                            onChange={() => togglePermission(page.id, 'view')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={page.permissions.create}
                            onChange={() => togglePermission(page.id, 'create')}
                            disabled={!page.permissions.view}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={page.permissions.edit}
                            onChange={() => togglePermission(page.id, 'edit')}
                            disabled={!page.permissions.view}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={page.permissions.delete}
                            onChange={() => togglePermission(page.id, 'delete')}
                            disabled={!page.permissions.view}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {role ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal; 