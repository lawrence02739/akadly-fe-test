import api from '../../../shared/api/axios';
import type {
  Assignment,
  AssignmentListResponse,
  AssignmentStats,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from '../types';

const unwrap = async <T>(response: Promise<{ data: { data: T } }>): Promise<T> =>
  (await response).data.data;

export type AssignmentListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  courseId?: string;
  batchId?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
};

export const assignmentApi = {
  list: async (query: AssignmentListQuery = {}): Promise<AssignmentListResponse> => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const suffix = params.toString();
    const { data } = await api.get(`/assignments${suffix ? `?${suffix}` : ''}`);
    return {
      items: data.data || [],
      total: data.meta?.pagination?.total || 0,
      page: data.meta?.pagination?.page || 1,
      limit: data.meta?.pagination?.pageSize || 10,
      totalPages: data.meta?.pagination?.totalPages || 0,
    };
  },

  get: (id: string) => unwrap<Assignment>(api.get(`/assignments/${id}`)),

  stats: () => unwrap<AssignmentStats>(api.get('/assignments/stats')),

  create: (payload: CreateAssignmentDto) =>
    unwrap<Assignment>(api.post('/assignments', payload)),

  update: (id: string, payload: UpdateAssignmentDto) =>
    unwrap<Assignment>(api.patch(`/assignments/${id}`, payload)),

  delete: (id: string) => api.delete(`/assignments/${id}`).then(() => undefined),

  duplicate: (id: string) => unwrap<Assignment>(api.post(`/assignments/${id}/duplicate`)),

  publish: (id: string) => unwrap<Assignment>(api.post(`/assignments/${id}/status/publish`)),

  unpublish: (id: string) =>
    unwrap<Assignment>(api.post(`/assignments/${id}/status/unpublish`)),

  close: (id: string) => unwrap<Assignment>(api.post(`/assignments/${id}/status/close`)),

  archive: (id: string) => unwrap<Assignment>(api.post(`/assignments/${id}/status/archive`)),
};
