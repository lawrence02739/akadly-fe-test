import api from '../../../shared/api/axios';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  items: T[];
  meta: PaginationMeta;
}

export interface AssignedRole {
  id: string;
  name: string;
}

export interface ApiUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  isOwner: boolean;
  type: 'user' | 'instructor';
  instructorId?: string;
  roleIds: string[];
  roleNames: string[];
  roles: AssignedRole[];
  effectivePermissions: string[];
  status: 'active' | 'invited' | 'suspended';
  joinedAt: string;
  invitationExpiresAt?: string | null;
  invitationExpired?: boolean;
  deliveryStatus?: 'sent' | 'failed';
  lastActiveAt?: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  roleIds?: string[];
  permissions?: string[];
}

export interface UpdateUserInput {
  name?: string;
  roleIds?: string[];
  permissions?: string[];
}

export interface ListUsersQuery {
  search?: string;
  roleId?: string;
  status?: 'active' | 'invited' | 'suspended';
  type?: 'user' | 'instructor';
  page?: number;
  limit?: number;
}

/** Backend wraps plain results as { data: T } */
const unwrap = <T>(response: { data: { data: T } }): T => response.data.data;

/** Backend wraps paginated results as { data: { data: T[], meta: {...} } } */
const unwrapPaginated = <T>(response: {
  data: { data: T[]; meta: PaginationMeta };
}): PaginatedResponse<T> => ({
  data: response.data.data,
  items: response.data.data,
  meta: response.data.meta,
});

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      q.set(key, String(value));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const usersApi = {
  create: async (data: CreateUserInput): Promise<ApiUser> => {
    return unwrap<ApiUser>(await api.post('/users', data));
  },

  list: async (query: ListUsersQuery = {}): Promise<PaginatedResponse<ApiUser>> => {
    return unwrapPaginated<ApiUser>(
      await api.get(`/users${buildQuery({ page: 1, limit: 10, ...query })}`),
    );
  },

  get: async (id: string): Promise<ApiUser> => {
    return unwrap<ApiUser>(await api.get(`/users/${id}`));
  },

  update: async (id: string, data: UpdateUserInput): Promise<ApiUser> => {
    return unwrap<ApiUser>(await api.patch(`/users/${id}`, data));
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  restore: async (id: string): Promise<ApiUser> => {
    return unwrap<ApiUser>(await api.post(`/users/${id}/restore`));
  },

  setStatus: async (id: string, status: 'active' | 'suspended'): Promise<ApiUser> => {
    return unwrap<ApiUser>(await api.patch(`/users/${id}/status`, { status }));
  },

  resendInvitation: async (id: string): Promise<ApiUser> => {
    return unwrap<ApiUser>(await api.post(`/users/${id}/resend-invitation`));
  },
};
