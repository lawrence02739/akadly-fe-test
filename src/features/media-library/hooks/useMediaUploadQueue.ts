import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import {
  presignUpload,
  putFileToStorage,
  registerMediaAsset,
} from '../api/media-library.api';
import type {
  MediaAsset,
  MediaMetadata,
  MediaStatus,
  MediaUploadedBy,
} from '../types';
import { MAX_MEDIA_SIZE_BYTES } from '../constants';
import {
  extractMediaMetadataFromFile,
  resolveMediaTypeFromFileName,
} from '../utils/mediaFile';
import { getApiErrorMessage } from '../utils/apiError';
import { MEDIA_QUERY_KEYS } from './useMediaLibrary';

export type QueueItemStatus =
  | 'QUEUED'
  | 'EXTRACTING_METADATA'
  | 'PRESIGNING'
  | 'UPLOADING'
  | 'REGISTERING'
  | 'SUCCESS'
  | 'ERROR'
  | 'CANCELLED';

export interface UploadQueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
  progress: number;
  error?: string;
  asset?: MediaAsset;
  title: string;
  description?: string;
  categoryId?: string;
  subject?: string;
  topicTag?: string;
  tags: string[];
  statusFlag: MediaStatus;
  linkCourseId?: string;
  linkNodeId?: string;
}

export function useMediaUploadQueue() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Get current user from auth store
  const user = useSelector((state: RootState) => state.auth.user);

  const addFiles = useCallback(
    (files: File[], defaultLinkCourseId?: string, defaultLinkNodeId?: string) => {
      const newItems: UploadQueueItem[] = files.map((file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        return {
          id,
          file,
          status: 'QUEUED',
          progress: 0,
          title: cleanTitle,
          tags: [],
          statusFlag: 'ACTIVE',
          linkCourseId: defaultLinkCourseId,
          linkNodeId: defaultLinkNodeId,
        };
      });

      setQueue((prev) => [...prev, ...newItems]);
      return newItems;
    },
    [],
  );

  const updateItemConfig = useCallback(
    (id: string, patch: Partial<UploadQueueItem>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue((prev) =>
      prev.filter(
        (item) => item.status !== 'SUCCESS' && item.status !== 'CANCELLED',
      ),
    );
  }, []);

  const uploadSingleItem = useCallback(
    async (
      item: UploadQueueItem,
      uploader: MediaUploadedBy,
    ): Promise<MediaAsset | null> => {
      const type = resolveMediaTypeFromFileName(
        item.file.name,
        item.file.type,
      );
      if (!type) {
        throw new Error(
          `Unsupported file type for "${item.file.name}". Please upload a supported video, audio, image, or document.`,
        );
      }

      const maxSize = MAX_MEDIA_SIZE_BYTES[type];
      if (item.file.size > maxSize) {
        throw new Error(
          `File size exceeds maximum allowed for ${type.toLowerCase()} (${Math.round(maxSize / (1024 * 1024))} MB).`,
        );
      }

      // Step 1: Extract client metadata
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'EXTRACTING_METADATA', progress: 5 }
            : q,
        ),
      );
      let clientMeta: {
        durationSeconds?: number;
        width?: number;
        height?: number;
      } = {};
      try {
        clientMeta = await extractMediaMetadataFromFile(item.file);
      } catch {
        // non-blocking
      }

      // Step 2: Presign
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'PRESIGNING', progress: 15 } : q,
        ),
      );
      const presign = await presignUpload({
        fileName: item.file.name,
        contentType: item.file.type || 'application/octet-stream',
        mimeType: item.file.type || 'application/octet-stream',
        sizeBytes: item.file.size,
        courseId: item.linkCourseId,
        purpose: 'library',
      });

      // Step 3: Put to storage
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'UPLOADING', progress: 20 } : q,
        ),
      );
      await putFileToStorage(presign.uploadUrl, item.file, (pct) => {
        // Scale 20% -> 90%
        const mapped = Math.min(90, Math.round(20 + pct * 0.7));
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, progress: mapped } : q)),
        );
      });

      // Step 4: Register
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'REGISTERING', progress: 95 } : q,
        ),
      );

      const metadata: MediaMetadata = {
        durationSeconds: clientMeta.durationSeconds ?? null,
        width: clientMeta.width ?? null,
        height: clientMeta.height ?? null,
      };

      const asset = await registerMediaAsset({
        fileKey: presign.fileKey,
        fileUrl: presign.fileUrl,
        fileName: item.file.name,
        mimeType: item.file.type || 'application/octet-stream',
        sizeBytes: item.file.size,
        title: item.title.trim() || item.file.name,
        description: item.description?.trim() || null,
        categoryId: item.categoryId || null,
        subject: item.subject?.trim() || null,
        topicTag: item.topicTag?.trim() || null,
        tags: item.tags,
        status: item.statusFlag,
        linkCourseId: item.linkCourseId,
        linkNodeId: item.linkNodeId,
        metadata,
        uploadedBy: uploader,
      });

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'SUCCESS', progress: 100, asset }
            : q,
        ),
      );

      return asset;
    },
    [],
  );

  const startUpload = useCallback(async () => {
    const queuedItems = queue.filter(
      (i) => i.status === 'QUEUED' || i.status === 'ERROR',
    );
    if (queuedItems.length === 0) return [];

    setIsProcessing(true);
    const uploader: MediaUploadedBy = {
      id: user?.id ? String(user.id) : 'unknown',
      name: user?.name || 'User',
      email: user?.email || '',
    };

    const results: MediaAsset[] = [];

    for (const item of queuedItems) {
      try {
        const asset = await uploadSingleItem(item, uploader);
        if (asset) results.push(asset);
      } catch (err) {
        const errorMsg = getApiErrorMessage(err, 'Upload failed');
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'ERROR', error: errorMsg } : q,
          ),
        );
      }
    }

    setIsProcessing(false);
    queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.lists() });
    queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.tags() });

    return results;
  }, [queue, uploadSingleItem, user, queryClient]);

  return {
    queue,
    isProcessing,
    addFiles,
    updateItemConfig,
    removeItem,
    clearCompleted,
    startUpload,
    uploadSingleItem,
  };
}
