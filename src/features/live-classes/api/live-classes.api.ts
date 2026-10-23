import api from '../../../shared/api/axios';
import { extractPaged, type PagedResponse, type ApiEnvelope } from '../../../shared/api/pagination';
import {
  CalendarView,
  type CalendarResponse,
  type ConflictsResponse,
  type CreateLiveClassPayload,
  type LiveClassDetails,
  type LiveClassListItem,
  type LiveClassPreviewResponse,
  type LiveClassStatsResponse,
  type UpdateLiveClassPayload,
  type UpdateScope,
} from '../types';

export interface ListLiveClassesParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  batchId?: string;
  instructorId?: string;
  status?: string;
  from?: string;
  to?: string;
  seriesId?: string;
  search?: string;
  sort?: 'asc' | 'desc';
}

export interface CalendarQueryParams {
  date: string;
  view?: CalendarView;
  timezone?: string;
  courseId?: string;
  batchId?: string;
  instructorId?: string;
  status?: string;
}

export interface StatsQueryParams {
  date?: string;
  timezone?: string;
  courseId?: string;
  batchId?: string;
  instructorId?: string;
}

export interface ConflictsQueryParams {
  from?: string;
  to?: string;
  courseId?: string;
  batchId?: string;
  instructorId?: string;
}

export async function listLiveClasses(
  params: ListLiveClassesParams = {},
): Promise<PagedResponse<LiveClassListItem>> {
  const response = await api.get<ApiEnvelope<LiveClassListItem[]>>('/live-classes', {
    params,
  });
  return extractPaged(response.data, {
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  });
}

export async function getLiveClass(id: string): Promise<LiveClassDetails> {
  const { data } = await api.get<ApiEnvelope<LiveClassDetails>>(`/live-classes/${id}`);
  return data.data;
}

export async function createLiveClass(
  payload: CreateLiveClassPayload,
): Promise<{ occurrences: LiveClassListItem[] }> {
  const { data } = await api.post<ApiEnvelope<{ occurrences: LiveClassListItem[] }>>(
    '/live-classes',
    payload,
  );
  return data.data;
}

export async function previewLiveClass(
  payload: CreateLiveClassPayload,
): Promise<LiveClassPreviewResponse> {
  const { data } = await api.post<ApiEnvelope<LiveClassPreviewResponse>>(
    '/live-classes/preview',
    payload,
  );
  return data.data;
}

export async function updateLiveClass(
  id: string,
  payload: UpdateLiveClassPayload,
): Promise<{ updated: number; items: LiveClassListItem[] }> {
  const { data } = await api.patch<ApiEnvelope<{ updated: number; items: LiveClassListItem[] }>>(
    `/live-classes/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteLiveClass(
  id: string,
  scope?: UpdateScope,
): Promise<{ deleted: number; skipped: number }> {
  const { data } = await api.delete<ApiEnvelope<{ deleted: number; skipped: number }>>(
    `/live-classes/${id}`,
    {
      params: scope ? { scope } : undefined,
    },
  );
  return data.data;
}

export async function getCalendar(
  params: CalendarQueryParams,
): Promise<CalendarResponse> {
  const { data } = await api.get<ApiEnvelope<CalendarResponse>>('/live-classes/calendar', {
    params,
  });
  return data.data;
}

export async function getStats(
  params: StatsQueryParams = {},
): Promise<LiveClassStatsResponse> {
  const { data } = await api.get<ApiEnvelope<LiveClassStatsResponse>>('/live-classes/stats', {
    params,
  });
  return data.data;
}

export async function getConflicts(
  params: ConflictsQueryParams = {},
): Promise<ConflictsResponse> {
  const { data } = await api.get<ApiEnvelope<ConflictsResponse>>('/live-classes/conflicts', {
    params,
  });
  return data.data;
}
