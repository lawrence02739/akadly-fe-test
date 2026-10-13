export const InstructorType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT_BASED: 'CONTRACT_BASED',
  GUEST: 'GUEST',
} as const;
export type InstructorType =
  (typeof InstructorType)[keyof typeof InstructorType];

export const TeachingRole = {
  LEAD: 'LEAD',
  CO: 'CO',
} as const;
export type TeachingRole = (typeof TeachingRole)[keyof typeof TeachingRole];

export const Weekday = {
  MON: 'MON',
  TUE: 'TUE',
  WED: 'WED',
  THU: 'THU',
  FRI: 'FRI',
  SAT: 'SAT',
  SUN: 'SUN',
} as const;
export type Weekday = (typeof Weekday)[keyof typeof Weekday];

export const InvitationDeliveryStatus = {
  NOT_SENT: 'NOT_SENT',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;
export type InvitationDeliveryStatus =
  (typeof InvitationDeliveryStatus)[keyof typeof InvitationDeliveryStatus];

export const InvitationState = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
} as const;
export type InvitationState =
  (typeof InvitationState)[keyof typeof InvitationState];

export const EngagementState = {
  ONGOING: 'ONGOING',
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  REVIEW_DUE: 'REVIEW_DUE',
  EXPIRED: 'EXPIRED',
} as const;
export type EngagementState =
  (typeof EngagementState)[keyof typeof EngagementState];

export type InstructorStatus =
  | 'draft'
  | 'invited'
  | 'active'
  | 'suspended'
  | 'disabled';

export interface WeeklySlot {
  day: Weekday;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface Engagement {
  startDate: string | null;
  endDate: string | null;
  requiredWeeklyHours: number | null;
  weeklySchedule: WeeklySlot[];
  timezone: string;
  renewalNote: string;
  renewalReviewDate: string | null;
}

export interface InstructorPermissionFlags {
  editCourseContent: boolean;
  gradeAssessments: boolean;
  communicateWithLearners: boolean;
}

export interface InstructorAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string | null;
  batchId: string;
  batchName: string;
  teachingRole: TeachingRole;
  createdAt: string;
  createdBy: string | null;
}

export interface InstructorInvitation {
  sentAt: string | null;
  expiresAt: string | null;
  lastSentAt: string | null;
  resendCount: number;
  deliveryStatus: InvitationDeliveryStatus;
  revokedAt: string | null;
}

export interface InstructorView {
  id: string;
  tenantId: string;
  userId: string;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  instructorCode: string;
  specialty: string;
  expertise: string[];
  bio: string;
  instructorType: InstructorType;
  status: InstructorStatus;
  engagement: Engagement;
  permissionFlags: InstructorPermissionFlags;
  assignments: Array<
    InstructorAssignment & {
      learnersCount?: number;
    }
  >;
  invitation: InstructorInvitation;
  emailVerifiedAt: string | null;
  suspensionReason: string;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  coursesCount: number;
  learnersCount: number;
  lastActiveAt: string | null;
  engagementState: EngagementState;
  invitationState: InvitationState;
}

export interface InstructorListItem {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  instructorCode: string;
  specialty: string;
  instructorType: InstructorType;
  status: InstructorStatus;
  engagement: Pick<
    Engagement,
    'startDate' | 'endDate' | 'requiredWeeklyHours' | 'renewalReviewDate'
  >;
  coursesCount: number;
  learnersCount: number;
  lastActiveAt: string | null;
  engagementState: EngagementState;
  invitationState: InvitationState;
  invitationExpiresAt: string | null;
  deliveryStatus: InvitationDeliveryStatus;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedInstructorsResponse {
  data: InstructorListItem[];
  meta: PaginationMeta;
}

export interface InstructorOption {
  id: string;
  fullName?: string;
  name: string;
  email: string;
  specialty: string;
}

export interface CreateInstructorDto {
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  specialty: string;
  expertise?: string[];
  bio?: string;
  instructorType: InstructorType;
  engagement: {
    startDate?: string | null;
    endDate?: string | null;
    requiredWeeklyHours?: number | null;
    weeklySchedule?: WeeklySlot[];
    timezone?: string;
    renewalNote?: string;
    renewalReviewDate?: string | null;
  };
  permissions?: Partial<InstructorPermissionFlags>;
  initialAssignment?: {
    courseId: string;
    batchId: string;
    teachingRole: TeachingRole;
  };
  sendInvitation?: boolean;
}

export interface UpdateInstructorDto {
  fullName?: string;
  name?: string;
  phone?: string;
  specialty?: string;
  expertise?: string[];
  bio?: string;
  instructorType?: InstructorType;
  engagement?: {
    startDate?: string | null;
    endDate?: string | null;
    requiredWeeklyHours?: number | null;
    weeklySchedule?: WeeklySlot[];
    timezone?: string;
    renewalNote?: string;
    renewalReviewDate?: string | null;
  };
  permissions?: Partial<InstructorPermissionFlags>;
}

export interface AddAssignmentDto {
  courseId: string;
  batchId: string;
  teachingRole: TeachingRole;
}

export interface UpdatePermissionsDto {
  editCourseContent: boolean;
  gradeAssessments: boolean;
  communicateWithLearners: boolean;
}

export interface ListInstructorsParams {
  search?: string;
  specialty?: string;
  status?: string;
  instructorType?: string;
  page?: number;
  limit?: number;
}
