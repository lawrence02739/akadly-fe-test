// ─── Question / Block Types ──────────────────────────────────────────────────

export type QuestionType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'NUMBER'
  | 'URL'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'DROPDOWN'
  | 'FILE_UPLOAD'
  | 'IMAGE_UPLOAD'
  | 'VIDEO_UPLOAD'
  | 'AUDIO_UPLOAD'
  | 'DATE'
  | 'TIME'
  | 'DATE_TIME'
  | 'RATING'
  | 'LINEAR_SCALE'
  | 'GRID_MCQ'
  | 'GRID_CHECKBOX'
  | 'SIGNATURE';

export type BlockType =
  | 'QUESTION'
  | 'TITLE_DESCRIPTION'
  | 'IMAGE'
  | 'VIDEO'
  | 'SECTION_BREAK';

// ─── Answer value (mirrors backend FormAnswerValue) ─────────────────────────

export interface FileAnswerValue {
  fileKey: string;
  name: string;
  size: number;
  contentType: string;
}

export type FormAnswerValue =
  | string
  | number
  | string[]
  | FileAnswerValue[]
  | null;

// ─── Editor sub-types ────────────────────────────────────────────────────────

export interface FormOption {
  id: string;
  label: string;
  isOther?: boolean;
  goToSectionId?: string | null;
}

export type LogicOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'EMPTY'
  | 'NOT_EMPTY';

export type LogicAction =
  | 'SHOW_QUESTION'
  | 'HIDE_QUESTION'
  | 'GO_TO_SECTION'
  | 'SKIP_SECTION'
  | 'END_FORM';

export interface LogicRule {
  id: string;
  targetId: string;
  action: LogicAction;
  conditions: {
    questionId: string;
    operator: LogicOperator;
    value?: string | string[];
  }[];
  conditionOperator: 'AND' | 'OR';
}

export interface QuestionSettings {
  required?: boolean;
  shuffleOptions?: boolean;
  readOnly?: boolean;
  /** Use FormAnswerValue instead of any */
  defaultValue?: FormAnswerValue;
  placeholder?: string;
  logicEnabled?: boolean;
  allowSpecificFileTypes?: boolean;
  allowedFileTypes?: string[];
  maxFiles?: number;
  maxFileSizeMB?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

export interface QuestionValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface FormBlock {
  id: string;
  type: BlockType;
  questionType?: QuestionType;
  title: string;
  description?: string;
  options?: FormOption[];
  rows?: FormOption[];
  columns?: FormOption[];
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string };
  rating?: { maxStars: number; icon: 'STAR' | 'HEART' | 'THUMBS_UP' };
  validation?: QuestionValidation;
  settings?: QuestionSettings;
  logicRules?: LogicRule[];
  /** Signed public URL (refreshed by the API) */
  mediaUrl?: string;
  /** Private S3 key used to refresh signed URLs */
  mediaKey?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
  labelAlignment?: 'TOP' | 'LEFT' | 'RIGHT' | 'CENTER';
  subLabel?: string;
  isHidden?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  blocks: FormBlock[];
  goToSectionId?: string | 'SUBMIT' | 'NEXT';
  isRepeatable?: boolean;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  headerImageUrl?: string;
  formWidth?: 'NARROW' | 'DEFAULT' | 'WIDE';
  customCss?: string;
}

export interface FormSettings {
  isPublic: boolean;
  collectEmail: boolean;
  limitOneResponse: boolean;
  allowEditing: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  confirmationMessage: string;
  acceptResponses: boolean;
  /** Write-only draft kept in local UI state; never in API read responses */
  requirePassword?: boolean;
  expiryDate?: string;
  redirectUrl?: string;
  notifyAdminOnSubmit?: boolean;
  sendCopySubmitter?: boolean;
  allowPartialSave?: boolean;
  enableSpamProtection?: boolean;
  maxResponses?: number;
}

// ─── API response shapes ──────────────────────────────────────────────────────

/**
 * What the API returns for GET /form-builder/forms/:id and POST/PUT.
 * NOTE: `settings.password` / `passwordHash` are NEVER in this type —
 * they are write-only on the server. Store any draft password separately.
 */
export interface FormSnapshot {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  /** The versioned schema returned from the API */
  schema: { sections: FormSection[] };
  settings: FormSettings;
  theme: FormTheme;
  stats: { responseCount: number };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  /** Present on public form responses */
  isPasswordProtected?: boolean;
}

/** Submit request shape sent to POST /form-builder/forms/:id/submissions */
export interface SubmitAnswerPayload {
  blockId: string;
  value: FormAnswerValue;
}

export interface SubmitFormPayload {
  answers: SubmitAnswerPayload[];
  respondentEmail?: string;
  password?: string;
  metadata?: Record<string, string | number | boolean>;
}

// ─── Store internal state ────────────────────────────────────────────────────

export interface FormState {
  formId: string | null;
  title: string;
  description: string;
  theme: FormTheme;
  settings: FormSettings;
  sections: FormSection[];

  /** Draft password — write-only UI state, never read from API */
  passwordDraft: string;

  // UI State
  activeBlockId: string | null;
  activeSectionId: string | null;
  isSaving: boolean;
  lastSavedAt: Date | null;
}
