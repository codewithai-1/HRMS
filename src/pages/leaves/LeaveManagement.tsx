import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import './LeaveManagement.css';
import LeaveRequestList from './LeaveRequestList';
import LeaveCalendar from './LeaveCalendar';
import LeaveTypeManagement from './LeaveTypeManagement';
import LeaveStatistics from './LeaveStatistics';

type TabType = 'requests' | 'calendar' | 'types' | 'statistics';

const LeaveManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('requests');

  const tabs = [
    { id: 'requests', name: 'Leave Requests', icon: ClipboardDocumentListIcon },
    { id: 'calendar', name: 'Leave Calendar', icon: CalendarIcon },
    { id: 'types', name: 'Leave Types', icon: Cog6ToothIcon },
    { id: 'statistics', name: 'Statistics', icon: ChartBarIcon }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return <LeaveRequestList />;
      case 'calendar':
        return <LeaveCalendar />;
      case 'types':
        return <LeaveTypeManagement />;
      case 'statistics':
        return <LeaveStatistics />;
      default:
        return <LeaveRequestList />;
    }
  };

  return (
    <div className="leave-management-wrapper">
      <div className="leave-management-container">
        {/* Header Section */}
        <div className="leave-management-header">
          <div className="leave-management-title">
            <h1>Leave Management</h1>
            <p className="text-subtitle">Manage and track employee leaves</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="leave-management-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="leave-management-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement; 