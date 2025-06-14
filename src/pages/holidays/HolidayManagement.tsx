import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  ArrowPathIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import holidayService from '../../services/holidayService';
import { HolidayList, HolidayStatus } from '../../types/holiday';
import HolidayListModal from './HolidayListModal';
import HolidayModal from './HolidayModal';
import './HolidayManagement.css';
import { format } from 'date-fns';

interface HolidayListWithCount extends HolidayList {
  holidayCount: number;
}

// Filter Dialog Component
interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filterYear: number;
  setFilterYear: (year: number) => void;
  filterStatus: HolidayStatus | 'ALL';
  setFilterStatus: (status: HolidayStatus | 'ALL') => void;
  onApplyFilters: () => void;
}

const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  filterYear,
  setFilterYear,
  filterStatus,
  setFilterStatus,
  onApplyFilters
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content filter-dialog">
        <div className="modal-header">
          <div className="flex justify-between items-center">
            <h2>Filter Holidays</h2>
            <button
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="filterYear"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Year
              </label>
              <select
                id="filterYear"
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - 2 + i}>
                    {new Date().getFullYear() - 2 + i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filterStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as HolidayStatus | 'ALL')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value={HolidayStatus.DRAFT}>Draft</option>
                <option value={HolidayStatus.PUBLISHED}>Published</option>
                <option value={HolidayStatus.ARCHIVED}>Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              onApplyFilters();
              onClose();
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const HolidayManagement: React.FC = () => {
  const [holidayLists, setHolidayLists] = useState<HolidayListWithCount[]>([]);
  const [selectedList, setSelectedList] = useState<HolidayList | null>(null);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'year'>('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<HolidayList | null>(null);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<HolidayStatus | 'ALL'>('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  useEffect(() => {
    fetchHolidayLists();
  }, [filterYear, filterStatus, refreshTrigger]);

  const fetchHolidayLists = async () => {
    try {
      setLoading(true);
      let params: { year?: number; status?: HolidayStatus } = {};
      
      if (filterYear) {
        params.year = filterYear;
      }
      
      if (filterStatus !== 'ALL') {
        params.status = filterStatus;
      }
      
      const response = await holidayService.holidayLists.getAll(params);
      
      // Convert to extended type with count
      const listsWithCount: HolidayListWithCount[] = response.data.lists.map(list => ({
        ...list,
        holidayCount: list.holidays.length
      }));
      
      setHolidayLists(listsWithCount);
      setError(null);
    } catch (err) {
      setError('Failed to load holiday lists. Please try again later.');
      console.error('Error fetching holiday lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchHolidayLists();
  };

  const handleCreateList = () => {
    setSelectedList(null);
    setIsListModalOpen(true);
  };

  const handleEditList = (list: HolidayList) => {
    setSelectedList(list);
    setIsListModalOpen(true);
  };

  const handleAddHoliday = (list: HolidayList) => {
    setSelectedList(list);
    setIsHolidayModalOpen(true);
  };

  const handleDeleteClick = (list: HolidayList) => {
    setListToDelete(list);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (listToDelete) {
      try {
        await holidayService.holidayLists.delete(listToDelete.id);
        setHolidayLists(holidayLists.filter(list => list.id !== listToDelete.id));
        setIsDeleteModalOpen(false);
        setListToDelete(null);
      } catch (err) {
        console.error('Error deleting holiday list:', err);
        setError('Failed to delete holiday list. Please try again later.');
      }
    }
  };

  const handlePublishList = async (list: HolidayList) => {
    try {
      await holidayService.holidayLists.publish(list.id);
      // Refresh the list to show updated status
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error publishing holiday list:', err);
      setError('Failed to publish holiday list. Please try again later.');
    }
  };

  const handleArchiveList = async (list: HolidayList) => {
    try {
      await holidayService.holidayLists.archive(list.id);
      // Refresh the list to show updated status
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error archiving holiday list:', err);
      setError('Failed to archive holiday list. Please try again later.');
    }
  };

  const handleSaveList = async (listData: any) => {
    try {
      let savedListId;
      
      if (selectedList) {
        // Update existing list
        await holidayService.holidayLists.update(selectedList.id, {
          name: listData.name,
          year: listData.year,
          description: listData.description,
          status: listData.status
        });
        
        savedListId = selectedList.id;
      } else {
        // Create new list
        const response = await holidayService.holidayLists.create({
          name: listData.name, 
          year: listData.year,
          description: listData.description,
          status: listData.status || HolidayStatus.DRAFT
        });
        
        savedListId = response.data.id;
      }
      
      // Add holidays if provided
      if (listData.holidays && listData.holidays.length > 0) {
        try {
          // Try using batch creation first
          await holidayService.holidays.createBatch(savedListId, listData.holidays);
        } catch (batchError) {
          console.warn('Batch creation failed, falling back to individual creation:', batchError);
          // Fallback to individual creation if batch creation endpoint is not implemented
          for (const holiday of listData.holidays) {
            await holidayService.holidays.create(savedListId, holiday);
          }
        }
      }
      
      setIsListModalOpen(false);
      // Refresh the list to show updated data
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error saving holiday list:', err);
      setError('Failed to save holiday list. Please try again later.');
    }
  };

  const handleSaveHoliday = async (holidayData: any) => {
    try {
      if (selectedList) {
        await holidayService.holidays.create(selectedList.id, holidayData);
        setIsHolidayModalOpen(false);
        // Refresh the list to show updated data
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error saving holiday:', err);
      setError('Failed to save holiday. Please try again later.');
    }
  };

  const handleSort = (field: 'name' | 'year') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredHolidayLists = holidayLists
    .filter(list => 
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc' 
          ? a.year - b.year
          : b.year - a.year;
      }
    });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const getStatusBadgeClass = (status: HolidayStatus) => {
    switch (status) {
      case HolidayStatus.DRAFT:
        return 'status-badge draft';
      case HolidayStatus.PUBLISHED:
        return 'status-badge published';
      case HolidayStatus.ARCHIVED:
        return 'status-badge archived';
      default:
        return 'status-badge';
    }
  };

  const isActionDisabled = (list: HolidayList, action: 'publish' | 'archive' | 'edit' | 'delete') => {
    if (action === 'publish') {
      return list.status !== HolidayStatus.DRAFT || list.holidays.length === 0;
    }
    if (action === 'archive') {
      return list.status !== HolidayStatus.PUBLISHED;
    }
    if (action === 'edit' || action === 'delete') {
      return list.status === HolidayStatus.ARCHIVED;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="holiday-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="holiday-container">
      {/* Header Section */}
      <div className="holiday-header">
        <div className="header-top-row">
          <h1 className="holiday-title">Holiday Management</h1>
        </div>
        <div className="header-bottom-row">
          <div className="holiday-controls">
            <button
              className="filter-button"
              onClick={() => setIsFilterDialogOpen(true)}
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filter</span>
              {(filterStatus !== 'ALL' || filterYear !== new Date().getFullYear()) && (
                <span className="filter-badge">{filterStatus !== 'ALL' ? `${filterStatus}, ` : ''}{filterYear}</span>
              )}
            </button>
            <div className="search-container">
              <div className="search-icon-wrapper">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search holiday lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button
              className="create-button"
              onClick={handleCreateList}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Holiday List</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Holiday Lists Content */}
      <div className="holiday-content">
        <div className="holiday-list">
          <div className="holiday-grid">
            <div className="holiday-grid-header">
              <div 
                className="col-name cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                <span>List Name</span>
                {getSortIcon('name')}
              </div>
              <div 
                className="col-year cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('year')}
              >
                <span>Year</span>
                {getSortIcon('year')}
              </div>
              <div className="col-description">Description</div>
              <div className="col-count">Holidays</div>
              <div className="col-status">Status</div>
              <div className="col-actions">Actions</div>
            </div>

            <div className="holiday-grid-body">
              {filteredHolidayLists.length === 0 ? (
                <div className="empty-message">
                  No holiday lists found. Create your first holiday list to get started.
                </div>
              ) : (
                filteredHolidayLists.map((list) => (
                  <div key={list.id} className="holiday-grid-row">
                    <div className="col-name">
                      <span className="holiday-name">{list.name}</span>
                    </div>
                    <div className="col-year">
                      <span className="holiday-year">{list.year}</span>
                    </div>
                    <div className="col-description">
                      <span className="holiday-description">{list.description}</span>
                    </div>
                    <div className="col-count">
                      <span className="holiday-count">{list.holidayCount}</span>
                    </div>
                    <div className="col-status">
                      <span className={getStatusBadgeClass(list.status)}>
                        {list.status}
                      </span>
                    </div>
                    <div className="col-actions">
                      <button
                        className="action-button view"
                        onClick={() => handleAddHoliday(list)}
                        title="Add holiday"
                        disabled={list.status === HolidayStatus.ARCHIVED}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="action-button edit"
                        onClick={() => handleEditList(list)}
                        title="Edit list"
                        disabled={isActionDisabled(list, 'edit')}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="action-button publish"
                        onClick={() => handlePublishList(list)}
                        title="Publish list"
                        disabled={isActionDisabled(list, 'publish')}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="action-button archive"
                        onClick={() => handleArchiveList(list)}
                        title="Archive list"
                        disabled={isActionDisabled(list, 'archive')}
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDeleteClick(list)}
                        title="Delete list"
                        disabled={isActionDisabled(list, 'delete')}
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

      {/* Holiday List Modal */}
      {isListModalOpen && (
        <HolidayListModal
          holidayList={selectedList}
          onClose={() => setIsListModalOpen(false)}
          onSave={handleSaveList}
        />
      )}

      {/* Holiday Modal */}
      {isHolidayModalOpen && selectedList && (
        <HolidayModal
          listId={selectedList.id}
          onClose={() => setIsHolidayModalOpen(false)}
          onSave={handleSaveHoliday}
        />
      )}

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onApplyFilters={applyFilters}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && listToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Holiday List</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the holiday list "{listToDelete.name}"?</p>
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

export default HolidayManagement; 