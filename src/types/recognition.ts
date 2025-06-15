import { UserRole } from './enums';

export enum RecognitionCategory {
  STAR_PERFORMER = 'Star Performer',
  LEAD_THAT_INSPIRES = 'Lead That Inspires',
  INNOVATION_CHAMPION = 'Innovation Champion',
  TEAM_PLAYER_EXCELLENCE = 'Team Player Excellence',
  CUSTOMER_HERO = 'Customer Hero',
  GROWTH_CATALYST = 'Growth Catalyst'
}

export enum NominationType {
  SELF = 'self',
  PEER = 'peer',
  MANAGER = 'manager'
}

export enum NominationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WINNER = 'winner'
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  managerId: string;
}

export interface Category {
  id: string;
  name: RecognitionCategory;
  description: string;
  criteria: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Nomination {
  id: string;
  categoryId: string;
  nomineeId: string;
  nominatorId: string;
  type: NominationType;
  justification: string;
  supportingDocuments: string[];
  status: NominationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  managerComments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Winner {
  id: string;
  nominationId: string;
  categoryId: string;
  employeeId: string;
  period: string;
  announcedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecognitionStats {
  totalNominations: number;
  pendingNominations: number;
  approvedNominations: number;
  rejectedNominations: number;
  totalWinners: number;
  recentWinners: Winner[];
}

export interface NominationFormData {
  categoryId: string;
  nomineeId: string;
  type: NominationType;
  justification: string;
  supportingDocuments?: File[];
}

export interface ReviewNominationData {
  status: NominationStatus;
  comments: string;
} 