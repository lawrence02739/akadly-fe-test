import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, adminError, type AdminSubscription, type AdminTenant, type Pagination, type TenantPayload } from '../api/admin.api';
import { useAdminSession } from '../AdminSession';

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0C5A69]/25';
const secondary = 'rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50';
const primary = 'rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084855] disabled:opacity-50';
const badge = (status: string) => status === 'active' ? 'bg-emerald-50 text-emerald-700' : status === 'suspended' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600';
const date = (value?: string) => value ? new Date(value).toLocaleDateString() : 'Ã¢â‚¬â€';

function CreateTenant({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<TenantPayload>({ fullName: '', email: '', organizationName: '', organizationAddress: '', description: '', planId: '', billingDate: '', dueDate: '', paymentStatus: 'due' });
  const [plans, setPlans] = useState<AdminSubscription[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    adminApi.subscriptions({ page: 1, pageSize: 100, status: 'active', sortBy: 'name', sortOrder: 'asc' })
      .then(({ items }) => setPlans(items))
      .catch((cause) => setError(adminError(cause)));
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      if (new Date(form.dueDate) < new Date(form.billingDate)) throw new Error('Due date must be on or after the billing date.');
      await adminApi.createTenant({ ...form, description: form.description?.trim() || undefined });
      toast.success('Tenant created. A password setup link was emailed to the owner.'); onCreated(); onClose();
    }
    catch (cause) { setError(adminError(cause)); }
    finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 overflow-auto bg-slate-900/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Register tenant"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 space-y-4">
    <div className="flex justify-between items-center"><div><h2 className="text-xl font-bold text-slate-900">Create tenant</h2><p className="text-sm text-slate-500">The owner will receive a secure link to set their password.</p></div><button type="button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <label className="block text-sm font-medium">Full name<input required maxLength={120} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputClass} /></label>
    <label className="block text-sm font-medium">Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></label>
    <label className="block text-sm font-medium">Organization name<input required maxLength={120} value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} className={inputClass} /></label>
    <label className="block text-sm font-medium">Organization location / address<textarea required maxLength={500} rows={2} value={form.organizationAddress} onChange={(e) => setForm({ ...form, organizationAddress: e.target.value })} className={inputClass} /></label>
    <label className="block text-sm font-medium">Description<textarea maxLength={500} rows={2} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></label>
    <label className="block text-sm font-medium">Subscription plan<select required value={form.planId} onChange={(e) => setForm({ ...form, planId: e.target.value })} className={inputClass}><option value="">Select an active plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} Ã¢â‚¬â€ {new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency }).format(plan.price)} / {plan.interval === 'monthly' ? 'month' : 'year'}</option>)}</select></label>
    <div className="grid sm:grid-cols-3 gap-4"><label className="block text-sm font-medium">Billing date<input required type="date" value={form.billingDate} onChange={(e) => setForm({ ...form, billingDate: e.target.value })} className={inputClass} /></label><label className="block text-sm font-medium">Payment due date<input required type="date" min={form.billingDate || undefined} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputClass} /></label><label className="block text-sm font-medium">Payment status<select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as TenantPayload['paymentStatus'] })} className={inputClass}><option value="due">Due</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option></select></label></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={secondary}>Cancel</button><button disabled={saving} className={primary}>{saving ? 'RegisteringÃ¢â‚¬Â¦' : 'Register tenant'}</button></div>
  </form></div>;
}

export default function AdminTenants() {
  const { can } = useAdminSession();
  const [items, setItems] = useState<AdminTenant[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => {
    if (!can('tenant:read')) return;
    let active = true;
    const [sortBy, sortOrder] = sort.split(':');
    adminApi.tenants({ page, pageSize: 20, search: search || undefined, status: status || undefined, sortBy, sortOrder })
      .then((result) => { if (active) { setItems(result.items); setPagination(result.pagination); setError(''); } })
      .catch((cause) => { if (active) setError(adminError(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, search, status, sort, revision, can]);
  return <div className="min-h-screen bg-[#f3f6f8]"><main className="mx-auto max-w-7xl px-5 sm:px-8 py-8 space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-[#0C5A69]">Workspace administration</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Tenants</h1><p className="mt-1 text-sm text-slate-500">Search, register and manage platform workspaces.</p></div>{can('tenant:create') && <button className={`${primary} flex items-center gap-2`} onClick={() => setCreateOpen(true)}><Plus size={18} /> Register tenant</button>}</div>
    {can('tenant:read') ? <><div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3"><div className="relative flex-1 min-w-52"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Search tenants" placeholder="Search name or slug" maxLength={120} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className={`${inputClass} pl-10`} /></div><select aria-label="Filter status" className={inputClass + ' sm:w-40'} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="archived">Archived</option></select><select aria-label="Sort tenants" className={inputClass + ' sm:w-48'} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="name:asc">Name AÃ¢â‚¬â€œZ</option><option value="name:desc">Name ZÃ¢â‚¬â€œA</option><option value="updatedAt:desc">Recently updated</option></select></div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Workspace</th><th className="p-4">Owner</th><th className="p-4">Plan</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((tenant) => <tr key={tenant.id} className="hover:bg-slate-50"><td className="p-4"><div className="font-semibold text-slate-900">{tenant.name}</div><div className="text-slate-500">{tenant.slug}</div></td><td className="p-4"><div>{tenant.owner.name}</div><div className="text-slate-500">{tenant.owner.email}</div></td><td className="p-4 capitalize">{tenant.plan}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tenant.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : tenant.paymentStatus === 'unpaid' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{tenant.paymentStatus}</span></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badge(tenant.status)}`}>{tenant.status}</span></td><td className="p-4">{date(tenant.createdAt)}</td><td className="p-4"><Link className="text-[#0C5A69] font-semibold hover:underline" to={`/admin/tenants/${tenant.id}`}>View details</Link></td></tr>)}</tbody></table>{loading && <p className="p-8 text-center text-slate-500">Loading tenantsÃ¢â‚¬Â¦</p>}{!loading && !error && items.length === 0 && <p className="p-8 text-center text-slate-500">No tenants found.</p>}{error && <p role="alert" className="p-6 text-center text-red-600">{error} <button onClick={() => setRevision((v) => v + 1)} className="underline">Retry</button></p>}</div>
      {pagination && <div className="flex items-center justify-between gap-3 text-sm text-slate-600"><span>{pagination.total} tenant{pagination.total === 1 ? '' : 's'} Ã‚Â· Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span><div className="flex gap-2"><button className={secondary} disabled={!pagination.hasPrev} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button><button className={secondary} disabled={!pagination.hasNext} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={18} /></button></div></div>}
    </> : <div className="rounded-xl bg-white border p-8 text-slate-600">You do not have permission to view tenants.</div>}
    {createOpen && <CreateTenant onClose={() => setCreateOpen(false)} onCreated={() => { setPage(1); setRevision((v) => v + 1); }} />}
  </main></div>;
}

export function AdminTenantDetails() {
  const { id } = useParams();
  const { can } = useAdminSession();
  const [tenant, setTenant] = useState<AdminTenant | null>(null);
  const [form, setForm] = useState({ name: '', ownerName: '', plan: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [settingsText, setSettingsText] = useState('{}');
  const load = useCallback(async () => {
    if (!id) return;
    try { const result = await adminApi.tenant(id); setTenant(result); setForm({ name: result.name, ownerName: result.owner.name, plan: result.plan }); setSettingsText(JSON.stringify(result.settings ?? {}, null, 2)); setError(''); }
    catch (cause) { setError(adminError(cause)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { if (can('tenant:read')) void load(); }, [can, load]);
  const save = async (event: FormEvent) => {
    event.preventDefault(); if (!id) return; setSaving(true); setError('');
    try {
      const settings: unknown = JSON.parse(settingsText);
      if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error('Settings must be a JSON object.');
      const result = await adminApi.updateTenant(id, { name: form.name.trim(), ownerName: form.ownerName.trim(), plan: form.plan.trim(), settings: settings as Record<string, unknown> });
      setTenant(result); setSettingsText(JSON.stringify(result.settings ?? {}, null, 2)); toast.success('Tenant updated.');
    }
    catch (cause) { setError(adminError(cause)); }
    finally { setSaving(false); }
  };
  const revokeOwnerInvitation = async () => {
    if (!id || !tenant || !window.confirm('Revoke this password setup link? The existing email link will stop working immediately.')) return;
    setSaving(true); setError('');
    try {
      await adminApi.revokeTenantOwnerInvitation(id);
      setTenant({ ...tenant, ownerInvitationStatus: 'revoked' });
      toast.success('Tenant owner invitation revoked.');
    } catch (cause) { setError(adminError(cause)); }
    finally { setSaving(false); }
  };  const changeStatus = async () => {
    if (!id || !tenant || !window.confirm(`${tenant.status === 'active' ? 'Suspend' : 'Activate'} ${tenant.name}?`)) return;
    setSaving(true); setError('');
    try { setTenant(await adminApi.setTenantStatus(id, tenant.status === 'active' ? 'suspend' : 'activate')); toast.success('Tenant status updated.'); }
    catch (cause) { setError(adminError(cause)); }
    finally { setSaving(false); }
  };
  return <div className="min-h-screen bg-[#f3f6f8]"><main className="mx-auto max-w-4xl px-5 sm:px-8 py-8"><Link to="/admin/tenants" className="inline-flex items-center gap-2 text-sm text-[#0C5A69] font-semibold"><ArrowLeft size={17} /> All tenants</Link>
    {loading ? <p className="mt-8 text-slate-500">Loading tenantÃ¢â‚¬Â¦</p> : !can('tenant:read') ? <p className="mt-8">Access restricted.</p> : tenant ? <><div className="flex items-center justify-between gap-3 mt-6"><div><h1 className="text-3xl font-bold text-slate-900">{tenant.name}</h1><p className="text-slate-500">{tenant.slug} Ã‚Â· Created {date(tenant.createdAt)}</p></div><span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${badge(tenant.status)}`}>{tenant.status}</span></div>
    <div className="mt-7 grid sm:grid-cols-2 gap-4"><div className="rounded-xl bg-white border border-slate-200 p-5"><p className="text-xs font-bold text-slate-500 uppercase">Owner</p><p className="mt-2 font-semibold">{tenant.owner.name}</p><p className="text-sm text-slate-600">{tenant.owner.email}</p><p className="mt-2 text-sm text-slate-600">Invitation: <span className="font-semibold capitalize">{tenant.ownerInvitationStatus}</span></p>{can('tenant:update') && tenant.ownerInvitationStatus === 'pending' && <button type="button" disabled={saving} onClick={revokeOwnerInvitation} className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Revoke password setup link</button>}</div><div className="rounded-xl bg-white border border-slate-200 p-5"><p className="text-xs font-bold text-slate-500 uppercase">Workspace</p><p className="mt-2">Plan: <strong>{tenant.plan}</strong></p><p className="mt-1 text-sm text-slate-600">Billing date: {date(tenant.billingDate ?? undefined)}</p><p className="mt-1 text-sm text-slate-600">Due date: {date(tenant.dueDate ?? undefined)}</p><p className="mt-1 text-sm text-slate-600">Payment: <span className="font-semibold capitalize">{tenant.paymentStatus}</span></p><p className="mt-1 text-sm text-slate-600">Last updated {date(tenant.updatedAt)}</p></div></div>
    {can('tenant:update') && <form onSubmit={save} className="mt-6 rounded-xl bg-white border border-slate-200 p-6 space-y-4"><h2 className="text-lg font-bold">Edit tenant</h2><div className="grid sm:grid-cols-2 gap-4"><label className="text-sm font-medium">Workspace name<input required minLength={2} maxLength={120} className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="text-sm font-medium">Owner name<input required minLength={2} maxLength={120} className={inputClass} value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></label></div><label className="block text-sm font-medium">Plan<input required maxLength={40} className={inputClass} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} /></label><label className="block text-sm font-medium">Settings (JSON object)<textarea spellCheck={false} rows={5} className={`${inputClass} font-mono`} value={settingsText} onChange={(e) => setSettingsText(e.target.value)} /></label><button className={primary} disabled={saving}>Save changes</button></form>}
    {can('tenant:suspend') && tenant.status !== 'archived' && <div className="mt-6 rounded-xl bg-white border border-slate-200 p-6 flex flex-wrap justify-between gap-4"><div><h2 className="font-bold">Workspace access</h2><p className="text-sm text-slate-500">{tenant.status === 'active' ? 'Suspend access to this workspace.' : 'Restore access to this workspace.'}</p></div><button disabled={saving} onClick={changeStatus} className={tenant.status === 'active' ? 'rounded-lg border border-amber-300 text-amber-800 px-4 py-2 font-semibold hover:bg-amber-50 disabled:opacity-50' : primary}>{tenant.status === 'active' ? 'Suspend tenant' : 'Activate tenant'}</button></div>}
    </> : null}{error && <p role="alert" className="mt-5 text-red-700">{error} <button onClick={() => void load()} className="underline">Retry</button></p>}
  </main></div>;
}
