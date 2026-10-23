export const LiveClassStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  CANCELLED: 'CANCELLED',
} as const;
export type LiveClassStatus = (typeof LiveClassStatus)[keyof typeof LiveClassStatus];

export const LiveClassDisplayStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  UPCOMING: 'UPCOMING',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type LiveClassDisplayStatus =
  (typeof LiveClassDisplayStatus)[keyof typeof LiveClassDisplayStatus];

export const RepeatFrequency = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
} as const;
export type RepeatFrequency = (typeof RepeatFrequency)[keyof typeof RepeatFrequency];

export const SeriesEndType = {
  AFTER_COUNT: 'AFTER_COUNT',
  ON_DATE: 'ON_DATE',
} as const;
export type SeriesEndType = (typeof SeriesEndType)[keyof typeof SeriesEndType];

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

export const UpdateScope = {
  THIS: 'THIS',
  THIS_AND_FOLLOWING: 'THIS_AND_FOLLOWING',
  ALL: 'ALL',
} as const;
export type UpdateScope = (typeof UpdateScope)[keyof typeof UpdateScope];

export const CalendarView = {
  MONTH: 'MONTH',
  WEEK: 'WEEK',
  DAY: 'DAY',
} as const;
export type CalendarView = (typeof CalendarView)[keyof typeof CalendarView];

export const LiveClassConflictType = {
  INSTRUCTOR_OVERLAP: 'INSTRUCTOR_OVERLAP',
  BATCH_OVERLAP: 'BATCH_OVERLAP',
  INSTRUCTOR_UNASSIGNED: 'INSTRUCTOR_UNASSIGNED',
  NO_CO_HOST: 'NO_CO_HOST',
} as const;
export type LiveClassConflictType =
  (typeof LiveClassConflictType)[keyof typeof LiveClassConflictType];

export interface PersonRef {
  id: string;
  name: string;
}

export interface RecurrenceRule {
  frequency: RepeatFrequency;
  interval?: number;
  daysOfWeek?: Weekday[];
  endType?: SeriesEndType;
  occurrences?: number;
  untilDate?: string;
}

export interface StudentPermissions {
  camera: boolean;
  screenShare: boolean;
  microphone: boolean;
  chatAndReactions: boolean;
}

export interface LiveClassConflict {
  type: LiveClassConflictType;
  severity: 'ERROR' | 'WARNING';
  sessionSequence?: number;
  conflictingSessionId?: string;
  conflictingSessionTitle?: string;
  conflictingStartsAt?: string;
  conflictingEndsAt?: string;
  message: string;
}

export interface LiveClassListItem {
  id: string;
  seriesId: string;
  sequence: number;
  courseId: string;
  courseTitle: string;
  batchId: string;
  batchName: string;
  title: string;
  courseNodeId: string | null;
  agenda: string | null;
  instructor: PersonRef | null;
  coInstructors: PersonRef[];
  supportStaff: PersonRef | null;
  startsAt: string;
  endsAt: string;
  localDate: string;
  timezone: string;
  durationMinutes: number;
  capacity: number;
  enrolled: number;
  seatsAvailable: number;
  reminderOffsetsMinutes: number[];
  studentPermissions: StudentPermissions;
  meetingUrl: string | null;
  status: LiveClassStatus;
  displayStatus: LiveClassDisplayStatus;
  overridden: boolean;
  joinedCount: number;
  cancelReason: string | null;
  cancelledAt: string | null;
  creditsIssued: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveClassDetails extends LiveClassListItem {
  series: {
    id: string;
    recurrence: RecurrenceRule;
    totalOccurrences: number;
    startDate: string;
    status: string;
  } | null;
  siblings: {
    total: number;
    upcomingAfterThis: number;
  };
}

export interface CalendarSessionItem {
  id: string;
  seriesId: string;
  sequence: number;
  title: string;
  courseId: string;
  courseTitle: string;
  batchId: string;
  batchName: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  displayStatus: LiveClassDisplayStatus;
  instructor: PersonRef | null;
  coInstructors: PersonRef[];
  supportStaff: PersonRef | null;
  capacity: number;
  joinedCount: number;
}

export interface CalendarDay {
  date: string;
  isToday: boolean;
  inCurrentMonth: boolean;
  count: number;
  sessions: CalendarSessionItem[];
}

export interface CalendarResponse {
  view: CalendarView;
  date: string;
  timezone: string;
  range: {
    from: string;
    to: string;
  };
  days: CalendarDay[];
}

export interface LiveClassStatsResponse {
  sessionsThisWeek: {
    total: number;
    upcoming: number;
    completed: number;
  };
  liveNow: {
    count: number;
    joined: number;
    enrolled: number;
  };
  instructorConflicts: {
    count: number;
    needsAssignment: number;
  };
  cancelled: {
    count: number;
    creditsIssued: number;
  };
  weekRange: {
    from: string;
    to: string;
  };
}

export interface ConflictsResponse {
  items: LiveClassConflict[];
  total: number;
  summary: string;
}

export interface LiveClassPreviewOccurrence {
  sequence: number;
  startsAt: string;
  endsAt: string;
  localDate: string;
  displayStatus: string;
  isToday: boolean;
}

export interface LiveClassPreviewResponse {
  occurrences: LiveClassPreviewOccurrence[];
  totalOccurrences: number;
  totalTeachingMinutes: number;
  capacity: number;
  enrolled: number;
  seatsAvailable: number;
  range: {
    from: string;
    to: string;
  };
  conflicts: LiveClassConflict[];
  instructorAvailable: boolean;
}

export interface CreateLiveClassPayload {
  courseId: string;
  batchId: string;
  title: string;
  courseNodeId?: string;
  agenda?: string;
  instructorId?: string;
  coInstructorIds?: string[];
  supportStaffId?: string | null;
  startDate: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
  repeat: RecurrenceRule;
  reminderOffsetsMinutes?: number[];
  studentPermissions?: StudentPermissions;
  meetingUrl?: string;
  saveAsDraft?: boolean;
  ignoreConflicts?: boolean;
}

export interface UpdateLiveClassPayload {
  scope?: UpdateScope;
  title?: string;
  agenda?: string;
  courseNodeId?: string | null;
  instructorId?: string | null;
  coInstructorIds?: string[];
  supportStaffId?: string | null;
  startTime?: string;
  durationMinutes?: number;
  startsAtOverride?: string;
  reminderOffsetsMinutes?: number[];
  studentPermissions?: StudentPermissions;
  meetingUrl?: string | null;
  status?: LiveClassStatus;
  cancelReason?: string;
  creditsIssued?: number;
  ignoreConflicts?: boolean;
}
