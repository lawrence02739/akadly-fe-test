export const AnnouncementStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type AnnouncementStatus = typeof AnnouncementStatus[keyof typeof AnnouncementStatus];

export const AnnouncementAudience = {
  ENROLLED_LEARNERS: 'ENROLLED_LEARNERS',
  ENROLLED_LEARNERS_AND_INSTRUCTORS: 'ENROLLED_LEARNERS_AND_INSTRUCTORS',
} as const;
export type AnnouncementAudience = typeof AnnouncementAudience[keyof typeof AnnouncementAudience];

export const LearnerStatusFilter = {
  ALL: 'ALL',
  ACTIVE_ONLY: 'ACTIVE_ONLY',
  COMPLETED_ONLY: 'COMPLETED_ONLY',
} as const;
export type LearnerStatusFilter = typeof LearnerStatusFilter[keyof typeof LearnerStatusFilter];

export const AnnouncementPriority = {
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
} as const;
export type AnnouncementPriority = typeof AnnouncementPriority[keyof typeof AnnouncementPriority];

export interface AnnouncementAttachment {
  fileName: string;
  sizeBytes: number;
  url: string;
  _id?: string;
}

export interface Announcement {
  id: string;
  code: string;
  title: string;
  bodyHtml?: string;
  status: AnnouncementStatus;
  audience: AnnouncementAudience;
  priority: AnnouncementPriority;
  isPinned: boolean;
  pinned?: boolean;
  postedBy?: string;
  createdByName?: string;
  courseId?: string;
  courseTitle?: string;
  batchId?: string;
  batchName?: string;
  learnerStatus?: string;
  expiresAt?: string;
  channels?: { email?: boolean; push?: boolean };
  history?: any[];
  bodyText?: string;
  createdAt: string;
  publishedAt?: string;
  attachments: AnnouncementAttachment[];
  isRead?: boolean;
}
