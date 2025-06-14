export type TransferStatus = 
  | 'PENDING' 
  | 'APPROVED_BY_CURRENT_MANAGER'
  | 'APPROVED_BY_NEW_MANAGER'
  | 'APPROVED_BY_HR'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TransferType = 'DEPARTMENT' | 'TEAM' | 'POSITION';

export interface TransferApproval {
  id: string;
  transferId: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  timestamp: string;
}

export interface EmployeeTransfer {
  id: string;
  employeeId: string;
  employeeName: string;
  transferType: TransferType;
  
  // Current details
  currentDepartmentId: string;
  currentDepartmentName: string;
  currentTeamId?: string;
  currentTeamName?: string;
  currentPosition: string;
  currentManager: string;
  
  // New details
  newDepartmentId: string;
  newDepartmentName: string;
  newTeamId?: string;
  newTeamName?: string;
  newPosition: string;
  newManager: string;
  
  // Transfer details
  requestedBy: string;
  requestedDate: string;
  effectiveDate: string;
  reason: string;
  status: TransferStatus;
  
  // Additional details
  comments?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  
  // Approval history
  approvals: TransferApproval[];
  
  createdAt: string;
  updatedAt: string;
} 