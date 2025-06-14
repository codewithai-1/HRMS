export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface LeaveType {
  id: string;
  name: string;
  description: string;
  defaultDays: number;
  isActive: boolean;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isHalfDay: boolean;
  halfDayType: 'FIRST_HALF' | 'SECOND_HALF';
  halfDayDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCalendarEvent extends LeaveRequest {
  title: string;
  start: Date;
  end: Date;
}

// Form Data Types
export interface LeaveTypeFormData extends Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'> {
  name: string;
  description: string;
  defaultDays: number;
  isActive: boolean;
  allowCarryForward: boolean;
  maxCarryForwardDays: number;
}

export interface LeaveRequestFormData {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isHalfDay: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  halfDayDate?: 'start' | 'end';
}

export interface LeaveBalanceOverride {
  employeeId: string;
  leaveTypeId: string;
  adjustmentDays: number;
  reason: string;
}

// API Response Types
export interface LeaveBalanceResponse {
  employeeId: string;
  balances: LeaveBalance[];
}

export interface LeaveUsageReport {
  departmentId: string;
  departmentName: string;
  employees: {
    employeeId: string;
    employeeName: string;
    leaveTypes: {
      leaveTypeId: string;
      leaveTypeName: string;
      totalDays: number;
      usedDays: number;
      remainingDays: number;
    }[];
  }[];
} 