export enum HolidayStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayList {
  id: string;
  name: string;
  year: number;
  description: string;
  status: HolidayStatus;
  holidays: Holiday[];
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface HolidayFormData extends Omit<Holiday, 'id' | 'createdAt' | 'updatedAt'> {
  name: string;
  date: string;
  description: string;
  isRecurring: boolean;
}

export interface HolidayListFormData extends Omit<HolidayList, 'id' | 'createdAt' | 'updatedAt' | 'holidays'> {
  name: string;
  year: number;
  description: string;
  status: HolidayStatus;
}

// API Response Types
export interface HolidayListResponse {
  lists: HolidayList[];
  total: number;
}

export interface HolidayResponse {
  holiday: Holiday;
}

export interface HolidayListDetailResponse {
  list: HolidayList;
  holidays: Holiday[];
} 