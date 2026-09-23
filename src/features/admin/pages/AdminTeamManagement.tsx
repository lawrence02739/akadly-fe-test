import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { MailPlus, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminApi,
  adminError,
  type AdminAccessRole,
  type AdminInvitation,
  type AdminTeamMember,
  type Pagination,
} from '../api/admin.api';
import { useAdminSession } from '../AdminSession';

type Tab = 'members' | 'invitations' | 'roles';
const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0C5A69]/25';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#084855] disabled:opacity-50';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><h2 className="text-xl font-bold">{title}</h2><button type="button" aria-label="Close" onClick={onClose}><X /></button></div>{children}</div></div>;
}

function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{headers.map((header) => <th className="p-4" key={header}>{header}</th>)}</tr></thead><tbody className="divide-y">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td className="p-4" key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="p-10 text-center text-slate-500">No records found.</p>}</div>;
}

const humanize = (value: string) => value.split(':').map((part) => part.replace(/_/g, ' ')).join(' · ');

export default function AdminTeamManagement() {
  const { can } = useAdminSession();
  const [tab, setTab] = useState<Tab>('members');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [reload, setReload] = useState(0);
  const [meta, setMeta] = useState<Pagination | null>(null);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [roles, setRoles] = useState<AdminAccessRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [modal, setModal] = useState<'invite' | 'role' | null>(null);
  const [editingRole, setEditingRole] = useState<AdminAccessRole | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] as string[] });
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', roleIds: [] as string[], permissions: [] as string[] });
  const manageUsers = can('admin_user:manage');
  const manageRoles = can('admin_role:manage');
  const query = { page, pageSize: 10, search: search || undefined, status: status || undefined };
  const rolesById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const roleNames = (roleIds: string[]) => roleIds.map((id) => rolesById.get(id)?.name ?? 'Unknown role').join(', ') || 'No role';
  const refresh = () => setReload((value) => value + 1);

  useEffect(() => { setPage(1); }, [tab, search, status]);
  useEffect(() => {
    let active = true;
    const request = tab === 'members' ? adminApi.teamMembers(query) : tab === 'invitations' ? adminApi.invitations(query) : adminApi.accessRoles(query);
    request.then((result) => {
      if (!active) return;
      if (tab === 'members') setMembers(result.items as AdminTeamMember[]);
      if (tab === 'invitations') setInvitations(result.items as AdminInvitation[]);
      if (tab === 'roles') setRoles(result.items as AdminAccessRole[]);
      setMeta(result.pagination);
      setError('');
    }).catch((requestError) => active && setError(adminError(requestError)));
    return () => { active = false; };
  }, [tab, page, search, status, reload]);
  useEffect(() => {
    adminApi.accessRoles({ page: 1, pageSize: 100 }).then((result) => setRoles(result.items)).catch(() => undefined);
    adminApi.teamPermissions().then((result) => setPermissions((result.permissions as string[]) ?? [])).catch(() => undefined);
  }, [reload]);

  const submitInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (inviteForm.roleIds.length === 0) { toast.error('Select at least one role.'); return; }
    try {
      await adminApi.createInvitation({ name: inviteForm.name.trim(), email: inviteForm.email.trim().toLowerCase(), roleIds: inviteForm.roleIds, permissions: inviteForm.permissions });
      toast.success('Invitation sent with a secure password setup link.'); setModal(null); refresh();
    } catch (requestError) { toast.error(adminError(requestError)); }
  };
  const submitRole = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editingRole) await adminApi.updateAccessRole(editingRole.id, roleForm);
      else await adminApi.createAccessRole(roleForm);
      toast.success(editingRole ? 'Role updated.' : 'Role created.'); setEditingRole(null); setModal(null); refresh();
    } catch (requestError) { toast.error(adminError(requestError)); }
  };
  const revoke = async (id: string) => { try { await adminApi.revokeInvitation(id); toast.success('Invitation revoked.'); refresh(); } catch (requestError) { toast.error(adminError(requestError)); } };
  const togglePermission = (key: string) => setRoleForm((form) => ({ ...form, permissions: form.permissions.includes(key) ? form.permissions.filter((item) => item !== key) : [...form.permissions, key] }));
  const toggleInviteRole = (id: string) => setInviteForm((form) => {
    const roleIds = form.roleIds.includes(id) ? form.roleIds.filter((item) => item !== id) : [...form.roleIds, id];
    const permissions = [...new Set(roleIds.flatMap((roleId) => rolesById.get(roleId)?.permissions ?? []))];
    return { ...form, roleIds, permissions };
  });
  const toggleInvitePermission = (permission: string) => setInviteForm((form) => ({ ...form, permissions: form.permissions.includes(permission) ? form.permissions.filter((item) => item !== permission) : [...form.permissions, permission] }));

  const tabs: Array<[Tab, string]> = [['members', 'Members'], ['invitations', 'Invitations'], ['roles', 'Roles & permissions']];
  const userStatuses = tab === 'invitations' ? ['invited', 'accepted', 'disabled'] : ['accepted', 'active', 'suspended', 'disabled'];
  return <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#0C5A69]">Platform administration</p><h1 className="mt-2 text-3xl font-bold">Team Management</h1><p className="mt-1 text-sm text-slate-500">Invite admin users and manage their platform access.</p></div>{manageUsers && <button className={primary} onClick={() => { setInviteForm({ name: '', email: '', roleIds: [], permissions: [] }); setModal('invite'); }}><MailPlus size={17} /> Invite user</button>}</header>
    <div className="grid gap-3 sm:grid-cols-3">{tabs.map(([id, label]) => <button key={id} onClick={() => { setTab(id); setStatus(''); }} className={`rounded-xl border p-4 text-left font-semibold ${tab === id ? 'border-[#0C5A69] bg-[#e7f2f4] text-[#0C5A69]' : 'bg-white'}`}>{label}</button>)}</div>
    <section className="overflow-hidden rounded-xl border bg-white"><div className="flex flex-wrap gap-3 border-b p-4"><label className="relative flex-1"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} className={`${input} !mt-0 pl-10`} placeholder={`Search ${tab}...`} /></label>{tab !== 'roles' && <select className={`${input} !mt-0 w-44`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{userStatuses.map((value) => <option key={value} value={value}>{value}</option>)}</select>}{tab === 'roles' && manageRoles && <button className={primary} onClick={() => { setEditingRole(null); setRoleForm({ name: '', description: '', permissions: [] }); setModal('role'); }}><Plus size={16} /> Create role</button>}</div>{error && <p className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {tab === 'members' && <Table headers={['User', 'Work email', 'Roles', 'Status']} rows={members.map((member) => [member.displayName, member.email, roleNames(member.roleIds), member.status])} />}
      {tab === 'invitations' && <Table headers={['User', 'Work email', 'Roles', 'Status', 'Delivery', 'Actions']} rows={invitations.map((invite) => [invite.displayName, invite.email, roleNames(invite.roleIds), invite.status, invite.invitationDeliveryStatus ?? '—', invite.status === 'invited' && <div className="flex gap-3"><button title="Resend invitation" onClick={() => void adminApi.resendInvitation(invite.id).then(() => { toast.success('Invitation resent.'); refresh(); }).catch((requestError) => toast.error(adminError(requestError)))}><RefreshCw size={16} /></button>{manageUsers && <button className="text-red-600" title="Revoke invitation" onClick={() => void revoke(invite.id)}><Trash2 size={16} /></button>}</div>])} />}
      {tab === 'roles' && <Table headers={['Role', 'Description', 'Permissions', 'Type', 'Actions']} rows={roles.map((role) => [role.name, role.description || '—', `${role.permissions.length} permissions`, role.isSystem ? 'System' : 'Custom', role.isSystem || !manageRoles ? 'Locked' : <div className="flex gap-3"><button title="Edit role" onClick={() => { setEditingRole(role); setRoleForm({ name: role.name, description: role.description || '', permissions: [...role.permissions] }); setModal('role'); }}><Pencil size={16} /></button><button title="Delete role" className="text-red-600" onClick={() => void adminApi.deleteAccessRole(role.id).then(() => { toast.success('Role deleted.'); refresh(); }).catch((requestError) => toast.error(adminError(requestError)))}><Trash2 size={16} /></button></div>])} />}
      {meta && <div className="flex items-center justify-between border-t p-4 text-sm"><span>{meta.total} results · Page {page} of {Math.max(1, meta.totalPages)}</span><div className="flex gap-2"><button className={secondary} disabled={!meta.hasPrev} onClick={() => setPage(page - 1)}>Previous</button><button className={secondary} disabled={!meta.hasNext} onClick={() => setPage(page + 1)}>Next</button></div></div>}</section>
    {modal === 'invite' && <Modal title="Invite a user" onClose={() => setModal(null)}><form onSubmit={submitInvite} className="space-y-5 p-6"><p className="-mt-2 text-sm text-slate-500">A secure single-use password setup link will be emailed.</p><label className="block text-sm font-semibold">Full name<input required value={inviteForm.name} onChange={(event) => setInviteForm({ ...inviteForm, name: event.target.value })} className={input} /></label><label className="block text-sm font-semibold">Work email<input required type="email" value={inviteForm.email} onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })} className={input} /></label><section><h3 className="text-sm font-bold">Roles</h3><p className="mt-1 text-xs text-slate-500">Select one or more roles for this user.</p><div className="mt-3 space-y-2 rounded-xl border p-3">{roles.filter((role) => !role.isSystem).map((role) => <label key={role.id} className="flex gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={inviteForm.roleIds.includes(role.id)} onChange={() => toggleInviteRole(role.id)} /><span><b className="block">{role.name}</b><span className="text-xs text-slate-500">{role.permissions.length} permissions</span></span></label>)}{roles.filter((role) => !role.isSystem).length === 0 && <p className="text-sm text-slate-500">Create a custom role before inviting a user.</p>}</div></section><section><div className="flex justify-between"><h3 className="text-sm font-bold">Permissions</h3><span className="text-xs text-slate-500">{inviteForm.permissions.length} selected</span></div><p className="mt-1 text-xs text-slate-500">Role permissions are selected by default. You can add or remove access for this user.</p><div className="mt-3 grid max-h-72 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">{permissions.map((permission) => <label key={permission} className="flex gap-2 rounded border p-2 text-xs"><input type="checkbox" checked={inviteForm.permissions.includes(permission)} onChange={() => toggleInvitePermission(permission)} /><span>{humanize(permission)}</span></label>)}</div></section><div className="flex justify-end gap-2 border-t pt-5"><button type="button" className={secondary} onClick={() => setModal(null)}>Cancel</button><button className={primary}>Send invitation</button></div></form></Modal>}
    {modal === 'role' && <Modal title={editingRole ? 'Edit access role' : 'Create access role'} onClose={() => { setEditingRole(null); setModal(null); }}><form onSubmit={submitRole} className="space-y-5 p-6"><label className="block text-sm font-semibold">Role name<input required value={roleForm.name} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })} className={input} /></label><label className="block text-sm font-semibold">Description<input value={roleForm.description} onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })} className={input} /></label><section><div className="flex justify-between"><h3 className="text-sm font-bold">Admin permissions</h3><span className="text-xs text-slate-500">{roleForm.permissions.length} selected</span></div><div className="mt-3 grid max-h-80 gap-2 overflow-y-auto rounded-xl border p-3 sm:grid-cols-2">{permissions.map((permission) => <label key={permission} className="flex gap-2 rounded border p-2 text-xs"><input type="checkbox" checked={roleForm.permissions.includes(permission)} onChange={() => togglePermission(permission)} /><span>{humanize(permission)}</span></label>)}</div></section><div className="flex justify-end gap-2 border-t pt-5"><button type="button" className={secondary} onClick={() => { setEditingRole(null); setModal(null); }}>Cancel</button><button className={primary}>{editingRole ? 'Save changes' : 'Create role'}</button></div></form></Modal>}
  </main>;
}
