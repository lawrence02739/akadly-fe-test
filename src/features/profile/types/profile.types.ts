import type {
  InstructorPermissionFlags,
  InstructorType,
  Weekday,
} from '../../instructors/types/instructor.types';

export interface MyAccessContext {
  memberType: 'user' | 'instructor';
  roles: Array<{
    id: string;
    key: string;
    name: string;
    systemKey: 'owner' | 'admin' | 'staff' | 'instructor' | null;
  }>;
  instructor?: {
    id: string;
    instructorCode: string;
    instructorType: InstructorType;
    specialty: string;
    profileCompletion?: {
      percent: number;
      missing: string[];
    };
  } | null;
}

export interface InstructorSelfProfile {
  fullName: string;
  professionalTitle: string;
  expertise: string[];
  bio: string;
  showBioToLearners: boolean;
  profilePictureUrl: string | null;
  email: string;
  emailVerified: boolean;
  phone: string;
  managed: {
    academyName: string;
    roleName: string;
    specialty: string;
    instructorType: InstructorType;
    assignedCoursesCount: number;
    assignedCohortsCount: number;
    permissionFlags: InstructorPermissionFlags;
  };
  completion: {
    percent: number;
    missing: string[];
  };
}

export interface UpdateInstructorSelfProfileDto {
  fullName?: string;
  professionalTitle?: string;
  expertise?: string[];
  bio?: string;
  showBioToLearners?: boolean;
  phone?: string;
  profilePictureKey?: string;
  removeProfilePicture?: boolean;
}

export type MeetingFormat =
  | 'ONLINE_BY_APPOINTMENT'
  | 'ONLINE_DROP_IN'
  | 'IN_PERSON';

export type AvailabilityStatus =
  | 'AVAILABLE_OFFICE_HOURS'
  | 'AVAILABLE_ANYTIME'
  | 'AWAY'
  | 'DO_NOT_DISTURB';

export type GradingQueueOrder =
  | 'OLDEST_FIRST'
  | 'NEWEST_FIRST'
  | 'BY_DUE_DATE'
  | 'BY_COURSE';

export type PendingGradingReminder =
  | 'OFF'
  | 'AFTER_12_HOURS'
  | 'AFTER_24_HOURS'
  | 'AFTER_48_HOURS';

export type PreferredLearnerContact =
  | 'ASSIGNED_COURSE_DISCUSSIONS'
  | 'EMAIL'
  | 'OFFICE_HOURS_ONLY';

export type ExpectedResponseTime =
  | 'SAME_DAY'
  | 'WITHIN_1_BUSINESS_DAY'
  | 'WITHIN_2_BUSINESS_DAYS';

export interface OfficeHourItem {
  id?: string;
  day: Weekday;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  meetingFormat: MeetingFormat;
  format?: string;
}

export interface TeachingPreferences {
  timezone: string;
  availabilityStatus: AvailabilityStatus;
  officeHours: OfficeHourItem[];
  gradingQueueOrder: GradingQueueOrder;
  pendingGradingReminder: PendingGradingReminder;
  preferredLearnerContact: PreferredLearnerContact;
  expectedResponseTime: ExpectedResponseTime;
  showOfficeHoursToLearners: boolean;
  followUpOnUnansweredDiscussions: boolean;
  remindUnansweredDiscussions?: boolean;
}

export interface NotificationPreferences {
  assignedCourseDiscussions: boolean;
  liveSessionReminders: boolean;
  courseActivitySummaries: boolean;
  channels: {
    email: boolean;
    inApp: boolean;
  };
  digestFrequency: 'OFF' | 'DAILY' | 'WEEKLY';
  digestTime: string; // HH:mm
  digestDeliveryTime?: string;
}

export interface SecurityOverview {
  email: string;
  emailVerified: boolean;
  passwordChangedAt: string | null;
  twoFactor: {
    enabled: boolean;
    available: boolean;
  };
}

export interface ActiveSession {
  id: string;
  device: {
    browser: string;
    os: string;
    label: string;
  };
  ipMasked: string;
  location: string | null;
  lastActivityAt: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  signOutOtherSessions?: boolean;
}

export interface CommonUserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  profilePictureUrl?: string | null;
}
