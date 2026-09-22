import api from "../../../shared/api/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  meta: PaginationMeta;
}

export interface ApiRole {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

export interface AssignedRole {
  id: string;
  name: string;
}

export interface ApiMember {
  id: string;
  name: string;
  email: string;
  isOwner: boolean;
  roleIds: string[];
  roleNames: string[];
  roles: AssignedRole[];
  effectivePermissions: string[];
  status: "active" | "suspended" | "disabled";
  joinedAt: string;
  lastActiveAt: string | null;
}

export interface ApiInvitation {
  id: string;
  name: string;
  email: string;
  roleIds: string[];
  roleNames: string[];
  roles: AssignedRole[];
  effectivePermissions: string[];
  status: "pending" | "accepted" | "expired" | "revoked";
  deliveryStatus: "pending" | "sent" | "failed";
  createdAt: string;
  expiresAt: string;
}

export interface PermissionItem {
  key: string;
  resource: string;
  action: string;
  group: string;
  label: string;
  description: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface MembersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "active" | "suspended" | "disabled";
  roleId?: string;
}

export interface InvitationsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "pending" | "accepted" | "expired" | "revoked";
  roleId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Backend wraps paginated results as { data: T[], meta: {...} } */
const unwrapPaginated = <T>(response: {
  data: { data: T[]; meta: PaginationMeta };
}): PaginatedResponse<T> => ({
  data: response.data.data,
  meta: response.data.meta,
});

/** Backend wraps plain results as { data: T } */
const unwrap = <T>(response: { data: { data: T } }): T =>
  response.data.data;

function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== null) {
      q.set(key, String(value));
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const teamApi = {
  // Members (paginated)
  members: async (query: MembersQuery = {}): Promise<PaginatedResponse<ApiMember>> =>
    unwrapPaginated<ApiMember>(
      await api.get(`/users${buildQuery({ page: 1, pageSize: 20, ...query })}`),
    ),

  // Invitations (paginated)
  invitations: async (query: InvitationsQuery = {}): Promise<PaginatedResponse<ApiInvitation>> =>
    unwrapPaginated<ApiInvitation>(
      await api.get(`/users/invitations${buildQuery({ page: 1, pageSize: 20, ...query })}`),
    ),

  // Roles (non-paginated — typically small list)
  roles: async (): Promise<ApiRole[]> =>
    unwrap<ApiRole[]>(await api.get("/users/roles")),

  // All available permissions catalog
  permissions: async (): Promise<PermissionItem[]> =>
    unwrap<PermissionItem[]>(await api.get("/users/roles/permissions")),

  // Invite a new user
  invite: async (body: {
    name: string;
    email: string;
    roleIds: string[];
    permissions: string[];
  }): Promise<ApiInvitation> =>
    unwrap<ApiInvitation>(await api.post("/users/invitations", body)),

  // Resend an invitation (rotates token)
  resend: async (id: string): Promise<ApiInvitation> =>
    unwrap<ApiInvitation>(await api.post(`/users/invitations/${id}/resend`)),

  // Revoke a pending invitation
  revoke: async (id: string): Promise<ApiInvitation> =>
    unwrap<ApiInvitation>(await api.delete(`/users/invitations/${id}`)),

  // Create a new role
  createRole: async (body: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<ApiRole> =>
    unwrap<ApiRole>(await api.post("/users/roles", body)),

  // Update an existing role
  updateRole: async (
    id: string,
    body: { name: string; description: string; permissions: string[] },
  ): Promise<ApiRole> =>
    unwrap<ApiRole>(await api.patch(`/users/roles/${id}`, body)),

  // Delete a role
  deleteRole: async (id: string): Promise<{ deleted: true }> =>
    unwrap<{ deleted: true }>(await api.delete(`/users/roles/${id}`)),

  // Update a member's role + permissions
  updateMember: async (
    id: string,
    body: { roleIds: string[]; permissions: string[] },
  ): Promise<ApiMember> =>
    unwrap<ApiMember>(await api.patch(`/users/${id}`, body)),

  // Activate or suspend a member
  status: async (
    id: string,
    action: "activate" | "suspend",
  ): Promise<ApiMember> =>
    unwrap<ApiMember>(await api.post(`/users/${id}/${action}`)),

  // Preview invite token (public — no auth)
  previewInvite: async (token: string): Promise<ApiInvitation> =>
    unwrap<ApiInvitation>(
      await api.post("/users/invitations/preview", { token }),
    ),

  // Accept invitation and set password (public — no auth)
  acceptInvite: async (
    token: string,
    password: string,
  ): Promise<{ accepted: true }> =>
    unwrap<{ accepted: true }>(
      await api.post("/users/invitations/accept", { token, password }),
    ),
};
