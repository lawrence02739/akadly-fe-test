import axios from 'axios';
import { API_BASE_URL } from '../../../shared/api/config';

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  isSuperAdmin: boolean;
  permissions: string[];
  roleIds: string[];
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  plan: string;
  owner: { name: string; email: string };
  ownerUserId: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Tokens { accessToken: string; refreshToken: string; expiresIn: number }
interface Envelope<T> { data: T; message: string; meta?: { pagination?: Pagination } }
export interface Pagination { page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }
export interface TenantQuery { page: number; pageSize: number; search?: string; status?: string; sortBy?: string; sortOrder?: string }
export interface TenantPayload { name: string; slug: string; plan?: string; owner: { name: string; email: string }; settings?: Record<string, unknown> }
export interface TenantUpdate { name?: string; ownerName?: string; plan?: string; settings?: Record<string, unknown> }
export interface AdminSubscription {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: 'INR' | 'USD';
  interval: 'monthly' | 'yearly';
  status: 'active' | 'inactive';
  features: string[];
  createdAt: string;
  updatedAt: string;
}
export type SubscriptionPayload = Omit<AdminSubscription, 'id' | 'createdAt' | 'updatedAt'>;
export interface SubscriptionQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: AdminSubscription['status'];
  interval?: AdminSubscription['interval'];
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'price';
  sortOrder?: 'asc' | 'desc';
}
export interface AdminAccessRole { id: string; name: string; description: string; permissions: string[]; isSystem: boolean; createdAt: string; updatedAt: string }
export interface AdminTeamMember { id: string; userId: string; email: string; displayName: string; roleIds: string[]; permissions: string[] | null; status: 'invited' | 'accepted' | 'active' | 'suspended' | 'disabled'; invitationDeliveryStatus: 'pending' | 'sent' | 'failed' | null; invitationExpiresAt: string | null; invitationAcceptedAt: string | null; createdAt: string }
export type AdminInvitation = AdminTeamMember;
export interface AdminTeamInvitationPreview { name: string; email: string; expiresAt: string | null }
export interface TeamManagementQuery { page: number; pageSize: number; search?: string; status?: string; teamId?: string; roleId?: string }
const withId = <T>(item: T): T => {
  if (typeof item !== 'object' || item === null) return item;
  const record = item as T & { id?: string; _id?: { toString(): string } | string };
  return record.id || !record._id
    ? item
    : { ...record, id: String(record._id) } as T;
};
const pageResult = <T>(data: Envelope<T[]>, params: { page: number; pageSize: number }) => ({ items: data.data.map(withId), pagination: data.meta?.pagination ?? { page: params.page, pageSize: params.pageSize, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } });

const TOKEN_KEY = 'akadly_admin_session';
let tokens: Tokens | null = null;
try {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  tokens = stored ? JSON.parse(stored) as Tokens : null;
} catch {
  sessionStorage.removeItem(TOKEN_KEY);
}

export const hasAdminSession = () => Boolean(tokens?.refreshToken);
export const clearAdminSession = () => {
  tokens = null;
  sessionStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event('admin-session-ended'));
};
const saveTokens = (next: Tokens) => {
  tokens = next;
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next));
};

const baseURL = `${API_BASE_URL.replace(/\/v1$/, '')}/admin`;
const client = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });
let refreshing: Promise<void> | null = null;
client.interceptors.request.use((config) => {
  if (tokens?.accessToken) config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return config;
});
client.interceptors.response.use(undefined, async (error) => {
  const original = error.config;
  if (error.response?.status !== 401 || !original || original._retried || !tokens?.refreshToken || /\/auth\/(login|refresh)/.test(original.url || '')) {
    return Promise.reject(error);
  }
  original._retried = true;
  try {
    refreshing ??= axios.post<Envelope<Tokens>>(`${baseURL}/auth/refresh`, { refreshToken: tokens.refreshToken })
      .then(({ data }) => { saveTokens(data.data); })
      .finally(() => { refreshing = null; });
    await refreshing;
    original.headers.Authorization = `Bearer ${tokens?.accessToken}`;
    return client(original);
  } catch (refreshError) {
    clearAdminSession();
    return Promise.reject(refreshError);
  }
});

export const adminApi = {
  async login(email: string, password: string) {
    const { data } = await client.post<Envelope<Tokens>>('/auth/login', { email, password });
    saveTokens(data.data);
  },
  async profile() {
    const { data } = await client.get<Envelope<AdminProfile>>('/auth/me');
    return data.data;
  },
  async logout() {
    const refreshToken = tokens?.refreshToken;
    try { if (refreshToken) await client.post('/auth/logout', { refreshToken }); }
    finally { clearAdminSession(); }
  },
  async tenants(params: TenantQuery) {
    const { data } = await client.get<Envelope<AdminTenant[]>>('/tenants', { params });
    return { items: data.data, pagination: data.meta?.pagination ?? { page: params.page, pageSize: params.pageSize, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
  },
  async tenant(id: string) {
    const { data } = await client.get<Envelope<AdminTenant>>(`/tenants/${encodeURIComponent(id)}`);
    return data.data;
  },
  async createTenant(payload: TenantPayload) {
    const { data } = await client.post<Envelope<AdminTenant>>('/tenants', payload);
    return data.data;
  },
  async updateTenant(id: string, payload: TenantUpdate) {
    const { data } = await client.patch<Envelope<AdminTenant>>(`/tenants/${encodeURIComponent(id)}`, payload);
    return data.data;
  },
  async setTenantStatus(id: string, action: 'activate' | 'suspend') {
    const { data } = await client.post<Envelope<AdminTenant>>(`/tenants/${encodeURIComponent(id)}/${action}`);
    return data.data;
  },
  async subscriptions(params: SubscriptionQuery) {
    const { data } = await client.get<Envelope<AdminSubscription[]>>('/subscriptions', { params });
    return { items: data.data, pagination: data.meta?.pagination ?? { page: params.page, pageSize: params.pageSize, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
  },
  async subscription(id: string) {
    const { data } = await client.get<Envelope<AdminSubscription>>(`/subscriptions/${encodeURIComponent(id)}`);
    return data.data;
  },
  async createSubscription(payload: SubscriptionPayload) {
    const { data } = await client.post<Envelope<AdminSubscription>>('/subscriptions', payload);
    return data.data;
  },
  async updateSubscription(id: string, payload: SubscriptionPayload) {
    const { data } = await client.patch<Envelope<AdminSubscription>>(`/subscriptions/${encodeURIComponent(id)}`, payload);
    return data.data;
  },
  async deleteSubscription(id: string) {
    await client.delete(`/subscriptions/${encodeURIComponent(id)}`);
  },
  async teamPermissions() { const { data } = await client.get<Envelope<{ permissions: unknown[]; all: string[] }>>('/team-management/permissions'); return data.data; },
  async accessRoles(params: TeamManagementQuery) { const { data } = await client.get<Envelope<AdminAccessRole[]>>('/team-management/roles', { params }); return pageResult(data, params); },
  async accessRole(id: string) { const { data } = await client.get<Envelope<AdminAccessRole>>(`/team-management/roles/${id}`); return data.data; },
  async createAccessRole(payload: { name: string; description?: string; permissions: string[] }) { const { data } = await client.post<Envelope<AdminAccessRole>>('/team-management/roles', payload); return data.data; },
  async updateAccessRole(id: string, payload: { name?: string; description?: string; permissions?: string[] }) { const { data } = await client.patch<Envelope<AdminAccessRole>>(`/team-management/roles/${id}`, payload); return data.data; },
  async deleteAccessRole(id: string) { await client.delete(`/team-management/roles/${id}`); },
  async teamMembers(params: TeamManagementQuery) { const { data } = await client.get<Envelope<AdminTeamMember[]>>('/team-management/members', { params }); return pageResult(data, params); },
  async teamMember(id: string) { const { data } = await client.get<Envelope<AdminTeamMember>>(`/team-management/members/${id}`); return data.data; },
  async updateTeamMember(id: string, payload: Partial<{ roleIds: string[]; status: 'active' | 'suspended' | 'disabled' }>) { const { data } = await client.patch<Envelope<AdminTeamMember>>(`/team-management/members/${id}`, payload); return data.data; },
  async deleteTeamMember(id: string) { await client.delete(`/team-management/members/${id}`); },
  async invitations(params: TeamManagementQuery) { const { data } = await client.get<Envelope<AdminInvitation[]>>('/team-management/invitations', { params }); return pageResult(data, params); },
  async createInvitation(payload: { name: string; email: string; roleIds: string[]; permissions: string[] }) { const { data } = await client.post<Envelope<AdminInvitation>>('/team-management/invitations', payload); return data.data; },
  async resendInvitation(id: string) { const { data } = await client.post<Envelope<AdminInvitation>>(`/team-management/invitations/${id}/resend`); return data.data; },
  async revokeInvitation(id: string) { await client.delete(`/team-management/invitations/${id}`); },
  async previewTeamInvitation(token: string) { const { data } = await client.post<Envelope<AdminTeamInvitationPreview>>('/team-management/invitations/preview', { token }); return data.data; },
  async acceptTeamInvitation(token: string, password: string) { const { data } = await client.post<Envelope<{ accepted: boolean }>>('/team-management/invitations/accept', { token, password }); return data.data; },
};

export const adminError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const details: unknown = error.response?.data?.error?.details;
    if (Array.isArray(details)) {
      const messages = details.map((detail) => detail && typeof detail.message === 'string' ? detail.message : null).filter((message): message is string => Boolean(message));
      if (messages.length) return messages.join(' ');
    }
    const message = error.response?.data?.message;
    return Array.isArray(message) ? message.join(', ') : typeof message === 'string' ? message : 'Request failed. Please try again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
};
