export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type SubmissionType = 'FILE' | 'TEXT' | 'LINK';

export interface AssignmentFileSettings {
  acceptedExtensions: string[];
  maxFileSizeMb: number;
}

export interface AssignmentSubmissionSettings {
  allowedTypes: SubmissionType[];
  file: AssignmentFileSettings;
  attemptLimit: number | null;
  allowReplacementBeforeDue: boolean;
}

export interface AssignmentGradingSettings {
  maxScore: number;
  defaultGraderUserId?: string;
}

export interface AssignmentLateSubmissionSettings {
  allowed: boolean;
  graceMinutes: number;
}

export interface AssignmentAvailability {
  courseId?: string;
  courseTitle?: string;
  batchId?: string;
  batchName?: string;
  publishAt?: string;
  dueAt?: string;
  timezone?: string;
}

export interface Assignment {
  id: string;
  tenantId: string;
  title: string;
  instructionsHtml: string;
  instructionsWordCount: number;
  attachments: {
    key: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }[];
  submission: AssignmentSubmissionSettings;
  grading: AssignmentGradingSettings;
  lateSubmission: AssignmentLateSubmissionSettings;
  availability: AssignmentAvailability;
  status: AssignmentStatus;
  publishedAt?: string;
  closedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListResponse {
  items: Assignment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAssignmentDto {
  title?: string;
  instructionsHtml?: string;
  attachments?: {
    key: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }[];
  submission?: Partial<AssignmentSubmissionSettings>;
  grading?: Partial<AssignmentGradingSettings>;
  lateSubmission?: Partial<AssignmentLateSubmissionSettings>;
  availability?: Partial<AssignmentAvailability>;
}

export interface UpdateAssignmentDto extends CreateAssignmentDto {}

export interface AssignmentStats {
  activeAssignments: { count: number; dueThisWeek: number };
  awaitingGrading: { count: number; assignmentCount: number };
  lateSubmissions: { count: number; needReview: number };
  plagiarismAlerts: { count: number; highSeverity: number };
  averageScore: { percent: number | null; deltaVsPrevious: number | null };
}
