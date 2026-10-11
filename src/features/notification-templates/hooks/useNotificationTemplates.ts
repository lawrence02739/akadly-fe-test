import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/notification-templates.api';
import type { ListTemplatesParams, CreateTemplateRequest, UpdateTemplateRequest, DuplicateRequest, PublishRequest, DisableRequest } from '../types';

export const queryKeys = {
  all: ['notificationTemplates'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (params: ListTemplatesParams) => [...queryKeys.lists(), params] as const,
  summaries: () => [...queryKeys.all, 'summary'] as const,
  meta: () => [...queryKeys.all, 'meta'] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  history: (id: string) => [...queryKeys.detail(id), 'history'] as const,
  versions: (id: string) => [...queryKeys.detail(id), 'versions'] as const,
};

export const useTemplateMeta = () => {
  return useQuery({
    queryKey: queryKeys.meta(),
    queryFn: api.getTemplateMeta,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useTemplateSummary = () => {
  return useQuery({
    queryKey: queryKeys.summaries(),
    queryFn: api.getTemplateSummary,
  });
};

export const useTemplates = (params: ListTemplatesParams) => {
  return useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => api.listTemplates(params),
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => api.getTemplate(id),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateTemplateRequest) => api.createTemplate(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summaries() });
    },
  });
};

export const useUpdateTemplate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateTemplateRequest) => api.updateTemplate(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
};

export const useDuplicateTemplate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: DuplicateRequest) => api.duplicateTemplate(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summaries() });
    },
  });
};

export const useDisableTemplate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: DisableRequest) => api.disableTemplate(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summaries() });
    },
  });
};

export const useEnableTemplate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.enableTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summaries() });
    },
  });
};

export const useArchiveTemplate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.archiveTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summaries() });
    },
  });
};

export const usePublishTemplate = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (req: PublishRequest) => api.publishTemplate(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.summaries() });
    },
  });
};

export const useTemplateHistory = (id: string, params: { page: number; limit: number }) => {
  return useQuery({
    queryKey: [...queryKeys.history(id), params],
    queryFn: () => api.listHistory(id, params),
    enabled: !!id && id !== 'new',
  });
};
