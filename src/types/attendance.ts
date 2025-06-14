import { User } from './user';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  ON_PERMISSION = 'ON_PERMISSION'
}

export enum RegularizationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employee?: User;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  totalHours: number;
  lateMinutes: number;
  earlyExitMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  employeeId: string;
  employee: User;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: RegularizationStatus;
  approvedBy?: string;
  approverComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Regularization {
  id: string;
  employeeId: string;
  employee: User;
  date: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BOTH';
  requestedClockIn?: string;
  requestedClockOut?: string;
  reason: string;
  supportingDocument?: string;
  status: RegularizationStatus;
  approvedBy?: string;
  approverComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalOnLeave: number;
  averageWorkingHours: number;
  lateEntries: number;
  earlyExits: number;
  permissions: number;
}

// Form Data Types
export interface PermissionFormData {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface RegularizationFormData {
  date: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BOTH';
  requestedClockIn?: string;
  requestedClockOut?: string;
  reason: string;
  supportingDocument?: File;
}

// Settings Types
export interface AttendanceSettings {
  workingHours: {
    startTime: string;
    endTime: string;
  };
  lateThreshold: number; // minutes
  earlyExitThreshold: number; // minutes
  permissionLimit: number; // per month
  permissionMaxDuration: number; // minutes
  gracePeriod: number; // minutes
  weeklyOffDays: number[]; // 0 = Sunday, 6 = Saturday
  departmentSpecificRules?: {
    [departmentId: string]: {
      startTime?: string;
      endTime?: string;
      lateThreshold?: number;
      earlyExitThreshold?: number;
    };
  };
} 