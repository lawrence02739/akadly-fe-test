import api from '../../../shared/api/axios';

export interface ApiRole {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

export type ArchivedRole = Omit<ApiRole, 'memberCount'> & { archivedAt: string | null };

export interface PermissionItem {
  key: string;
  resource: string;
  action: string;
  group: string;
  label: string;
  description: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}

/** Backend wraps plain results as { data: T } */
const unwrap = <T>(response: { data: { data: T } }): T => response.data.data;

export const rolesApi = {
  list: async (): Promise<ApiRole[]> => {
    return unwrap<ApiRole[]>(await api.get('/roles'));
  },

  create: async (data: CreateRoleInput): Promise<ApiRole> => {
    return unwrap<ApiRole>(await api.post('/roles', data));
  },

  update: async (id: string, data: UpdateRoleInput): Promise<ApiRole> => {
    return unwrap<ApiRole>(await api.patch(`/roles/${id}`, data));
  },

  delete: async (id: string): Promise<{ archived: boolean }> => {
    return unwrap<{ archived: boolean }>(await api.delete(`/roles/${id}`));
  },

  listArchived: async (): Promise<ArchivedRole[]> => {
    return unwrap<ArchivedRole[]>(await api.get('/roles/archive'));
  },

  restoreArchived: async (ids: string[]): Promise<{ restored: number }> => {
    return unwrap<{ restored: number }>(await api.post('/roles/archive/restore', { ids }));
  },

  deleteArchivedPermanently: async (ids: string[]): Promise<{ deleted: number }> => {
    return unwrap<{ deleted: number }>(await api.post('/roles/archive/permanent-delete', { ids }));
  },

  listPermissions: async (): Promise<PermissionItem[]> => {
    return unwrap<PermissionItem[]>(await api.get('/permissions'));
  },
};
