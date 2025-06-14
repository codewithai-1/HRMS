export enum GoalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW_PENDING = 'REVIEW_PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export enum GoalType {
  PERSONAL = 'Personal',
  INDIVIDUAL = 'Individual',
  TEAM = 'Team',
  ORGANIZATIONAL = 'Organizational',
  DEVELOPMENT = 'Development'
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  accomplishmentDate: string;
  employeeComments: string;
  managerComments: string;
  completionPercentage: number;
  goalType: GoalType;
  employeeId: string;
  managerId: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFormData {
  name: string;
  description: string;
  accomplishmentDate: string;
  employeeComments: string;
  managerComments: string;
  completionPercentage: number;
  goalType: GoalType;
}

export interface GoalsGroup {
  id: string;
  name: string;
  description: string;
  goals: Goal[];
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
} 