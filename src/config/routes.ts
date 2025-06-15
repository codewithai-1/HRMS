import { UserRole } from '../types/enums';

export interface RouteConfig {
  id: string;
  path: string;
  name: string;
  description: string;
  icon?: string;
  permissions?: {
    view?: UserRole[];
    create?: UserRole[];
    edit?: UserRole[];
    delete?: UserRole[];
  };
}

interface MenuGroup {
  label: string;
  items: string[];
}

const routes: Record<string, RouteConfig> = {
  dashboard: {
    id: 'dashboard',
    path: '/dashboard',
    name: 'Dashboard',
    description: 'Analytics and overview',
    icon: 'HomeIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      create: [UserRole.ADMIN],
      edit: [UserRole.ADMIN],
      delete: [UserRole.ADMIN]
    }
  },
  recruitment: {
    id: 'recruitment',
    path: '/recruitment',
    name: 'Recruitment',
    description: 'Manage job postings and applications',
    icon: 'BriefcaseIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.HR],
      create: [UserRole.ADMIN, UserRole.HR],
      edit: [UserRole.ADMIN, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  },
  roles: {
    id: 'roles',
    path: '/roles',
    name: 'Role Management',
    description: 'Manage user roles and permissions',
    icon: 'UserGroupIcon',
    permissions: {
      view: [UserRole.ADMIN],
      create: [UserRole.ADMIN],
      edit: [UserRole.ADMIN],
      delete: [UserRole.ADMIN]
    }
  },
  employees: {
    id: 'employees',
    path: '/employees',
    name: 'Employee Management',
    description: 'Manage employee information and details',
    icon: 'UsersIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      create: [UserRole.ADMIN, UserRole.HR],
      edit: [UserRole.ADMIN, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  },
  departments: {
    id: 'departments',
    path: '/departments',
    name: 'Department Management',
    description: 'Manage company departments and structure',
    icon: 'BuildingOfficeIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      create: [UserRole.ADMIN],
      edit: [UserRole.ADMIN],
      delete: [UserRole.ADMIN]
    }
  },
  attendance: {
    id: 'attendance',
    path: '/attendance',
    name: 'Attendance',
    description: 'Track and manage employee attendance',
    icon: 'ClockIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      create: [UserRole.ADMIN, UserRole.MANAGER],
      edit: [UserRole.ADMIN, UserRole.MANAGER],
      delete: [UserRole.ADMIN]
    }
  },
  leave: {
    id: 'leave',
    path: '/leave',
    name: 'Leave Management',
    description: 'Handle employee leave requests',
    icon: 'CalendarIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      create: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      edit: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  },
  holidays: {
    id: 'holidays',
    path: '/holidays',
    name: 'Holiday Management',
    description: 'Manage organization-wide holidays',
    icon: 'CalendarIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      create: [UserRole.ADMIN, UserRole.HR],
      edit: [UserRole.ADMIN, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  },
  payroll: {
    id: 'payroll',
    path: '/payroll',
    name: 'Payroll',
    description: 'Process and manage employee payroll',
    icon: 'BanknotesIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.HR],
      create: [UserRole.ADMIN, UserRole.HR],
      edit: [UserRole.ADMIN],
      delete: [UserRole.ADMIN]
    }
  },
  reports: {
    id: 'reports',
    path: '/reports',
    name: 'Reports',
    description: 'Generate and view system reports',
    icon: 'ChartBarIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      create: [UserRole.ADMIN, UserRole.MANAGER],
      edit: [UserRole.ADMIN],
      delete: [UserRole.ADMIN]
    }
  },
  settings: {
    id: 'settings',
    path: '/settings',
    name: 'Settings',
    description: 'System configuration and settings',
    icon: 'Cog6ToothIcon',
    permissions: {
      view: [UserRole.ADMIN],
      edit: [UserRole.ADMIN]
    }
  },
  transfers: {
    id: 'transfers',
    path: '/transfers',
    name: 'Transfer Management',
    description: 'Manage employee transfers and department changes',
    icon: 'ArrowsRightLeftIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      create: [UserRole.ADMIN, UserRole.HR],
      edit: [UserRole.ADMIN, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  },
  shifts: {
    id: 'shifts',
    path: '/shifts',
    name: 'Shift Management',
    description: 'Manage employee shifts and schedules',
    icon: 'ClockIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      create: [UserRole.ADMIN, UserRole.HR],
      edit: [UserRole.ADMIN, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  },
  goals: {
    id: 'goals',
    path: '/goals',
    name: 'Performance Goals',
    description: 'Set and track performance goals',
    icon: 'StarIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      create: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
      edit: [UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE],
      delete: [UserRole.ADMIN, UserRole.MANAGER]
    }
  },
  recognition: {
    id: 'recognition',
    path: '/recognition',
    name: 'Employee Recognition',
    description: 'Nominate and recognize outstanding employees',
    icon: 'TrophyIcon',
    permissions: {
      view: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      create: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE],
      edit: [UserRole.ADMIN, UserRole.MANAGER, UserRole.HR],
      delete: [UserRole.ADMIN]
    }
  }
};

// Helper functions to get route information
export const getRouteConfig = (id: string): RouteConfig | undefined => routes[id];
export const getAllRoutes = (): RouteConfig[] => Object.values(routes);
export const getAuthorizedRoutes = (userRole: UserRole): RouteConfig[] => {
  console.log('Getting authorized routes for role:', userRole);
  const authorizedRoutes = Object.values(routes).filter(route => {
    const hasPermission = route.permissions?.view?.includes(userRole);
    console.log(`Route ${route.id}: ${hasPermission ? 'authorized' : 'not authorized'}`);
    return hasPermission;
  });
  console.log('Authorized routes:', authorizedRoutes);
  return authorizedRoutes;
};

const menuGroups: Record<string, MenuGroup> = {
  main: {
    label: 'Main',
    items: ['dashboard']
  },
  management: {
    label: 'Management',
    items: ['employees', 'departments', 'roles', 'transfers', 'shifts']
  },
  operations: {
    label: 'Operations',
    items: ['recruitment', 'attendance', 'leave', 'holidays', 'goals', 'recognition']
  },
  finance: {
    label: 'Finance & Reports',
    items: ['payroll', 'reports']
  },
  system: {
    label: 'System',
    items: ['settings']
  }
};

export default routes; 