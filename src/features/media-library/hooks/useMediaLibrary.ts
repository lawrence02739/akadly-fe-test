import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  bulkLinkMediaToCourse,
  deleteMediaAsset,
  getMediaAsset,
  getMediaDownloadUrl,
  listMediaAssets,
  listMediaTags,
  replaceMediaFile,
  requestTextExtraction,
  requestTranscript,
  unlinkMediaFromCourse,
  updateMediaAsset,
} from '../api/media-library.api';
import type {
  ListMediaParams,
  ReplaceMediaRequest,
  UpdateMediaRequest,
} from '../types';
import { getApiErrorMessage } from '../utils/apiError';

export const MEDIA_QUERY_KEYS = {
  all: ['media-assets'] as const,
  lists: () => [...MEDIA_QUERY_KEYS.all, 'list'] as const,
  list: (params: ListMediaParams) =>
    [...MEDIA_QUERY_KEYS.lists(), params] as const,
  details: () => [...MEDIA_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MEDIA_QUERY_KEYS.details(), id] as const,
  tags: () => [...MEDIA_QUERY_KEYS.all, 'tags'] as const,
};

export function useMediaAssets(params: ListMediaParams = {}) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.list(params),
    queryFn: () => listMediaAssets(params),
    placeholderData: (prev) => prev,
  });
}

export function useMediaAsset(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.detail(id || ''),
    queryFn: () => getMediaAsset(id!),
    enabled: Boolean(id) && enabled,
  });
}

export function useMediaTags() {
  return useQuery({
    queryKey: MEDIA_QUERY_KEYS.tags(),
    queryFn: listMediaTags,
    staleTime: 60_000,
  });
}

export function useUpdateMediaAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaRequest }) =>
      updateMediaAsset(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.detail(updated.id),
      });
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.tags() });
      toast.success('Media details updated successfully');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to update media'));
    },
  });
}

export function useDeleteMediaAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMediaAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.tags() });
      toast.success('Media asset deleted');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to delete media asset'));
    },
  });
}

export function useReplaceMediaFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReplaceMediaRequest }) =>
      replaceMediaFile(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.detail(updated.id),
      });
      toast.success('Media file replaced successfully');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to replace file'));
    },
  });
}

export function useBulkLinkMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assetIds,
      courseId,
    }: {
      assetIds: string[];
      courseId: string;
    }) => bulkLinkMediaToCourse(assetIds, courseId),
    onSuccess: (res, vars) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.lists() });
      vars.assetIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: MEDIA_QUERY_KEYS.detail(id),
        });
      });
      toast.success(`Linked ${res.linked} item(s) to course`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to link media to course'));
    },
  });
}

export function useUnlinkMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assetId,
      courseId,
    }: {
      assetId: string;
      courseId: string;
    }) => unlinkMediaFromCourse(assetId, courseId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.detail(vars.assetId),
      });
      toast.success('Unlinked from course');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to unlink from course'));
    },
  });
}

export function useRequestExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => requestTextExtraction(assetId),
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.detail(assetId),
      });
      toast.success('Text extraction requested');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to request text extraction'));
    },
  });
}

export function useRequestTranscript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => requestTranscript(assetId),
    onSuccess: (_, assetId) => {
      queryClient.invalidateQueries({
        queryKey: MEDIA_QUERY_KEYS.detail(assetId),
      });
      toast.success('Transcript generation requested');
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, 'Failed to request transcript generation'),
      );
    },
  });
}

export function useDownloadMediaUrl() {
  return useMutation({
    mutationFn: (id: string) => getMediaDownloadUrl(id),
    onSuccess: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'Failed to get download URL'));
    },
  });
}
