export const TestDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type TestDifficulty = (typeof TestDifficulty)[keyof typeof TestDifficulty];

export const TestType = {
  CLASS_TEST: 'CLASS_TEST',
  PRACTICE: 'PRACTICE',
  MOCK: 'MOCK',
  PROCTORED: 'PROCTORED',
  DIAGNOSTIC: 'DIAGNOSTIC',
} as const;
export type TestType = (typeof TestType)[keyof typeof TestType];

export const TestStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type TestStatus = (typeof TestStatus)[keyof typeof TestStatus];

export const CertificationIssuance = {
  NONE: 'NONE',
  IMMEDIATE: 'IMMEDIATE',
  ON_PASS: 'ON_PASS',
  AFTER_REVIEW: 'AFTER_REVIEW',
} as const;
export type CertificationIssuance =
  (typeof CertificationIssuance)[keyof typeof CertificationIssuance];

export const FeedbackMechanism = {
  NONE: 'NONE',
  INSTANT_RESULT: 'INSTANT_RESULT',
  SURVEY: 'SURVEY',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
} as const;
export type FeedbackMechanism =
  (typeof FeedbackMechanism)[keyof typeof FeedbackMechanism];

export const QuestionSource = {
  CREATED_IN_TEST: 'CREATED_IN_TEST',
  IMPORTED_FROM_BANK: 'IMPORTED_FROM_BANK',
  FORKED: 'FORKED',
} as const;
export type QuestionSource = (typeof QuestionSource)[keyof typeof QuestionSource];

export const ProctoringType = {
  NONE: 'NONE',
  AI_PROCTORED: 'AI_PROCTORED',
  LIVE_PROCTORED: 'LIVE_PROCTORED',
  HYBRID: 'HYBRID',
} as const;
export type ProctoringType = (typeof ProctoringType)[keyof typeof ProctoringType];

export const FlagSensitivity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type FlagSensitivity =
  (typeof FlagSensitivity)[keyof typeof FlagSensitivity];

export const ViolationType = {
  TAB_SWITCH: 'TAB_SWITCH',
  FACE_OUT_OF_FRAME: 'FACE_OUT_OF_FRAME',
  MULTIPLE_FACES: 'MULTIPLE_FACES',
  NOISE_DETECTED: 'NOISE_DETECTED',
  PHONE_DETECTED: 'PHONE_DETECTED',
} as const;
export type ViolationType = (typeof ViolationType)[keyof typeof ViolationType];

export interface MediaRef {
  key: string;
  url?: string;
  mediaAssetId?: string;
}

export interface CategoryRef {
  categoryId: string;
  categoryName: string;
}

export interface InstructorRef {
  instructorId: string;
  instructorName: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface GradingConfig {
  totalMarks: number;
  passMarks: number;
  passingPercentage?: number;
  retakeFee?: Money;
  maxAttempts?: number | null;
  certificationIssuance?: CertificationIssuance;
  validityPeriodDays?: number;
  feedbackMechanism?: FeedbackMechanism;
}

export interface CourseLink {
  courseId: string;
  courseTitle?: string;
  nodeId?: string;
  nodeTitle?: string;
  courseNodeId: string;
}

export interface TestQuestionRef {
  id: string;
  sequence: number;
  marks: number;
  negativeMarks: number;
  source: QuestionSource;
  addedAt: string;

  // Resolved question properties from question bank
  type?: string;
  subject?: string;
  topic?: string;
  tags?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  group?: boolean;
  text?: string;
  explanation?: string;
  options?: any[];
  answer?: number;
  range?: number;
  colI?: any[];
  colII?: any[];
  content?: Record<string, any>;
  bloomsLevel?: string;
  categoryId?: string;
  authorName?: string;
  createdBy?: string;
}

export interface ProctoringSettings {
  type: ProctoringType;
  studentsPerProctor: number;
  allowLiveChat: boolean;
  proctorCanPause: boolean;
  identityVerificationRequired: boolean;
}

export interface ViolationSettings {
  flagThreshold: FlagSensitivity;
  autoPauseOnViolation: boolean;
  maxViolationsAllowed: number;
  monitoredTypes: ViolationType[];
}

export interface LockdownSettings {
  requireLockdownBrowser: boolean;
  disableRightClick: boolean;
  disableCopyPaste: boolean;
  disableMultipleMonitors: boolean;
  allowedUrls: string[];
}

export interface MonitoringSettings {
  webcamRequired: boolean;
  microphoneMonitoring: boolean;
  phoneDetection: boolean;
}

export interface TestSettings {
  proctoring: ProctoringSettings;
  violations: ViolationSettings;
  lockdown: LockdownSettings;
  monitoring: MonitoringSettings;
}

export interface Test {
  id: string;
  tenantId: string;
  title: string;
  status: TestStatus;
  tags: string[];
  difficulty?: TestDifficulty;
  subject?: string;
  description?: string;
  testType?: TestType;
  category?: CategoryRef;
  instructor?: InstructorRef;
  enrollmentFee?: Money;
  coverImage?: MediaRef;

  timeLimitMinutes?: number;
  languageSupport: boolean;
  language?: string;
  availableFrom?: string;
  availableTill?: string;
  instructions: 'none' | 'default' | 'custom';
  autoSubmitOnExpiry: boolean;
  shuffleQuestions: boolean;
  lockTabSwitching: boolean;

  questions: TestQuestionRef[];
  questionCount: number;

  grading: GradingConfig;
  settings: TestSettings;
  courseLink?: CourseLink;
  revision: number;
  publishedAt?: string;
  scheduleStatus: 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────────────────────

export interface CreateTestDto {
  title: string;
  testType?: TestType;
  coverImage?: MediaRef;
  category?: { categoryId: string };
  instructorId?: string;
  enrollmentFee?: Money;
  description?: string;
  tags?: string[];
  difficulty?: TestDifficulty;
  subject?: string;
  timeLimitMinutes?: number;
  grading?: Partial<GradingConfig>;
  languageSupport?: boolean;
  language?: string;
  availableFrom?: string;
  availableTill?: string;
  instructions?: 'none' | 'default' | 'custom';
  autoSubmitOnExpiry?: boolean;
  shuffleQuestions?: boolean;
  lockTabSwitching?: boolean;
}

export interface UpdateTestDto extends Partial<CreateTestDto> {}

export interface UpdateTestSettingsDto {
  proctoring?: Partial<ProctoringSettings>;
  violations?: Partial<ViolationSettings>;
  lockdown?: Partial<LockdownSettings>;
  monitoring?: Partial<MonitoringSettings>;
}

export interface LinkCourseDto {
  courseId: string;
  nodeId?: string;
}

export interface ImportQuestionItem {
  questionId: string;
  marks?: number;
}

export interface ImportQuestionsDto {
  items: ImportQuestionItem[];
  shuffleQuestions?: boolean;
}

export interface ReorderQuestionsDto {
  orderedQuestionIds: string[];
  expectedRevision: number;
}

export interface UpdatePlacementDto {
  marks?: number;
  negativeMarks?: number;
}

export interface MutationEffect {
  collection: 'tenant_tests' | 'tenant_questions' | 'tenant_course_nodes';
  op: 'CREATED' | 'UPDATED' | 'DELETED';
  id: string;
}

export interface BuilderMutationResult {
  test: Test;
  effects: MutationEffect[];
  skipped?: string[];
}

export interface TestFilters {
  search?: string;
  status?: TestStatus;
  difficulty?: TestDifficulty;
  testType?: TestType;
  categoryId?: string;
  linked?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PublishValidationError {
  field: string;
  message: string;
}

