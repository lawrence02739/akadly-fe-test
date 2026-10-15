import type { MediaType } from './types';

export const MAX_MEDIA_SIZE_BYTES: Record<MediaType, number> = {
  VIDEO: 2 * 1024 * 1024 * 1024, // 2 GB
  AUDIO: 500 * 1024 * 1024, // 500 MB
  DOCUMENT: 100 * 1024 * 1024, // 100 MB
  IMAGE: 25 * 1024 * 1024, // 25 MB
};

export const MEDIA_EXTENSIONS: Record<MediaType, string[]> = {
  VIDEO: ['mp4', 'webm', 'ogg', 'mov', 'mkv'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'],
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
};

export const MEDIA_ACCEPT_STRING: Record<MediaType, string> = {
  VIDEO: 'video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska',
  AUDIO: 'audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/flac',
  DOCUMENT: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,application/pdf',
  IMAGE: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
};

export const ALL_MEDIA_ACCEPT_STRING =
  'video/*,audio/*,image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv';

export const NODE_TYPE_TO_MEDIA_TYPES: Record<string, MediaType[]> = {
  VIDEO: ['VIDEO'],
  AUDIO: ['AUDIO'],
  PDF: ['DOCUMENT'],
  FILE: ['VIDEO', 'AUDIO', 'DOCUMENT', 'IMAGE'],
};

export const PAGE_SIZE = 12;
