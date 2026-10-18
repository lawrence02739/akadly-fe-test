import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import AccessModal from '../components/AccessModal';
import type { RootState } from '../../../store';
import type { ApiUser, ListUsersQuery } from '../api/users.api';
import type { ApiRole } from '../api/roles.api';
import {
  useUsers,
  useRoles,
  useArchivedRoles,
  usePermissions,
  useUserMutations,
} from '../hooks/useUsers';
import MemberTypeBadge from '../../instructors/components/MemberTypeBadge';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const field =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

const errorText = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? 'Something went wrong.';

function formatRelativeExpiry(expiresAtStr: string | null | undefined, expired?: boolean): string {
  if (expired) return 'Invitation expired';
  if (!expiresAtStr) return '';
  const diffMs = new Date(expiresAtStr).getTime() - Date.now();
  if (diffMs <= 0) return 'Invitation expired';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `Expires in ${diffHours} hour${diffHours === 1 ? '' : 's'}`;
  const diffDays = Math.floor(diffHours / 24);
  return `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const canManageUsers = Boolean(
    currentUser?.isOwner ||
      currentUser?.permissions?.includes('member:manage') ||
      currentUser?.permissions?.includes('user:manage'),
  );
  const canManageRoles = Boolean(
    currentUser?.isOwner || currentUser?.permissions?.includes('role:manage'),
  );

  const mutations = useUserMutations();

  // ── Roles & Permissions ──
  const rolesQ = useRoles();
  const [roleView, setRoleView] = useState<'active' | 'archived'>('active');
  const archivedRolesQ = useArchivedRoles(canManageRoles && roleView === 'archived');
  const archivedRoles = archivedRolesQ.data ?? [];
  const [selectedArchivedRoleIds, setSelectedArchivedRoleIds] = useState<string[]>([]);
  const permissionsQ = usePermissions();
  const roles = rolesQ.data ?? [];
  const permissions = permissionsQ.data ?? [];
  const assignable = roles.filter((r) => r.key.toLowerCase() !== 'owner');

  // ── Tab: users | roles (Invitations tab removed) ──
  const [tab, setTab] = useState<'users' | 'roles'>('users');

  // ── Users query state ──
  const [usersQ, setUsersQ] = useState<ListUsersQuery>({
    page: 1,
    limit: PAGE_SIZE,
    search: '',
    status: undefined,
    roleId: undefined,
  });
  const [usersSearch, setUsersSearch] = useState('');

  // ── Pending invitations stat query ──
  const pendingInvitesRes = useUsers({ status: 'invited', limit: 1 });
  const pendingInvitesCount = pendingInvitesRes.data?.meta?.total ?? 0;

  // ── Users data query ──
  const usersRes = useUsers(usersQ);
  const usersList = usersRes.data?.data ?? [];
  const usersMeta = usersRes.data?.meta;

  const applyUsersSearch = useCallback((value: string) => {
    setUsersSearch(value);
    setUsersQ((prev) => ({ ...prev, search: value, page: 1 }));
  }, []);

  // ── Modals ──
  const [modal, setModal] = useState<'add-user' | 'role' | 'edit-user' | null>(null);
  const [editingRole, setEditingRole] = useState<ApiRole | null>(null);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    roleId: '',
    permissions: [] as string[],
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    name: '',
    roleId: '',
    permissions: [] as string[],
  });

  // Permission groups for checkboxes
  const groups = Object.entries(
    permissions.reduce<Record<string, typeof permissions>>((acc, item) => {
      acc[item.group] = [...(acc[item.group] ?? []), item];
      return acc;
    }, {}),
  );

  const toggle = (list: string[], key: string) =>
    list.includes(key) ? list.filter((i) => i !== key) : [...list, key];

  // ── Add User ──
  const openAddUser = () => {
    const role = assignable[0];
    if (!role) return toast.error('Create an assignable role first.');
    setAddForm({
      name: '',
      email: '',
      roleId: role.id,
      permissions: [...role.permissions],
    });
    setModal('add-user');
  };

  const submitAddUser = async () => {
    if (!addForm.name.trim() || !addForm.email.trim()) {
      return toast.error('Name and email are required.');
    }
    try {
      const res = await mutations.create.mutateAsync({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        roleIds: addForm.roleId ? [addForm.roleId] : [],
        permissions: addForm.permissions,
      });
      setModal(null);
      if (res.deliveryStatus === 'failed') {
        toast.error('User created, but invitation email failed to send. Check email configuration.');
      } else {
        toast.success('User created and invitation sent successfully.');
      }
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  // ── Edit User ──
  const openEditUser = (user: ApiUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      roleId: user.roleIds[0] ?? '',
      permissions: [...user.effectivePermissions],
    });
    setModal('edit-user');
  };

  const saveEditUser = async () => {
    if (!editingUser) return;
    try {
      await mutations.update.mutateAsync({
        id: editingUser.id,
        data: {
          name: editForm.name.trim() || undefined,
          roleIds: editForm.roleId ? [editForm.roleId] : undefined,
          permissions: editForm.permissions,
        },
      });
      setModal(null);
      toast.success('User updated successfully.');
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  // ── User Actions: Status, Resend, Delete ──
  const handleSetStatus = async (user: ApiUser, newStatus: 'active' | 'suspended') => {
    try {
      await mutations.setStatus.mutateAsync({ id: user.id, status: newStatus });
      toast.success(newStatus === 'active' ? 'User activated.' : 'User suspended and sessions revoked.');
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const handleResend = async (user: ApiUser) => {
    try {
      await mutations.resendInvitation.mutateAsync(user.id);
      toast.success('Invitation token rotated and resent successfully.');
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const handleDeleteUser = async (user: ApiUser) => {
    if (!confirm(`Soft delete user "${user.name}"? Active sessions will be revoked. You can restore them later.`)) {
      return;
    }
    try {
      await mutations.delete.mutateAsync(user.id);
      toast.success('User soft deleted.');
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  // ── Role Actions ──
  const openRole = (role?: ApiRole) => {
    setEditingRole(role ?? null);
    setRoleForm(
      role
        ? { name: role.name, description: role.description, permissions: role.permissions.filter((p) => p !== '*') }
        : { name: '', description: '', permissions: [] },
    );
    setModal('role');
  };

  const saveRole = async () => {
    if (!roleForm.name.trim()) return toast.error('Role name is required.');
    try {
      if (editingRole) {
        await mutations.updateRole.mutateAsync({ id: editingRole.id, data: roleForm });
      } else {
        await mutations.createRole.mutateAsync(roleForm);
      }
      setModal(null);
      toast.success('Role saved successfully.');
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const deleteRole = async (role: ApiRole) => {
    if (!confirm(`Archive role "${role.name}"? You can restore it later.`)) return;
    try {
      await mutations.deleteRole.mutateAsync(role.id);
      toast.success('Role archived.');
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const manageArchivedRoles = async (action: 'restore' | 'delete') => {
    if (!selectedArchivedRoleIds.length) return;
    if (
      action === 'delete' &&
      !confirm(`Permanently delete ${selectedArchivedRoleIds.length} archived roles? This cannot be undone.`)
    ) {
      return;
    }
    try {
      if (action === 'restore') {
        await mutations.restoreArchivedRoles.mutateAsync(selectedArchivedRoleIds);
      } else {
        await mutations.deleteArchivedRoles.mutateAsync(selectedArchivedRoleIds);
      }
      toast.success(action === 'restore' ? 'Roles restored.' : 'Roles permanently deleted.');
      setSelectedArchivedRoleIds([]);
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  const totalUsers = usersMeta?.total ?? usersList.length;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users &amp; access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage workspace users, assigned roles, and granular access permissions.
          </p>
        </div>
        {canManageUsers && (
          <button
            onClick={openAddUser}
            className="flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add user
          </button>
        )}
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Total workspace users" value={totalUsers} />
        <Stat icon={RefreshCw} label="Pending invitations" value={pendingInvitesCount} />
        <Stat icon={ShieldCheck} label="Configured roles" value={roles.length} />
      </div>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tabs: Users & Roles */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 pt-4">
          <div className="flex gap-5">
            {(['users', ...(canManageRoles ? (['roles'] as const) : [])] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`border-b-2 pb-3 text-sm font-semibold capitalize transition-colors ${
                  tab === item
                    ? 'border-primary-700 text-primary-800'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {item === 'users' ? 'Users' : 'Roles'}
              </button>
            ))}
          </div>

          {/* Search + Filters for Users */}
          {tab === 'users' && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={usersSearch}
                  onChange={(e) => applyUsersSearch(e.target.value)}
                  className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm w-48 outline-none focus:border-primary-500"
                  placeholder="Search users"
                />
              </label>
              <select
                value={usersQ.status ?? ''}
                onChange={(e) =>
                  setUsersQ((prev) => ({
                    ...prev,
                    status: (e.target.value as ListUsersQuery['status']) || undefined,
                    page: 1,
                  }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-primary-500"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={usersQ.roleId ?? ''}
                onChange={(e) =>
                  setUsersQ((prev) => ({
                    ...prev,
                    roleId: e.target.value || undefined,
                    page: 1,
                  }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-none focus:border-primary-500"
              >
                <option value="">All roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Users Tab ── */}
        {tab === 'users' && (
          <div>
            {usersRes.isLoading && <Notice>Loading users...</Notice>}
            {usersRes.isError && (
              <Notice>
                <span className="text-rose-600">Could not load users.</span>
                <button
                  onClick={() => usersRes.refetch()}
                  className="ml-2 font-semibold text-primary-700 underline"
                >
                  Retry
                </button>
              </Notice>
            )}
            {!usersRes.isLoading && !usersRes.isError && (
              <>
                <div className="divide-y divide-slate-100">
                  {usersList.map((user) => {
                    const isInstructor = user.type === 'instructor';
                    const isInvited = user.status === 'invited';
                    const isSuspended = user.status === 'suspended';
                    const isActive = user.status === 'active';

                    return (
                      <div
                        key={user.id}
                        className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* User Identity Info */}
                        <div className="flex items-center gap-3 min-w-[240px]">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                              isInstructor
                                ? 'bg-teal-100 text-teal-800'
                                : user.isOwner
                                ? 'bg-amber-100 text-amber-800'
                                : isInvited
                                ? 'bg-slate-100 text-slate-600 border border-dashed border-slate-300'
                                : 'bg-primary-100 text-primary-800'
                            }`}
                          >
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900">{user.name}</span>
                              {user.isOwner && (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800 font-bold uppercase tracking-wider">
                                  Owner
                                </span>
                              )}
                              {isInstructor && <MemberTypeBadge memberType="instructor" />}
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isInvited
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {isInvited ? 'Invited' : isSuspended ? 'Suspended' : 'Active'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <span>{user.email}</span>
                              {isInvited && (
                                <span
                                  className={
                                    user.invitationExpired
                                      ? 'text-rose-600 font-semibold'
                                      : 'text-slate-400 italic'
                                  }
                                >
                                  · {formatRelativeExpiry(user.invitationExpiresAt, user.invitationExpired)}
                                </span>
                              )}
                              {user.deliveryStatus === 'failed' && (
                                <span className="rounded bg-rose-50 px-1.5 py-0.2 text-[10px] text-rose-600 font-medium border border-rose-200">
                                  Email delivery failed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Roles & Permissions */}
                        <div className="text-right sm:text-left">
                          <p className="text-sm font-medium text-slate-700">
                            {user.roleNames && user.roleNames.length > 0
                              ? user.roleNames.join(', ')
                              : isInstructor
                              ? 'Instructor'
                              : 'No roles assigned'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {user.effectivePermissions.includes('*')
                              ? 'Full workspace access'
                              : `${user.effectivePermissions.length} permissions`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isInstructor ? (
                            <Link
                              to={`/instructors?search=${encodeURIComponent(user.email)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors"
                            >
                              Manage in Instructors
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          ) : (
                            canManageUsers && (
                              <>
                                <button
                                  onClick={() => openEditUser(user)}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  Edit access
                                </button>

                                {isActive && !user.isOwner && (
                                  <button
                                    onClick={() => handleSetStatus(user, 'suspended')}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    Suspend
                                  </button>
                                )}

                                {isSuspended && !user.isOwner && (
                                  <button
                                    onClick={() => handleSetStatus(user, 'active')}
                                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  >
                                    Activate
                                  </button>
                                )}

                                {isInvited && (
                                  <button
                                    onClick={() => handleResend(user)}
                                    title="Resend invitation"
                                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Resend
                                  </button>
                                )}

                                {!user.isOwner && (
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    title="Delete user"
                                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {usersList.length === 0 && <Notice>No users found matching your filters.</Notice>}
                </div>
                {usersMeta && (
                  <Pagination
                    meta={usersMeta}
                    onPage={(page) => setUsersQ((prev) => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── Roles Tab ── */}
        {tab === 'roles' && (
          <div className="p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2" aria-label="Role view">
                <button
                  type="button"
                  onClick={() => {
                    setRoleView('active');
                    setSelectedArchivedRoleIds([]);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    roleView === 'active'
                      ? 'bg-primary-800 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Active Roles
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleView('archived');
                    setSelectedArchivedRoleIds([]);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    roleView === 'archived'
                      ? 'bg-primary-800 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Archived Roles
                </button>
              </div>
              {roleView === 'active' && (
                <button
                  onClick={() => openRole()}
                  className="flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create role
                </button>
              )}
            </div>

            {roleView === 'archived' && (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      aria-label="Select all archived roles"
                      checked={
                        archivedRoles.length > 0 &&
                        selectedArchivedRoleIds.length === archivedRoles.length
                      }
                      disabled={!archivedRoles.length}
                      onChange={(event) =>
                        setSelectedArchivedRoleIds(
                          event.target.checked ? archivedRoles.map((role) => role.id) : [],
                        )
                      }
                    />
                    Select all ({archivedRoles.length})
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        !selectedArchivedRoleIds.length ||
                        mutations.restoreArchivedRoles.isPending ||
                        mutations.deleteArchivedRoles.isPending
                      }
                      onClick={() => void manageArchivedRoles('restore')}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-slate-50"
                    >
                      Restore selected ({selectedArchivedRoleIds.length})
                    </button>
                    <button
                      type="button"
                      disabled={
                        !selectedArchivedRoleIds.length ||
                        mutations.restoreArchivedRoles.isPending ||
                        mutations.deleteArchivedRoles.isPending
                      }
                      onClick={() => void manageArchivedRoles('delete')}
                      className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50 hover:bg-rose-50"
                    >
                      Delete permanently
                    </button>
                  </div>
                </div>
                {archivedRolesQ.isLoading && <Notice>Loading archived roles...</Notice>}
                {archivedRolesQ.isError && <Notice>Could not load archived roles.</Notice>}
                {!archivedRolesQ.isLoading &&
                  !archivedRolesQ.isError &&
                  archivedRoles.length === 0 && <Notice>No archived roles found.</Notice>}
                <div className="grid gap-3 lg:grid-cols-2">
                  {archivedRoles.map((role) => (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedArchivedRoleIds.includes(role.id)}
                        onChange={(event) =>
                          setSelectedArchivedRoleIds((ids) =>
                            event.target.checked
                              ? [...ids, role.id]
                              : ids.filter((id) => id !== role.id),
                          )
                        }
                      />
                      <span>
                        <strong className="block text-sm text-slate-900">{role.name}</strong>
                        <span className="block text-xs text-slate-500">
                          {role.description || 'No description'}
                        </span>
                        <span className="mt-1 block text-xs text-slate-400">
                          Archived {role.archivedAt ? new Date(role.archivedAt).toLocaleDateString() : ''}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {roleView === 'active' && rolesQ.isLoading && <Notice>Loading roles...</Notice>}
            {roleView === 'active' && !rolesQ.isLoading && (
              <div className="grid gap-4 lg:grid-cols-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`rounded-xl border p-5 transition-colors ${
                      role.isSystem
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <ShieldCheck className="h-5 w-5 text-primary-700 shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {role.memberCount} user{role.memberCount !== 1 ? 's' : ''}
                        </span>
                        {!role.isSystem && canManageRoles && (
                          <>
                            <button
                              onClick={() => openRole(role)}
                              className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteRole(role)}
                              className="rounded p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Archive role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {role.isSystem && (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-semibold">
                            System
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-3 font-bold text-slate-900">{role.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {role.description || 'No description provided'}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      {role.permissions.includes('*')
                        ? 'Full access (*)'
                        : `${role.permissions.length} permissions`}
                    </p>
                  </div>
                ))}
                {roles.length === 0 && <Notice>No roles found.</Notice>}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Add User Modal ── */}
      <AccessModal
        wide
        open={modal === 'add-user'}
        onClose={() => setModal(null)}
        title="Add a user"
        description="A secure single-use password setup link will be emailed to activate their account."
        footer={
          <Footer
            cancel={() => setModal(null)}
            save={submitAddUser}
            label={mutations.create.isPending ? 'Adding user…' : 'Add user'}
            disabled={mutations.create.isPending}
          />
        }
      >
        <div className="space-y-4">
          <Field
            label="Full name"
            value={addForm.name}
            change={(name) => setAddForm({ ...addForm, name })}
          />
          <Field
            label="Work email"
            type="email"
            value={addForm.email}
            change={(email) => setAddForm({ ...addForm, email })}
          />
          <RoleSelect
            roles={assignable}
            value={addForm.roleId}
            change={(roleId) => {
              const role = roles.find((r) => r.id === roleId);
              setAddForm({
                ...addForm,
                roleId,
                permissions: [...(role?.permissions ?? [])],
              });
            }}
          />
          <Permissions
            groups={groups}
            selected={addForm.permissions}
            toggleKey={(key) =>
              setAddForm({ ...addForm, permissions: toggle(addForm.permissions, key) })
            }
          />
        </div>
      </AccessModal>

      {/* ── Role Modal ── */}
      <AccessModal
        wide
        open={modal === 'role'}
        onClose={() => setModal(null)}
        title={editingRole ? 'Edit role' : 'Create role'}
        description="Bundle reusable permissions into a named workspace role."
        footer={
          <Footer
            cancel={() => setModal(null)}
            save={saveRole}
            label={
              mutations.updateRole.isPending || mutations.createRole.isPending
                ? 'Saving…'
                : 'Save role'
            }
            disabled={mutations.updateRole.isPending || mutations.createRole.isPending}
          />
        }
      >
        <div className="space-y-4">
          <Field
            label="Role name"
            value={roleForm.name}
            change={(name) => setRoleForm({ ...roleForm, name })}
          />
          <Field
            label="Description"
            value={roleForm.description}
            change={(description) => setRoleForm({ ...roleForm, description })}
          />
          <Permissions
            groups={groups}
            selected={roleForm.permissions}
            toggleKey={(key) =>
              setRoleForm({ ...roleForm, permissions: toggle(roleForm.permissions, key) })
            }
          />
        </div>
      </AccessModal>

      {/* ── Edit User Modal ── */}
      <AccessModal
        wide
        open={modal === 'edit-user'}
        onClose={() => setModal(null)}
        title={`Edit ${editingUser?.name ?? 'user'} access`}
        description="Update user name, role assignments, or custom override permissions."
        footer={
          <Footer
            cancel={() => setModal(null)}
            save={saveEditUser}
            label={mutations.update.isPending ? 'Saving…' : 'Save changes'}
            disabled={mutations.update.isPending}
          />
        }
      >
        <div className="space-y-4">
          <Field
            label="Full name"
            value={editForm.name}
            change={(name) => setEditForm({ ...editForm, name })}
          />
          {!editingUser?.isOwner && (
            <RoleSelect
              roles={assignable}
              value={editForm.roleId}
              change={(roleId) => {
                const role = roles.find((r) => r.id === roleId);
                setEditForm({
                  ...editForm,
                  roleId,
                  permissions: [...(role?.permissions ?? [])],
                });
              }}
            />
          )}
          {!editingUser?.isOwner && (
            <Permissions
              groups={groups}
              selected={editForm.permissions}
              toggleKey={(key) =>
                setEditForm({
                  ...editForm,
                  permissions: toggle(editForm.permissions, key),
                })
              }
            />
          )}
        </div>
      </AccessModal>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary-700" />
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-12 text-center text-sm text-slate-500">{children}</div>
  );
}

function Pagination({
  meta,
  onPage,
}: {
  meta: { page: number; totalPages: number; total: number; pageSize: number; hasNext: boolean; hasPrev: boolean };
  onPage: (page: number) => void;
}) {
  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
      <span>
        {meta.total === 0 ? '0 results' : `${from}–${to} of ${meta.total}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={!meta.hasPrev}
          onClick={() => onPage(meta.page - 1)}
          className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 font-medium">
          {meta.page} / {meta.totalPages || 1}
        </span>
        <button
          disabled={!meta.hasNext}
          onClick={() => onPage(meta.page + 1)}
          className="rounded p-1.5 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  type = 'text',
  change,
}: {
  label: string;
  value: string;
  type?: string;
  change: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className={field}
        type={type}
        value={value}
        onChange={(e) => change(e.target.value)}
      />
    </label>
  );
}

function RoleSelect({
  roles,
  value,
  change,
}: {
  roles: ApiRole[];
  value: string;
  change: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">Role</span>
      <select className={field} value={value} onChange={(e) => change(e.target.value)}>
        <option value="">Select a role</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Permissions({
  groups,
  selected,
  toggleKey,
}: {
  groups: Array<[string, Array<{ key: string; label: string; description: string }>]>;
  selected: string[];
  toggleKey: (v: string) => void;
}) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-slate-700">Permissions</span>
      <div className="max-h-72 space-y-5 overflow-y-auto rounded-xl border border-slate-200 p-4 bg-slate-50/50">
        {groups.map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              {group}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => toggleKey(item.key)}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 text-left text-sm transition-colors ${
                    selected.includes(item.key)
                      ? 'border-primary-300 bg-primary-50 text-slate-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      selected.includes(item.key)
                        ? 'border-primary-600 bg-primary-700 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selected.includes(item.key) && <Check className="h-3 w-3" />}
                  </span>
                  <span>
                    <b className="block text-slate-800">{item.label}</b>
                    <small className="block text-slate-500">{item.description}</small>
                    <small className="block text-slate-400 font-mono text-[11px]">{item.key}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({
  cancel,
  save,
  label,
  disabled = false,
}: {
  cancel: () => void;
  save: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <>
      <button
        onClick={cancel}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={save}
        disabled={disabled}
        className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-sm"
      >
        {label}
      </button>
    </>
  );
}
