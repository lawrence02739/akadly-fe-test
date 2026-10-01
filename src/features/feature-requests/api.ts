import api from '../../shared/api/axios';
import { adminApi } from '../admin/api/admin.api';

export type FeatureStatus = 'submitted' | 'under_review' | 'planned' | 'in_progress' | 'released' | 'declined';
export type FeatureRequest = { id: string; title: string; description: string; category: string; status: FeatureStatus; plannedRelease: string | null; adminNote: string | null; upvoteCount: number; hasUpvoted: boolean; commentCount: number; comments: Array<{ id: string; body: string; authorType: 'tenant' | 'admin'; createdAt: string }>; createdAt: string; updatedAt: string };
type Envelope<T> = { data: T };
const unwrap = <T,>(response: { data: Envelope<T> }) => response.data.data;

export const featureRequestsApi = {
  list: async (params: Record<string, string | undefined> = {}) => unwrap(await api.get<Envelope<FeatureRequest[]>>('/feature-requests', { params })),
  categories: async () => unwrap(await api.get<Envelope<Array<{ slug: string; name: string }>>>('/feature-requests/categories')),
  get: async (id: string) => unwrap(await api.get<Envelope<FeatureRequest>>(`/feature-requests/${id}`)),
  create: async (payload: { title: string; description: string; category: string }) => unwrap(await api.post<Envelope<FeatureRequest>>('/feature-requests', payload)),
  vote: async (id: string) => unwrap(await api.post<Envelope<FeatureRequest>>(`/feature-requests/${id}/upvote`)),
  comment: async (id: string, body: string) => unwrap(await api.post<Envelope<FeatureRequest>>(`/feature-requests/${id}/comments`, { body })),
};

export const adminFeatureRequestsApi = {
  list: async (params: Record<string, string | undefined> = {}) => (adminApi as any).featureRequests(params) as Promise<FeatureRequest[]>,
  get: async (id: string) => (adminApi as any).featureRequest(id) as Promise<FeatureRequest>,
  update: async (id: string, payload: Partial<Pick<FeatureRequest, 'status' | 'category' | 'plannedRelease' | 'adminNote'>>) => (adminApi as any).updateFeatureRequest(id, payload) as Promise<FeatureRequest>,
  comment: async (id: string, body: string) => (adminApi as any).addFeatureRequestComment(id, body) as Promise<FeatureRequest>,
};
