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
import './TransfersManagement.css';
import { EmployeeTransfer } from '../../types/transfer';

const TransfersManagement = () => {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<EmployeeTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'employeeName'>('employeeName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<EmployeeTransfer | null>(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await api.transfers.getAll();
        setTransfers(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load transfers. Please try again later.');
        console.error('Error fetching transfers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const handleCreateTransfer = () => {
    navigate('/transfers/new');
  };

  const handleEditTransfer = (transfer: EmployeeTransfer) => {
    navigate(`/transfers/${transfer.id}`);
  };

  const handleDeleteClick = (transfer: EmployeeTransfer) => {
    setTransferToDelete(transfer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transferToDelete) {
      try {
        await api.transfers.delete(transferToDelete.id);
        setTransfers(transfers.filter(t => t.id !== transferToDelete.id));
        setIsDeleteModalOpen(false);
        setTransferToDelete(null);
      } catch (err) {
        console.error('Error deleting transfer:', err);
        setError('Failed to delete transfer. Please try again later.');
      }
    }
  };

  const handleSort = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const filteredTransfers = transfers
    .filter(transfer => 
      transfer.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.currentDepartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.newDepartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortDirection === 'asc' 
        ? a.employeeName.localeCompare(b.employeeName)
        : b.employeeName.localeCompare(a.employeeName);
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
      <div className="transfers-container">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transfers-container">
        <div className="error-message">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="transfers-container">
      {/* Header Section */}
      <div className="transfers-header">
        <div className="transfers-title">
          <h1>Transfer Management</h1>
          <p className="text-subtitle">Manage employee transfers and department changes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input pl-10"
            />
          </div>
          <button
            className="create-transfer-button"
            onClick={handleCreateTransfer}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Transfers Grid */}
      <div className="transfers-grid">
        <div className="transfers-grid-header">
          <div 
            className="sortable-header"
            onClick={handleSort}
          >
            <span>Employee</span>
            {getSortIcon()}
          </div>
          <div className="col-from">From</div>
          <div className="col-to">To</div>
          <div className="col-status">Status</div>
          <div className="col-date">Effective Date</div>
          <div className="col-actions">Actions</div>
        </div>

        <div className="transfers-grid-body">
          {filteredTransfers.length === 0 ? (
            <div className="empty-message">
              No transfers found. Create a new transfer request to get started.
            </div>
          ) : (
            filteredTransfers.map((transfer) => (
              <div key={transfer.id} className="transfers-grid-row">
                <div className="sortable-column">
                  <span className="transfer-employee-name">
                    {transfer.employeeName}
                  </span>
                </div>
                <div className="col-from">
                  <span className="department-name">
                    {transfer.currentDepartmentName}
                  </span>
                  {transfer.currentTeamName && (
                    <span className="team-name">
                      {transfer.currentTeamName}
                    </span>
                  )}
                </div>
                <div className="col-to">
                  <span className="department-name">
                    {transfer.newDepartmentName}
                  </span>
                  {transfer.newTeamName && (
                    <span className="team-name">
                      {transfer.newTeamName}
                    </span>
                  )}
                </div>
                <div className="col-status">
                  <span className={`status-badge ${transfer.status.toLowerCase()}`}>
                    {transfer.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="col-date">
                  {new Date(transfer.effectiveDate).toLocaleDateString()}
                </div>
                <div className="col-actions">
                  <button
                    className="action-button edit"
                    onClick={() => handleEditTransfer(transfer)}
                    title="Edit transfer"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteClick(transfer)}
                    title="Delete transfer"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && transferToDelete && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Transfer</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the transfer request for {transferToDelete.employeeName}?</p>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
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

export default TransfersManagement; 