import { ReactNode, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { 
  HomeIcon,
  UserGroupIcon,
  BriefcaseIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CalendarIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  GlobeAltIcon,
  ClipboardDocumentCheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import './Sidebar.css';
import { getAuthorizedRoutes, RouteConfig } from '../../config/routes';
import useAuth from '../../hooks/useAuth.tsx';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  closeSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: ReactNode;
  title: string;
}

interface MenuGroup {
  label: string;
  items: string[];
}

interface GroupedRoutes {
  key: string;
  label: string;
  items: RouteConfig[];
}

// Group definitions for menu items
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
    items: ['recruitment', 'attendance', 'leave', 'holidays', 'goals']
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

const NavItem = ({ to, icon, title }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
  >
    {icon}
    <span className="title">{title}</span>
  </NavLink>
);

const Sidebar = ({ isOpen, isMobile, closeSidebar }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const authorizedRoutes = user ? getAuthorizedRoutes(user.role) : [];
  
  // Group the routes
  const groupedRoutes: GroupedRoutes[] = Object.entries(menuGroups)
    .map(([groupKey, group]) => {
      const groupItems = authorizedRoutes.filter(route => 
        group.items.includes(route.id)
      );
      
      return groupItems.length > 0 ? { 
        key: groupKey,
        label: group.label, 
        items: groupItems 
      } : null;
    })
    .filter((group): group is GroupedRoutes => group !== null);

  // Initialize collapsed state based on current route
  const initialCollapsedState = groupedRoutes.reduce((acc, group) => {
    // Check if this group contains the current route
    const isActiveGroup = group.items.some(route => location.pathname === route.path);
    // Collapse all groups except the active one
    acc[group.key] = !isActiveGroup;
    return acc;
  }, {} as Record<string, boolean>);
  
  // State for collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(initialCollapsedState);

  // Toggle group collapse
  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Check if a group contains the active route
  const isGroupActive = (groupItems: RouteConfig[]) => {
    return groupItems.some(route => location.pathname === route.path);
  };

  // Map route IDs to icons with consistent sizing
  const routeIcons: Record<string, ReactNode> = {
    dashboard: <HomeIcon className="icon" />,
    roles: <UserGroupIcon className="icon" />,
    recruitment: <BriefcaseIcon className="icon" />,
    employees: <UsersIcon className="icon" />,
    departments: <BuildingOfficeIcon className="icon" />,
    attendance: <ClockIcon className="icon" />,
    leave: <CalendarIcon className="icon" />,
    holidays: <GlobeAltIcon className="icon" />,
    payroll: <BanknotesIcon className="icon" />,
    reports: <ChartBarIcon className="icon" />,
    settings: <Cog6ToothIcon className="icon" />,
    transfers: <ArrowsRightLeftIcon className="icon" />,
    shifts: <ClipboardDocumentCheckIcon className="icon" />,
    goals: <StarIcon className="icon" />
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile ? (isOpen ? 'mobile-visible' : 'mobile-hidden') : ''}`}>
        {/* Mobile close button */}
        {isMobile && (
          <button 
            onClick={closeSidebar}
            className="close-button"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        {/* Navigation */}
        <nav className="nav-menu">
          {groupedRoutes.map((group) => {
            const isActive = isGroupActive(group.items);
            const isCollapsed = collapsedGroups[group.key];
            
            return (
              <div key={group.key} 
                className={`nav-group ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
              >
                <button 
                  className="nav-group-title"
                  onClick={() => toggleGroup(group.key)}
                >
                  <span>{group.label}</span>
                  <ChevronDownIcon className="group-icon" />
                </button>
                <div className="nav-group-content">
                  <ul>
                    {group.items.map((route: RouteConfig) => (
                      <li key={route.id}>
                        <NavItem 
                          to={route.path}
                          icon={routeIcons[route.id] || <div className="icon" />}
                          title={route.name}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar; 