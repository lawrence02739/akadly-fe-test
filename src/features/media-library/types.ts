export const MEDIA_TYPES = ['VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_STATUSES = ['ACTIVE', 'ARCHIVED'] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export const PROCESSING_STATUSES = [
  'NONE',
  'PENDING',
  'COMPLETED',
  'FAILED',
] as const;
export type MediaProcessingStatus = (typeof PROCESSING_STATUSES)[number];

export const USAGE_TYPES = ['NODE_CONTENT', 'COURSE_THUMBNAIL'] as const;
export type MediaUsageType = (typeof USAGE_TYPES)[number];

export interface MediaCategoryRef {
  id: string;
  name: string;
  color?: string | null;
}

export interface MediaUploadedBy {
  id: string;
  name: string;
  email: string;
}

export interface MediaMetadata {
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  pageCount?: number | null;
  resolution?: string | null;
  frameRate?: number | null;
  audioCodec?: string | null;
  sampleRate?: number | null;
  channels?: number | null;
  bitRate?: number | null;
  colorSpace?: string | null;
  [key: string]: unknown;
}

export interface MediaProcessingInfo {
  status: MediaProcessingStatus;
  text?: string | null;
  requestedAt?: string | null;
  completedAt?: string | null;
  error?: string | null;
}

export interface MediaAsset {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  type: MediaType;
  status: MediaStatus;
  category: MediaCategoryRef | null;
  subject: string | null;
  topicTag: string | null;
  tags: string[];
  fileKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  metadata: MediaMetadata;
  extractedText: MediaProcessingInfo;
  transcript: MediaProcessingInfo;
  uploadedBy: MediaUploadedBy;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetWithUsage {
  asset: MediaAsset;
  usageCount: number;
}

export interface MediaLinkedNode {
  nodeId: string;
  nodeTitle: string;
  moduleTitle: string | null;
  usageType: MediaUsageType;
}

export interface MediaLinkedCourse {
  courseId: string;
  courseTitle: string;
  nodes: MediaLinkedNode[];
}

export interface MediaAssetDetail {
  asset: MediaAsset;
  usageCount: number;
  linkedCourses: MediaLinkedCourse[];
}

export interface ListMediaParams {
  page?: number;
  limit?: number;
  type?: MediaType;
  status?: MediaStatus;
  categoryId?: string;
  tag?: string;
  search?: string;
  linkedCourseId?: string;
  sortBy?: 'createdAt' | 'title' | 'sizeBytes';
  sortOrder?: 'asc' | 'desc';
}

export interface ListMediaResponse {
  items: MediaAssetWithUsage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PresignUploadRequest {
  fileName: string;
  contentType?: string;
  mimeType?: string;
  sizeBytes: number;
  courseId?: string;
  purpose?: 'library' | 'course-node' | 'course-thumbnail';
}

export interface PresignUploadResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresInSeconds: number;
}

export interface RegisterMediaRequest {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  title?: string;
  description?: string | null;
  categoryId?: string | null;
  subject?: string | null;
  topicTag?: string | null;
  tags?: string[];
  status?: MediaStatus;
  linkCourseId?: string;
  linkNodeId?: string;
  metadata?: MediaMetadata;
  uploadedBy: MediaUploadedBy;
}

export interface UpdateMediaRequest {
  title?: string;
  description?: string | null;
  categoryId?: string | null;
  subject?: string | null;
  topicTag?: string | null;
  tags?: string[];
  status?: MediaStatus;
  linkCourseId?: string | null;
  linkNodeId?: string | null;
}

export interface ReplaceMediaRequest {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  metadata?: MediaMetadata;
}
