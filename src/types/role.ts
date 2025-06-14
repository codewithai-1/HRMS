import { UserRole } from './enums.ts';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  createdAt: string;
  permissions: string[];
} 