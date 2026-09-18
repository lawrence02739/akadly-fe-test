import { useState, useCallback } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MailPlus,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import AccessModal from "../components/AccessModal";
import type { RootState } from "../../../store";
import type { ApiMember, ApiRole, MembersQuery, InvitationsQuery } from "../api/team.api";
import {
  useMembers,
  useInvitations,
  useRoles,
  usePermissionsCatalog,
  useTeamMutations,
} from "../hooks/useTeamAccess";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const field =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

const errorText = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "Something went wrong.";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamAccessPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const canManageMembers = Boolean(
    currentUser?.isOwner || currentUser?.permissions?.includes("member:manage"),
  );
  const canManageRoles = Boolean(
    currentUser?.isOwner || currentUser?.permissions?.includes("role:manage"),
  );

  const mutations = useTeamMutations();

  // ── Roles & Permissions (non-paginated) ──
  const rolesQ = useRoles();
  const permissionsQ = usePermissionsCatalog();
  const roles = rolesQ.data ?? [];
  const permissions = permissionsQ.data ?? [];
  const assignable = roles.filter((r) => r.key.toLowerCase() !== "owner");

  // ── Tab ──
  const [tab, setTab] = useState<"members" | "invitations" | "roles">("members");

  // ── Members query state ──
  const [membersQ, setMembersQ] = useState<MembersQuery>({
    page: 1,
    pageSize: PAGE_SIZE,
    search: "",
    status: undefined,
    roleId: undefined,
  });
  const [membersSearch, setMembersSearch] = useState("");

  // ── Invitations query state ──
  const [invitesQ, setInvitesQ] = useState<InvitationsQuery>({
    page: 1,
    pageSize: PAGE_SIZE,
    search: "",
    status: undefined,
    roleId: undefined,
  });
  const [invitesSearch, setInvitesSearch] = useState("");

  // ── Fetch with server-side pagination ──
  const membersRes = useMembers(membersQ);
  const invitesRes = useInvitations(invitesQ);

  const members = membersRes.data?.data ?? [];
  const membersMeta = membersRes.data?.meta;
  const invites = invitesRes.data?.data ?? [];
  const invitesMeta = invitesRes.data?.meta;

  // ── Search debounce helper ──
  const applyMembersSearch = useCallback(
    (value: string) => {
      setMembersSearch(value);
      setMembersQ((prev) => ({ ...prev, search: value, page: 1 }));
    },
    [],
  );
  const applyInvitesSearch = useCallback(
    (value: string) => {
      setInvitesSearch(value);
      setInvitesQ((prev) => ({ ...prev, search: value, page: 1 }));
    },
    [],
  );

  // ── Modals ──
  const [modal, setModal] = useState<"invite" | "role" | "member" | null>(null);
  const [editingRole, setEditingRole] = useState<ApiRole | null>(null);
  const [editingMember, setEditingMember] = useState<ApiMember | null>(null);

  const [invite, setInvite] = useState({
    name: "",
    email: "",
    roleId: "",
    permissions: [] as string[],
  });
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });
  const [memberForm, setMemberForm] = useState({
    roleId: "",
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

  // ── Invite ──
  const openInvite = () => {
    const role = assignable[0];
    if (!role) return toast.error("Create an assignable role first.");
    setInvite({ name: "", email: "", roleId: role.id, permissions: [...role.permissions] });
    setModal("invite");
  };
  const submitInvite = async () => {
    if (!invite.name.trim() || !invite.email.trim())
      return toast.error("Name and email are required.");
    try {
      await mutations.invite.mutateAsync({
        name: invite.name,
        email: invite.email,
        roleIds: [invite.roleId],
        permissions: invite.permissions,
      });
      setModal(null);
      toast.success("Invitation sent successfully.");
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  // ── Role ──
  const openRole = (role?: ApiRole) => {
    setEditingRole(role ?? null);
    setRoleForm(
      role
        ? { name: role.name, description: role.description, permissions: role.permissions.filter((p) => p !== "*") }
        : { name: "", description: "", permissions: [] },
    );
    setModal("role");
  };
  const saveRole = async () => {
    if (!roleForm.name.trim()) return toast.error("Role name is required.");
    try {
      if (editingRole)
        await mutations.updateRole.mutateAsync({ id: editingRole.id, body: roleForm });
      else
        await mutations.createRole.mutateAsync(roleForm);
      setModal(null);
      toast.success("Role saved.");
    } catch (e) {
      toast.error(errorText(e));
    }
  };
  const deleteRole = async (role: ApiRole) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await mutations.deleteRole.mutateAsync(role.id);
      toast.success("Role deleted.");
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  // ── Member edit ──
  const openMember = (member: ApiMember) => {
    setEditingMember(member);
    setMemberForm({ roleId: member.roleIds[0] ?? "", permissions: [...member.effectivePermissions] });
    setModal("member");
  };
  const saveMember = async () => {
    if (!editingMember || !memberForm.roleId) return;
    try {
      await mutations.updateMember.mutateAsync({
        id: editingMember.id,
        body: { roleIds: [memberForm.roleId], permissions: memberForm.permissions },
      });
      setModal(null);
      toast.success("User access updated.");
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  // ── Summary stats ──
  const totalMembers = membersMeta?.total ?? members.length;
  const pendingInvites = invitesMeta?.total ?? invites.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users &amp; access</h1>
          <p className="mt-1 text-sm text-slate-500">
            Invite users, customize access, and manage workspace roles.
          </p>
        </div>
        {canManageMembers && (
          <button
            onClick={openInvite}
            className="flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            <MailPlus className="h-4 w-4" />
            Invite user
          </button>
        )}
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Users} label="Workspace users" value={totalMembers} />
        <Stat icon={MailPlus} label="Pending invitations" value={pendingInvites} />
        <Stat icon={ShieldCheck} label="Roles" value={roles.length} />
      </div>

      {/* Main Card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 pt-4">
          <div className="flex gap-5">
            {(["members", "invitations", ...(canManageRoles ? ["roles" as const] : [])] as const).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`border-b-2 pb-3 text-sm font-semibold capitalize transition-colors ${
                    tab === item
                      ? "border-primary-700 text-primary-800"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          {/* Search + Filters */}
          {tab === "members" && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={membersSearch}
                  onChange={(e) => applyMembersSearch(e.target.value)}
                  className="rounded-lg border py-2 pl-9 pr-3 text-sm w-48"
                  placeholder="Search members"
                />
              </label>
              <select
                value={membersQ.status ?? ""}
                onChange={(e) =>
                  setMembersQ((prev) => ({
                    ...prev,
                    status: (e.target.value as MembersQuery["status"]) || undefined,
                    page: 1,
                  }))
                }
                className="rounded-lg border px-3 py-2 text-sm text-slate-600"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={membersQ.roleId ?? ""}
                onChange={(e) =>
                  setMembersQ((prev) => ({
                    ...prev,
                    roleId: e.target.value || undefined,
                    page: 1,
                  }))
                }
                className="rounded-lg border px-3 py-2 text-sm text-slate-600"
              >
                <option value="">All roles</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
          {tab === "invitations" && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={invitesSearch}
                  onChange={(e) => applyInvitesSearch(e.target.value)}
                  className="rounded-lg border py-2 pl-9 pr-3 text-sm w-48"
                  placeholder="Search invitations"
                />
              </label>
              <select
                value={invitesQ.status ?? ""}
                onChange={(e) =>
                  setInvitesQ((prev) => ({
                    ...prev,
                    status: (e.target.value as InvitationsQuery["status"]) || undefined,
                    page: 1,
                  }))
                }
                className="rounded-lg border px-3 py-2 text-sm text-slate-600"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          )}
        </div>

        {/* ── Members Tab ── */}
        {tab === "members" && (
          <div>
            {membersRes.isLoading && <Notice>Loading members...</Notice>}
            {membersRes.isError && (
              <Notice>
                <span className="text-rose-600">Could not load members.</span>
                <button
                  onClick={() => membersRes.refetch()}
                  className="ml-2 font-semibold text-primary-700"
                >
                  Retry
                </button>
              </Notice>
            )}
            {!membersRes.isLoading && !membersRes.isError && (
              <>
                <div className="divide-y">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-800 shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-2">
                            {member.name}
                            {member.isOwner && (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-semibold">
                                OWNER
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                member.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {member.status}
                            </span>
                          </p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-700">
                            {member.roleNames.join(", ")}
                          </p>
                          <p className="text-xs text-slate-400">
                            {member.effectivePermissions.includes("*")
                              ? "Full access"
                              : `${member.effectivePermissions.length} permissions`}
                          </p>
                        </div>
                        {canManageMembers && !member.isOwner && (
                          <>
                            <button
                              onClick={() => openMember(member)}
                              className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors"
                            >
                              Edit access
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await mutations.status.mutateAsync({
                                    id: member.id,
                                    action: member.status === "active" ? "suspend" : "activate",
                                  });
                                  toast.success(
                                    member.status === "active"
                                      ? "User suspended."
                                      : "User activated.",
                                  );
                                } catch (e) {
                                  toast.error(errorText(e));
                                }
                              }}
                              className={`px-2 text-xs font-semibold ${
                                member.status === "active"
                                  ? "text-rose-500 hover:text-rose-700"
                                  : "text-emerald-600 hover:text-emerald-800"
                              }`}
                            >
                              {member.status === "active" ? "Suspend" : "Activate"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && <Notice>No members found.</Notice>}
                </div>
                {membersMeta && (
                  <Pagination
                    meta={membersMeta}
                    onPage={(page) => setMembersQ((prev) => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── Invitations Tab ── */}
        {tab === "invitations" && (
          <div>
            {invitesRes.isLoading && <Notice>Loading invitations...</Notice>}
            {invitesRes.isError && (
              <Notice>
                <span className="text-rose-600">Could not load invitations.</span>
                <button
                  onClick={() => invitesRes.refetch()}
                  className="ml-2 font-semibold text-primary-700"
                >
                  Retry
                </button>
              </Notice>
            )}
            {!invitesRes.isLoading && !invitesRes.isError && (
              <>
                <div className="divide-y">
                  {invites.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 shrink-0">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">
                            {item.email} · {item.roleNames.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : item.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.deliveryStatus === "sent"
                              ? "text-emerald-600"
                              : item.deliveryStatus === "failed"
                              ? "text-rose-600"
                              : "text-slate-400"
                          }`}
                        >
                          {item.deliveryStatus}
                        </span>
                        {canManageMembers && item.status === "pending" && (
                          <>
                            <button
                              title="Resend invitation"
                              onClick={async () => {
                                try {
                                  await mutations.resend.mutateAsync(item.id);
                                  toast.success("Invitation resent.");
                                } catch (e) {
                                  toast.error(errorText(e));
                                }
                              }}
                              className="rounded p-2 hover:bg-slate-100 transition-colors"
                            >
                              <RefreshCw className="h-4 w-4 text-slate-500" />
                            </button>
                            <button
                              title="Revoke invitation"
                              onClick={async () => {
                                if (!confirm("Revoke this invitation?")) return;
                                try {
                                  await mutations.revoke.mutateAsync(item.id);
                                  toast.success("Invitation revoked.");
                                } catch (e) {
                                  toast.error(errorText(e));
                                }
                              }}
                              className="rounded p-2 hover:bg-rose-50 transition-colors"
                            >
                              <X className="h-4 w-4 text-rose-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {invites.length === 0 && <Notice>No invitations found.</Notice>}
                </div>
                {invitesMeta && (
                  <Pagination
                    meta={invitesMeta}
                    onPage={(page) => setInvitesQ((prev) => ({ ...prev, page }))}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── Roles Tab ── */}
        {tab === "roles" && (
          <div className="p-5">
            <div className="mb-5 flex justify-end">
              <button
                onClick={() => openRole()}
                className="flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create role
              </button>
            </div>
            {rolesQ.isLoading && <Notice>Loading roles...</Notice>}
            {!rolesQ.isLoading && (
              <div className="grid gap-4 lg:grid-cols-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`rounded-xl border p-5 transition-colors ${
                      role.isSystem ? "bg-amber-50 border-amber-200" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <ShieldCheck className="h-5 w-5 text-primary-700 shrink-0" />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">
                          {role.memberCount} user{role.memberCount !== 1 ? "s" : ""}
                        </span>
                        {!role.isSystem && canManageRoles && (
                          <>
                            <button
                              onClick={() => openRole(role)}
                              className="rounded border px-2 py-1 text-xs font-semibold hover:bg-slate-100 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteRole(role)}
                              className="rounded p-1 hover:bg-rose-50 transition-colors"
                              title="Delete role"
                            >
                              <Trash2 className="h-4 w-4 text-rose-500" />
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
                      {role.description || "No description"}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      {role.permissions.includes("*")
                        ? "Full access (*)"
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

      {/* ── Invite Modal ── */}
      <AccessModal
        wide
        open={modal === "invite"}
        onClose={() => setModal(null)}
        title="Invite a user"
        description="A secure single-use password setup link will be emailed."
        footer={
          <Footer
            cancel={() => setModal(null)}
            save={submitInvite}
            label={mutations.invite.isPending ? "Sending…" : "Send invitation"}
            disabled={mutations.invite.isPending}
          />
        }
      >
        <div className="space-y-4">
          <Field
            label="Full name"
            value={invite.name}
            change={(name) => setInvite({ ...invite, name })}
          />
          <Field
            label="Work email"
            type="email"
            value={invite.email}
            change={(email) => setInvite({ ...invite, email })}
          />
          <RoleSelect
            roles={assignable}
            value={invite.roleId}
            change={(roleId) => {
              const role = roles.find((r) => r.id === roleId);
              setInvite({ ...invite, roleId, permissions: [...(role?.permissions ?? [])] });
            }}
          />
          <Permissions
            groups={groups}
            selected={invite.permissions}
            toggleKey={(key) =>
              setInvite({ ...invite, permissions: toggle(invite.permissions, key) })
            }
          />
        </div>
      </AccessModal>

      {/* ── Role Modal ── */}
      <AccessModal
        wide
        open={modal === "role"}
        onClose={() => setModal(null)}
        title={editingRole ? "Edit role" : "Create role"}
        description="Bundle reusable permissions into a role."
        footer={
          <Footer
            cancel={() => setModal(null)}
            save={saveRole}
            label={
              mutations.updateRole.isPending || mutations.createRole.isPending
                ? "Saving…"
                : "Save role"
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

      {/* ── Edit Member Modal ── */}
      <AccessModal
        wide
        open={modal === "member"}
        onClose={() => setModal(null)}
        title={`Edit ${editingMember?.name ?? "user"} access`}
        description="Role defaults can be customized per-user."
        footer={
          <Footer
            cancel={() => setModal(null)}
            save={saveMember}
            label={mutations.updateMember.isPending ? "Saving…" : "Save access"}
            disabled={mutations.updateMember.isPending}
          />
        }
      >
        <div className="space-y-4">
          <RoleSelect
            roles={assignable}
            value={memberForm.roleId}
            change={(roleId) => {
              const role = roles.find((r) => r.id === roleId);
              setMemberForm({ roleId, permissions: [...(role?.permissions ?? [])] });
            }}
          />
          <Permissions
            groups={groups}
            selected={memberForm.permissions}
            toggleKey={(key) =>
              setMemberForm({
                ...memberForm,
                permissions: toggle(memberForm.permissions, key),
              })
            }
          />
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
    <div className="rounded-xl border bg-white p-4">
      <Icon className="h-5 w-5 text-primary-700" />
      <p className="mt-2 text-2xl font-bold">{value}</p>
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
    <div className="flex items-center justify-between border-t px-5 py-3 text-sm text-slate-500">
      <span>
        {meta.total === 0 ? "0 results" : `${from}–${to} of ${meta.total}`}
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
  type = "text",
  change,
}: {
  label: string;
  value: string;
  type?: string;
  change: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
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
      <span className="mb-1 block text-sm font-semibold">Role</span>
      <select className={field} value={value} onChange={(e) => change(e.target.value)}>
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
      <span className="mb-1 block text-sm font-semibold">Permissions</span>
      <div className="max-h-72 space-y-5 overflow-y-auto rounded-xl border p-4">
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
                      ? "border-primary-300 bg-primary-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      selected.includes(item.key)
                        ? "border-primary-600 bg-primary-700 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {selected.includes(item.key) && <Check className="h-3 w-3" />}
                  </span>
                  <span>
                    <b className="block text-slate-800">{item.label}</b>
                    <small className="block text-slate-400">{item.description}</small>
                    <small className="block text-slate-300 font-mono text-xs">{item.key}</small>
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
        className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={save}
        disabled={disabled}
        className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
      >
        {label}
      </button>
    </>
  );
}
