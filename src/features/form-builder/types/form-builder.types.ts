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

export type BlockType = 'QUESTION' | 'TITLE_DESCRIPTION' | 'IMAGE' | 'VIDEO' | 'SECTION_BREAK';

export interface FormOption {
  id: string;
  label: string;
  isOther?: boolean;
  goToSectionId?: string | null;
}

export type LogicOperator = 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'EMPTY' | 'NOT_EMPTY';
export type LogicAction = 'SHOW_QUESTION' | 'HIDE_QUESTION' | 'GO_TO_SECTION' | 'SKIP_SECTION' | 'END_FORM';

export interface LogicRule {
  id: string;
  targetId: string; // The ID of the block or section this rule applies to
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
  defaultValue?: any;
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
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMessage?: string;
}

export interface FormBlock {
  id: string;
  type: BlockType; // QUESTION, IMAGE, TEXT, VIDEO
  questionType?: QuestionType; // MULTIPLE_CHOICE, SHORT_TEXT, etc.
  title: string;
  description?: string;
  options?: FormOption[];
  rows?: FormOption[]; // For Grid rows
  columns?: FormOption[]; // For Grid columns
  scale?: { min: number; max: number; minLabel?: string; maxLabel?: string }; // For Linear Scale
  rating?: { maxStars: number; icon: 'STAR' | 'HEART' | 'THUMBS_UP' }; // For Rating
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customErrorMessage?: string;
  };
  settings?: QuestionSettings;
  logicRules?: LogicRule[];
  mediaUrl?: string; // For images/videos
  mediaKey?: string; // Private object-storage key used to refresh signed URLs
  width?: 'full' | 'half' | 'third' | 'quarter'; // Grid layout width
  labelAlignment?: 'TOP' | 'LEFT' | 'RIGHT' | 'CENTER';
  subLabel?: string;
  isHidden?: boolean;
  // Additional configurations can go here
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  blocks: FormBlock[];
  goToSectionId?: string | 'SUBMIT' | 'NEXT'; // Where to go after this section
  isRepeatable?: boolean; // For repeatable groups (Wizard/Sections)
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
  password?: string;
  requirePassword?: boolean;
  expiryDate?: string;

  // Advanced Settings
  redirectUrl?: string;
  notifyAdminOnSubmit?: boolean;
  sendCopySubmitter?: boolean;
  allowPartialSave?: boolean;
  enableSpamProtection?: boolean;
  maxResponses?: number;
}

export interface FormState {
  formId: string | null;
  title: string;
  description: string;
  theme: FormTheme;
  settings: FormSettings;
  sections: FormSection[];

  // UI State
  activeBlockId: string | null;
  activeSectionId: string | null;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

export interface FormSnapshot {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  schemaJson: { sections: FormSection[] } | FormSection[];
  settingsJson: FormSettings;
  themeJson: FormTheme;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}
