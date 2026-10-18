import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  usersApi,
  type ListUsersQuery,
  type CreateUserInput,
  type UpdateUserInput,
} from '../api/users.api';
import {
  rolesApi,
  type CreateRoleInput,
  type UpdateRoleInput,
} from '../api/roles.api';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const userKeys = {
  all: ['users'] as const,
  list: (q?: ListUsersQuery) => ['users', 'list', q] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
  roles: ['roles'] as const,
  archivedRoles: ['roles', 'archive'] as const,
  permissions: ['permissions'] as const,
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useUsers(query: ListUsersQuery = {}) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => usersApi.list(query),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.get(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles,
    queryFn: rolesApi.list,
  });
}

export function useArchivedRoles(enabled = true) {
  return useQuery({
    queryKey: userKeys.archivedRoles,
    queryFn: rolesApi.listArchived,
    enabled,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: userKeys.permissions,
    queryFn: rolesApi.listPermissions,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useUserMutations() {
  const client = useQueryClient();

  const invalidateUsers = () => {
    client.invalidateQueries({ queryKey: userKeys.all });
  };

  const invalidateRoles = () => {
    client.invalidateQueries({ queryKey: userKeys.roles });
    client.invalidateQueries({ queryKey: userKeys.archivedRoles });
    client.invalidateQueries({ queryKey: userKeys.all });
  };

  return {
    create: useMutation({
      mutationFn: (data: CreateUserInput) => usersApi.create(data),
      onSuccess: invalidateUsers,
    }),

    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
        usersApi.update(id, data),
      onSuccess: invalidateUsers,
    }),

    delete: useMutation({
      mutationFn: (id: string) => usersApi.delete(id),
      onSuccess: invalidateUsers,
    }),

    restore: useMutation({
      mutationFn: (id: string) => usersApi.restore(id),
      onSuccess: invalidateUsers,
    }),

    setStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
        usersApi.setStatus(id, status),
      onSuccess: invalidateUsers,
    }),

    resendInvitation: useMutation({
      mutationFn: (id: string) => usersApi.resendInvitation(id),
      onSuccess: invalidateUsers,
    }),

    createRole: useMutation({
      mutationFn: (data: CreateRoleInput) => rolesApi.create(data),
      onSuccess: invalidateRoles,
    }),

    updateRole: useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) =>
        rolesApi.update(id, data),
      onSuccess: invalidateRoles,
    }),

    deleteRole: useMutation({
      mutationFn: (id: string) => rolesApi.delete(id),
      onSuccess: invalidateRoles,
    }),

    restoreArchivedRoles: useMutation({
      mutationFn: (ids: string[]) => rolesApi.restoreArchived(ids),
      onSuccess: invalidateRoles,
    }),

    deleteArchivedRoles: useMutation({
      mutationFn: (ids: string[]) => rolesApi.deleteArchivedPermanently(ids),
      onSuccess: invalidateRoles,
    }),
  };
}
