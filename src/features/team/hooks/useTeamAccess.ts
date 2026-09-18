import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamApi, type MembersQuery, type InvitationsQuery } from "../api/team.api";

// ─── Query Keys ───────────────────────────────────────────────────────────────

const keys = {
  all: ["team-access"] as const,
  members: (q: MembersQuery) => ["team-access", "members", q] as const,
  invitations: (q: InvitationsQuery) => ["team-access", "invitations", q] as const,
  roles: ["team-access", "roles"] as const,
  permissions: ["team-access", "permissions"] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useMembers(query: MembersQuery = {}) {
  return useQuery({
    queryKey: keys.members(query),
    queryFn: () => teamApi.members(query),
    placeholderData: (prev) => prev, // keep previous data while fetching next page
  });
}

export function useInvitations(query: InvitationsQuery = {}) {
  return useQuery({
    queryKey: keys.invitations(query),
    queryFn: () => teamApi.invitations(query),
    placeholderData: (prev) => prev,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: keys.roles,
    queryFn: teamApi.roles,
  });
}

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: keys.permissions,
    queryFn: teamApi.permissions,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useTeamMutations() {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: keys.all });

  return {
    invite: useMutation({ mutationFn: teamApi.invite, onSuccess: invalidate }),

    resend: useMutation({ mutationFn: teamApi.resend, onSuccess: invalidate }),

    revoke: useMutation({ mutationFn: teamApi.revoke, onSuccess: invalidate }),

    createRole: useMutation({
      mutationFn: teamApi.createRole,
      onSuccess: invalidate,
    }),

    updateRole: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: string;
        body: Parameters<typeof teamApi.updateRole>[1];
      }) => teamApi.updateRole(id, body),
      onSuccess: invalidate,
    }),

    deleteRole: useMutation({
      mutationFn: teamApi.deleteRole,
      onSuccess: invalidate,
    }),

    updateMember: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: string;
        body: Parameters<typeof teamApi.updateMember>[1];
      }) => teamApi.updateMember(id, body),
      onSuccess: invalidate,
    }),

    status: useMutation({
      mutationFn: ({
        id,
        action,
      }: {
        id: string;
        action: "activate" | "suspend";
      }) => teamApi.status(id, action),
      onSuccess: invalidate,
    }),
  };
}

// ─── Legacy combined hook (kept for backward compat if needed elsewhere) ──────

/** @deprecated Use individual hooks (useMembers, useInvitations, etc.) instead */
export function useTeamAccess() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: keys.all });
  const defaultMembersQuery: MembersQuery = { page: 1, pageSize: 20 };
  const defaultInvitationsQuery: InvitationsQuery = { page: 1, pageSize: 20 };

  return {
    members: useQuery({
      queryKey: keys.members(defaultMembersQuery),
      queryFn: () => teamApi.members(defaultMembersQuery),
      select: (d) => d.data,
    }),
    invitations: useQuery({
      queryKey: keys.invitations(defaultInvitationsQuery),
      queryFn: () => teamApi.invitations(defaultInvitationsQuery),
      select: (d) => d.data,
    }),
    roles: useQuery({ queryKey: keys.roles, queryFn: teamApi.roles }),
    permissions: useQuery({ queryKey: keys.permissions, queryFn: teamApi.permissions }),
    invite: useMutation({ mutationFn: teamApi.invite, onSuccess: refresh }),
    resend: useMutation({ mutationFn: teamApi.resend, onSuccess: refresh }),
    revoke: useMutation({ mutationFn: teamApi.revoke, onSuccess: refresh }),
    createRole: useMutation({ mutationFn: teamApi.createRole, onSuccess: refresh }),
    updateRole: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Parameters<typeof teamApi.updateRole>[1] }) =>
        teamApi.updateRole(id, body),
      onSuccess: refresh,
    }),
    deleteRole: useMutation({ mutationFn: teamApi.deleteRole, onSuccess: refresh }),
    updateMember: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Parameters<typeof teamApi.updateMember>[1] }) =>
        teamApi.updateMember(id, body),
      onSuccess: refresh,
    }),
    status: useMutation({
      mutationFn: ({ id, action }: { id: string; action: "activate" | "suspend" }) =>
        teamApi.status(id, action),
      onSuccess: refresh,
    }),
  };
}
