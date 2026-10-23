import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLiveClass,
  deleteLiveClass,
  getCalendar,
  getConflicts,
  getLiveClass,
  getStats,
  listLiveClasses,
  previewLiveClass,
  updateLiveClass,
  type CalendarQueryParams,
  type ConflictsQueryParams,
  type ListLiveClassesParams,
  type StatsQueryParams,
} from '../api/live-classes.api';
import type {
  CreateLiveClassPayload,
  UpdateLiveClassPayload,
  UpdateScope,
} from '../types';

export const liveClassKeys = {
  all: ['live-classes'] as const,
  lists: () => [...liveClassKeys.all, 'list'] as const,
  list: (filters: ListLiveClassesParams) =>
    [...liveClassKeys.lists(), filters] as const,
  calendars: () => [...liveClassKeys.all, 'calendar'] as const,
  calendar: (filters: CalendarQueryParams) =>
    [...liveClassKeys.calendars(), filters] as const,
  stats: (filters: StatsQueryParams) =>
    [...liveClassKeys.all, 'stats', filters] as const,
  conflicts: (filters: ConflictsQueryParams) =>
    [...liveClassKeys.all, 'conflicts', filters] as const,
  details: () => [...liveClassKeys.all, 'detail'] as const,
  detail: (id: string) => [...liveClassKeys.details(), id] as const,
};

export function useLiveClassesList(params: ListLiveClassesParams = {}) {
  return useQuery({
    queryKey: liveClassKeys.list(params),
    queryFn: () => listLiveClasses(params),
  });
}

export function useLiveClassCalendar(params: CalendarQueryParams) {
  return useQuery({
    queryKey: liveClassKeys.calendar(params),
    queryFn: () => getCalendar(params),
    enabled: Boolean(params.date),
  });
}

export function useLiveClassStats(params: StatsQueryParams = {}) {
  return useQuery({
    queryKey: liveClassKeys.stats(params),
    queryFn: () => getStats(params),
  });
}

export function useLiveClassConflicts(params: ConflictsQueryParams = {}) {
  return useQuery({
    queryKey: liveClassKeys.conflicts(params),
    queryFn: () => getConflicts(params),
  });
}

export function useLiveClassDetails(id: string | undefined) {
  return useQuery({
    queryKey: liveClassKeys.detail(id ?? ''),
    queryFn: () => getLiveClass(id!),
    enabled: Boolean(id),
  });
}

export function useCreateLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLiveClassPayload) => createLiveClass(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: liveClassKeys.all });
    },
  });
}

export function usePreviewLiveClass() {
  return useMutation({
    mutationFn: (payload: CreateLiveClassPayload) => previewLiveClass(payload),
  });
}

export function useUpdateLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLiveClassPayload;
    }) => updateLiveClass(id, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: liveClassKeys.all });
      void queryClient.invalidateQueries({
        queryKey: liveClassKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteLiveClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope?: UpdateScope }) =>
      deleteLiveClass(id, scope),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: liveClassKeys.all });
    },
  });
}
