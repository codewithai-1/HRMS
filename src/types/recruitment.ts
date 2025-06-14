export enum JobStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export enum ApplicationStatus {
  NEW = 'NEW',
  SCREENING = 'SCREENING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN'
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  benefits: string[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  closingDate: string;
  numberOfPositions: number;
  applicationsCount: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
    resumeUrl: string;
    coverLetterUrl?: string;
  };
  evaluations: {
    id: string;
    evaluatorId: string;
    evaluatorName: string;
    score: number;
    comments: string;
    createdAt: string;
  }[];
  interviews: {
    id: string;
    scheduledAt: string;
    interviewerId: string;
    interviewerName: string;
    type: 'PHONE' | 'VIDEO' | 'IN_PERSON';
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    feedback?: string;
    rating?: number;
  }[];
  timeline: {
    status: ApplicationStatus;
    timestamp: string;
    note?: string;
  }[];
} 