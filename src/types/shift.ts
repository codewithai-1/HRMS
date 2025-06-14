export type ShiftStatus = 'ACTIVE' | 'INACTIVE';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';

export interface Shift {
  id: string;
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  timezone: string;  // e.g., 'America/New_York', 'Asia/Tokyo'
  breakDuration: number; // in minutes
  status: ShiftStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Add a type for timezone options
export const commonTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Europe/London',
  'Europe/Paris',
  'Australia/Sydney'
] as const;

export type TimezoneOption = typeof commonTimezones[number];

export interface EmployeeShift {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  shiftName: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
} 