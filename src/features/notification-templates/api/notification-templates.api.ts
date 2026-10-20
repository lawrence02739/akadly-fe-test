import api from '../../../shared/api/axios';
import type {
  TemplateListResponse,
  TemplateListRow,
  TemplateSummary,
  TemplateMeta,
  TemplateDetailResponse,
  ValidateResponse,
  PreviewRequest,
  PreviewResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  SaveDraftRequest,
  PublishRequest,
  DuplicateRequest,
  DisableRequest,
  ListTemplatesParams,
  ApiEnvelope,
} from '../types';

function unwrap<T>(body: T | ApiEnvelope<T>): T {
  return typeof body === 'object' && body !== null && 'data' in body ? (body as ApiEnvelope<T>).data : body as T;
}

const BASE_URL = '/notification-templates';

export const getTemplateMeta = async (): Promise<TemplateMeta> => {
  const { data } = await api.get<TemplateMeta | ApiEnvelope<TemplateMeta>>(`${BASE_URL}/meta`);
  return unwrap(data);
};

export const getTemplateSummary = async (): Promise<TemplateSummary> => {
  const { data } = await api.get<TemplateSummary | ApiEnvelope<TemplateSummary>>(`${BASE_URL}/summary`);
  return unwrap(data);
};

export const listTemplates = async (params: ListTemplatesParams): Promise<TemplateListResponse> => {
  const { data } = await api.get<any>(BASE_URL, { params });
  const items: TemplateListRow[] = Array.isArray(data.data) ? data.data : (data.data?.items ?? []);
  const pagination = data.pagination;
  return {
    items,
    pagination,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (params.page || 1),
    limit: pagination?.pageSize ?? pagination?.limit ?? (params.limit || 20),
  };
};

export const getTemplate = async (id: string): Promise<TemplateDetailResponse> => {
  const { data } = await api.get<TemplateDetailResponse | ApiEnvelope<TemplateDetailResponse>>(`${BASE_URL}/${id}`);
  return unwrap(data);
};

export const createTemplate = async (req: CreateTemplateRequest): Promise<{ id: string }> => {
  const { data } = await api.post<{ id: string } | ApiEnvelope<{ id: string }>>(BASE_URL, req);
  return unwrap(data);
};

export const updateTemplate = async (id: string, req: UpdateTemplateRequest): Promise<void> => {
  await api.patch(`${BASE_URL}/${id}`, req);
};

export const saveDraft = async (id: string, req: SaveDraftRequest): Promise<{ revision: number; checks: any[] }> => {
  const { data } = await api.put<{ revision: number; checks: any[] } | ApiEnvelope<{ revision: number; checks: any[] }>>(`${BASE_URL}/${id}/draft`, req);
  return unwrap(data);
};

export const discardDraft = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}/draft`);
};

export const validateTemplate = async (id: string): Promise<ValidateResponse> => {
  const { data } = await api.post<ValidateResponse | ApiEnvelope<ValidateResponse>>(`${BASE_URL}/${id}/validate`);
  return unwrap(data);
};

export const publishTemplate = async (id: string, req: PublishRequest): Promise<void> => {
  await api.post(`${BASE_URL}/${id}/publish`, req);
};

export const duplicateTemplate = async (id: string, req: DuplicateRequest): Promise<{ id: string }> => {
  const { data } = await api.post<{ id: string } | ApiEnvelope<{ id: string }>>(`${BASE_URL}/${id}/duplicate`, req);
  return unwrap(data);
};

export const disableTemplate = async (id: string, req: DisableRequest): Promise<void> => {
  await api.post(`${BASE_URL}/${id}/disable`, req);
};

export const enableTemplate = async (id: string): Promise<void> => {
  await api.post(`${BASE_URL}/${id}/enable`);
};

export const archiveTemplate = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${id}`);
};

export const listVersions = async (id: string): Promise<any[]> => {
  const { data } = await api.get<any[] | ApiEnvelope<any[]>>(`${BASE_URL}/${id}/versions`);
  return unwrap(data);
};

export const getVersion = async (id: string, versionId: string): Promise<any> => {
  const { data } = await api.get<any | ApiEnvelope<any>>(`${BASE_URL}/${id}/versions/${versionId}`);
  return unwrap(data);
};

export const listHistory = async (id: string, params: { page: number; limit: number }): Promise<any> => {
  const { data } = await api.get<any | ApiEnvelope<any>>(`${BASE_URL}/${id}/history`, { params });
  return unwrap(data);
};

export const previewTemplate = async (id: string, req: PreviewRequest): Promise<PreviewResponse> => {
  const { data } = await api.post<PreviewResponse | ApiEnvelope<PreviewResponse>>(`${BASE_URL}/${id}/preview`, req);
  return unwrap(data);
};

export const previewDraftInline = async (req: PreviewRequest): Promise<PreviewResponse> => {
  const { data } = await api.post<PreviewResponse | ApiEnvelope<PreviewResponse>>(`${BASE_URL}/preview`, req);
  return unwrap(data);
};
