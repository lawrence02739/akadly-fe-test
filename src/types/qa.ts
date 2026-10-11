export const QuestionStatus = {
  OPEN: 'OPEN',
  ANSWERED: 'ANSWERED',
  ESCALATED: 'ESCALATED',
  RESOLVED: 'RESOLVED',
} as const;
export type QuestionStatus = typeof QuestionStatus[keyof typeof QuestionStatus];

export const QuestionPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type QuestionPriority = typeof QuestionPriority[keyof typeof QuestionPriority];

export const QuestionMessageKind = {
  PUBLIC_REPLY: 'PUBLIC_REPLY',
  INTERNAL_NOTE: 'INTERNAL_NOTE',
} as const;
export type QuestionMessageKind = typeof QuestionMessageKind[keyof typeof QuestionMessageKind];

export const QuestionAuthorType = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
} as const;
export type QuestionAuthorType = typeof QuestionAuthorType[keyof typeof QuestionAuthorType];

export interface QuestionAttachment {
  fileName: string;
  sizeBytes: number;
  url?: string;
}

export interface LessonQuestion {
  id: string;
  code: string;
  studentName?: string;
  courseTitle: string;
  lessonTitle: string;
  title: string;
  body?: string;
  status: QuestionStatus;
  priority?: QuestionPriority;
  assigneeName?: string;
  lastActivityAt: string;
  slaDueAt?: string;
  attachments?: QuestionAttachment[];
  createdAt?: string;
}

export interface QuestionMessage {
  id: string;
  kind: QuestionMessageKind;
  authorType: QuestionAuthorType;
  authorName: string;
  body: string;
  attachments: QuestionAttachment[];
  createdAt: string;
}
