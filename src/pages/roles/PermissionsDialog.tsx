import React from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Role } from '../../data/mockData';

export interface PermissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

// Define available pages with their display names and descriptions
const availablePages = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Analytics and overview'
  },
  {
    id: 'employees',
    name: 'Employee Management',
    description: 'Manage employee information and details'
  },
  {
    id: 'departments',
    name: 'Department Management',
    description: 'Manage company departments and structure'
  },
  {
    id: 'roles',
    name: 'Role Management',
    description: 'Manage user roles and permissions'
  },
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Track and manage employee attendance'
  },
  {
    id: 'leave',
    name: 'Leave Management',
    description: 'Handle employee leave requests'
  },
  {
    id: 'payroll',
    name: 'Payroll',
    description: 'Process and manage employee payroll'
  },
  {
    id: 'performance',
    name: 'Performance Review',
    description: 'Employee performance evaluations'
  },
  {
    id: 'reports',
    name: 'Reports',
    description: 'Generate and view system reports'
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration and settings'
  }
];

const PermissionsDialog: React.FC<PermissionsDialogProps> = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null;

  // Define all possible permissions
  const permissionTypes = ['view', 'create', 'edit', 'delete'];

  // Group permissions by page
  const groupedPermissions = role.permissions.reduce((acc, permission) => {
    const [page] = permission.split('_');
    if (!acc[page]) {
      acc[page] = new Set();
    }
    acc[page].add(permission);
    return acc;
  }, {} as Record<string, Set<string>>);

  const hasPermission = (page: string, permission: string) => {
    return groupedPermissions[page]?.has(`${page}_${permission}`) || false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Permissions for {role.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {role.description}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 w-2/5">
                  Page/Feature
                </th>
                {permissionTypes.map((type) => (
                  <th 
                    key={type} 
                    className="px-4 py-3 text-sm font-semibold text-gray-900 text-center w-[15%]"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {availablePages.map((page) => (
                <tr 
                  key={page.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {page.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {page.description}
                      </span>
                    </div>
                  </td>
                  {permissionTypes.map((type) => (
                    <td key={type} className="py-4 px-4">
                      <div className="flex justify-center">
                        {hasPermission(page.id, type) ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-200" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing permissions for {availablePages.length} pages
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsDialog; 