export const TemplateType = {
  SYSTEM: 'SYSTEM',
  CUSTOM: 'CUSTOM',
} as const;
export type TemplateType = (typeof TemplateType)[keyof typeof TemplateType];

export const TemplateState = {
  DRAFT: 'DRAFT',
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type TemplateState = (typeof TemplateState)[keyof typeof TemplateState];

export const TemplateVersionStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SUPERSEDED: 'SUPERSEDED',
} as const;
export type TemplateVersionStatus = (typeof TemplateVersionStatus)[keyof typeof TemplateVersionStatus];

export const TemplateChannel = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  WHATSAPP: 'WHATSAPP',
  PUSH: 'PUSH',
} as const;
export type TemplateChannel = (typeof TemplateChannel)[keyof typeof TemplateChannel];

export const TemplateTriggerType = {
  NONE: 'NONE',
  EVENT: 'EVENT',
  SCHEDULE_OFFSET: 'SCHEDULE_OFFSET',
  INACTIVITY: 'INACTIVITY',
} as const;
export type TemplateTriggerType = (typeof TemplateTriggerType)[keyof typeof TemplateTriggerType];

export const SendFrequency = {
  ONCE_PER_LEARNER_AND_COURSE: 'ONCE_PER_LEARNER_AND_COURSE',
  EVERY_OCCURRENCE: 'EVERY_OCCURRENCE',
} as const;
export type SendFrequency = (typeof SendFrequency)[keyof typeof SendFrequency];

export const FallbackStrategy = {
  NONE: 'NONE',
  USE_VALUE: 'USE_VALUE',
  SUPPRESS_SENTENCE: 'SUPPRESS_SENTENCE',
} as const;
export type FallbackStrategy = (typeof FallbackStrategy)[keyof typeof FallbackStrategy];

export const VariableType = {
  TEXT: 'TEXT',
  DATE: 'DATE',
  TIME: 'TIME',
  URL: 'URL',
  EMAIL: 'EMAIL',
} as const;
export type VariableType = (typeof VariableType)[keyof typeof VariableType];

export const RecipientRule = {
  ENROLLMENT_REMAINS_CONFIRMED: 'ENROLLMENT_REMAINS_CONFIRMED',
  COURSE_ACCESS_ACTIVE: 'COURSE_ACCESS_ACTIVE',
  SUPPRESS_DUPLICATES: 'SUPPRESS_DUPLICATES',
  USE_PREFERRED_CHANNEL: 'USE_PREFERRED_CHANNEL',
  HONOR_OPT_OUTS: 'HONOR_OPT_OUTS',
  SUPPRESS_WHEN_NO_VALID_CHANNEL: 'SUPPRESS_WHEN_NO_VALID_CHANNEL',
} as const;
export type RecipientRule = (typeof RecipientRule)[keyof typeof RecipientRule];

export const CheckSeverity = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
} as const;
export type CheckSeverity = (typeof CheckSeverity)[keyof typeof CheckSeverity];

export const PublishCheckKey = {
  VARIABLES_RESOLVE: 'VARIABLES_RESOLVE',
  CHANNELS_VALID: 'CHANNELS_VALID',
  CTA_APPROVED: 'CTA_APPROVED',
  TRIGGER_AND_RULES: 'TRIGGER_AND_RULES',
  AT_LEAST_ONE_CHANNEL: 'AT_LEAST_ONE_CHANNEL',
  DEFAULT_LANGUAGE_PRESENT: 'DEFAULT_LANGUAGE_PRESENT',
} as const;
export type PublishCheckKey = (typeof PublishCheckKey)[keyof typeof PublishCheckKey];

export const TemplateHistoryAction = {
  CREATED: 'CREATED',
  DRAFT_SAVED: 'DRAFT_SAVED',
  DRAFT_DISCARDED: 'DRAFT_DISCARDED',
  PUBLISHED: 'PUBLISHED',
  METADATA_UPDATED: 'METADATA_UPDATED',
  TRIGGER_UPDATED: 'TRIGGER_UPDATED',
  CHANNEL_ADDED: 'CHANNEL_ADDED',
  CHANNEL_REMOVED: 'CHANNEL_REMOVED',
  FALLBACK_UPDATED: 'FALLBACK_UPDATED',
  DISABLED: 'DISABLED',
  ENABLED: 'ENABLED',
  DUPLICATED: 'DUPLICATED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type TemplateHistoryAction = (typeof TemplateHistoryAction)[keyof typeof TemplateHistoryAction];

export const VersionBump = {
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
} as const;
export type VersionBump = (typeof VersionBump)[keyof typeof VersionBump];

export interface VersionLabel {
  major: number;
  minor: number;
}

export interface TemplateTrigger {
  type: TemplateTriggerType;
  eventKey?: string;
  offsetMinutes?: number;
  delaySeconds?: number;
  cancelIfReversedWithinSeconds?: number;
  sendFrequency?: SendFrequency;
  audienceLabel?: string;
}

export interface TemplateRecipientRules {
  rules: RecipientRule[];
  deliveryOrder: TemplateChannel[];
  stopAfterFirstDelivery: boolean;
}

export interface TemplateVariable {
  key: string;
  label?: string;
  type: VariableType;
  required: boolean;
  fallback: {
    strategy: FallbackStrategy;
    value?: string;
  };
  sampleValue?: string;
}

export interface EmailVariant {
  enabled: boolean;
  subject: string;
  preheader?: string;
  bodyHtml: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface SmsVariant {
  enabled: boolean;
  body: string;
  dltTemplateId?: string;
}

export interface WhatsappVariant {
  enabled: boolean;
  body: string;
  providerTemplateName?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface PushVariant {
  enabled: boolean;
  title: string;
  body: string;
  deepLink?: string;
}

export interface TemplateLanguageContent {
  language: string;
  isDefault: boolean;
  fallbackLanguage?: string;
  email?: EmailVariant;
  sms?: SmsVariant;
  whatsapp?: WhatsappVariant;
  push?: PushVariant;
}

export interface TemplateListRow {
  id: string;
  code: string;
  name: string;
  type: TemplateType;
  state: TemplateState;
  hasDraft: boolean;
  currentVersionLabel: string | null;
  draftVersionLabel: string | null;
  enabledChannels: TemplateChannel[];
  triggerType: TemplateTriggerType;
  triggerEventKey?: string;
  updatedAt: string;
}

import type { PaginationMeta } from '../../shared/api/pagination';

export interface TemplateListResponse {
  items: TemplateListRow[];
  total: number;
  page: number;
  limit: number;
  pagination?: PaginationMeta;
}

export interface TemplateSummary {
  total: number;
  enabled: number;
  drafts: number;
  archived: number;
  disabled: number;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  nameKey: string;
  description?: string;
  type: TemplateType;
  state: TemplateState;
  isTransactional: boolean;
  trigger: TemplateTrigger;
  recipientRules: TemplateRecipientRules;
  defaultLanguage?: string;
  enabledChannels: TemplateChannel[];
  currentVersionId: string | null;
  draftVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  major: number;
  minor: number;
  status: TemplateVersionStatus;
  revision: number;
  languages: TemplateLanguageContent[];
  variables: TemplateVariable[];
  releaseNote?: string;
  basedOnVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersionSummary {
  id: string;
  major: number;
  minor: number;
  status: TemplateVersionStatus;
  createdAt: string;
}

export interface TemplateDetailResponse {
  template: NotificationTemplate;
  currentVersion: TemplateVersion | null;
  draftVersion: TemplateVersion | null;
}

export interface PublishCheckResult {
  key: PublishCheckKey;
  severity: CheckSeverity;
  passed: boolean;
  messages: string[];
  channel?: TemplateChannel;
  language?: string;
}

export interface ValidateResponse {
  canPublish: boolean;
  checks: PublishCheckResult[];
}

export interface PreviewRequest {
  language: string;
  channel: TemplateChannel;
  content: TemplateLanguageContent;
  variables: TemplateVariable[];
  learnerId?: string;
}

export interface PreviewResponse {
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  unresolved: string[];
  characterCount: number;
}

export interface TemplateHistoryItem {
  id: string;
  action: TemplateHistoryAction;
  summary: string;
  versionLabel?: string;
  actorName: string;
  at: string;
}

export interface TemplateMeta {
  events: { key: string; label: string }[];
  variables: { eventKey: string; variables: TemplateVariable[] }[];
  limits: {
    emailSubject: number;
    smsSegment: number;
    whatsappMax: number;
    pushTitle: number;
    pushBody: number;
  };
  recipientRuleLabels: Record<RecipientRule, string>;
  languages: string[];
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  isTransactional?: boolean;
  trigger?: TemplateTrigger;
  recipientRules?: TemplateRecipientRules;
  languages?: TemplateLanguageContent[];
  variables?: TemplateVariable[];
}

export interface SaveDraftRequest {
  languages: TemplateLanguageContent[];
  variables: TemplateVariable[];
  releaseNote?: string;
  expectedRevision?: number;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  isTransactional?: boolean;
  defaultLanguage?: string;
  state?: TemplateState;
  enabledChannels?: TemplateChannel[];
  trigger?: TemplateTrigger;
  recipientRules?: TemplateRecipientRules;
  languages?: TemplateLanguageContent[];
  variables?: TemplateVariable[];
}

export interface PublishRequest {
  bump?: VersionBump;
  releaseNote?: string;
  acknowledgedImpact: boolean;
}

export interface DisableRequest {
  reason: string;
  acknowledged: true;
}

export interface DuplicateRequest {
  name?: string;
  source?: string;
}

export interface ListTemplatesParams {
  page: number;
  limit: number;
  q?: string;
  type?: TemplateType;
  state?: TemplateState;
}

export interface ApiEnvelope<T> {
  data: T;
}
