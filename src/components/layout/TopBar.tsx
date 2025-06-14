import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon, 
  Bars3Icon 
} from '@heroicons/react/24/outline';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Handle click outside of dropdowns
  const handleGlobalClick = (e: React.MouseEvent) => {
    if (notificationsOpen) setNotificationsOpen(false);
    if (profileOpen) setProfileOpen(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
      {/* Mobile hamburger menu */}
      <button 
        className="md:hidden mr-4 text-gray-500"
        onClick={toggleSidebar}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Search bar - centered */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-xl relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-100 border-0 rounded-full py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative">
          <button
            className="text-gray-500 hover:text-blue-500 relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              1
            </span>
          </button>
        </div>

        {/* User profile */}
        <div className="relative">
          <button
            className="text-gray-500 hover:text-blue-500"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <UserCircleIcon className="h-8 w-8 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 