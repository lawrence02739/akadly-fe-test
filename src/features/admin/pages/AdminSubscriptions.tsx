import { useEffect, useState, type FormEvent } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi, adminError, type AdminPlanModule, type AdminSubscription, type Pagination, type SubscriptionPayload, type SubscriptionQuery } from '../api/admin.api';
import { useAdminSession } from '../AdminSession';

const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0C5A69]/25';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#084855] disabled:opacity-50';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';
const money = (item: AdminSubscription) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency }).format(item.price);

function Heading({ title, description }: { title: string; description: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-widest text-[#0C5A69]">Platform administration</p><h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message} {retry && <button type="button" className="ml-2 font-semibold underline" onClick={retry}>Retry</button>}</p>;
}

export function SubscriptionLayout() {
  return <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8"><Outlet /></main>;
}

export function SubscriptionList() {
  const { can } = useAdminSession();
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | AdminSubscription['status']>('');
  const [interval, setInterval] = useState<'' | AdminSubscription['interval']>('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => {
    if (!can('subscription:read')) return;
    let active = true;
    const [sortBy, sortOrder] = sort.split(':') as [SubscriptionQuery['sortBy'], SubscriptionQuery['sortOrder']];
    adminApi.subscriptions({ page, pageSize, search: search || undefined, status: status || undefined, interval: interval || undefined, sortBy, sortOrder })
      .then(({ items: result, pagination: meta }) => { if (active) { setItems(result); setPagination(meta); setError(''); } })
      .catch((cause) => { if (active) { setItems([]); setPagination(null); setError(adminError(cause)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, pageSize, search, status, interval, sort, revision, can]);

  const deleteItem = async (item: AdminSubscription) => {
    if (!window.confirm(`Deactivate ${item.name}? Existing tenant assignments will be preserved.`)) return;
    setDeletingId(item.id); setError('');
    try { await adminApi.deleteSubscription(item.id); toast.success('Subscription deactivated.'); if (items.length === 1 && page > 1) setPage(page - 1); else setRevision((value) => value + 1); }
    catch (cause) { setError(adminError(cause)); }
    finally { setDeletingId(null); }
  };

  return <>
    <div className="flex flex-wrap items-end justify-between gap-4"><Heading title="Subscriptions" description="Manage subscription plans, pricing and availability." />{can('subscription:create') && <Link className={primary} to="new"><Plus size={18} /> Create subscription</Link>}</div>
    {!can('subscription:read') ? <ErrorNotice message="You do not have permission to view subscriptions." /> : <>
      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4"><label className="relative min-w-52 flex-1"><Search size={18} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Search subscriptions" className={`${input} !mt-0 pl-10`} placeholder="Search name, code or description" maxLength={120} value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></label><select aria-label="Filter status" className={`${input} !mt-0 sm:w-40`} value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><select aria-label="Filter billing interval" className={`${input} !mt-0 sm:w-44`} value={interval} onChange={(event) => { setInterval(event.target.value as typeof interval); setPage(1); }}><option value="">All billing cycles</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select><select aria-label="Sort subscriptions" className={`${input} !mt-0 sm:w-44`} value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="createdAt:desc">Newest first</option><option value="createdAt:asc">Oldest first</option><option value="name:asc">Name A-Z</option><option value="price:asc">Lowest price</option><option value="price:desc">Highest price</option></select></div>
      {error && <ErrorNotice message={error} retry={() => setRevision((value) => value + 1)} />}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Plan</th><th className="p-4">Price</th><th className="p-4">Billing</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="p-4"><Link to={item.id} className="font-semibold text-[#0C5A69] hover:underline">{item.name}</Link><div className="text-xs text-slate-500">{item.code}</div></td><td className="p-4 font-semibold">{money(item)}</td><td className="p-4 capitalize">{item.interval}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span></td><td className="p-4 text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</td><td className="p-4"><div className="flex justify-end gap-3">{can('subscription:update') && <Link aria-label={`Edit ${item.name}`} title="Edit" className="text-slate-600 hover:text-[#0C5A69]" to={`${item.id}/edit`}><Pencil size={17} /></Link>}{can('subscription:delete') && <button type="button" disabled={deletingId === item.id} aria-label={`Deactivate ${item.name}`} title="Deactivate" className="text-slate-500 hover:text-red-600 disabled:opacity-50" onClick={() => void deleteItem(item)}><Trash2 size={17} /></button>}</div></td></tr>)}</tbody></table>{loading && <div className="p-10 text-center text-slate-500">Loading subscriptions...</div>}{!loading && !error && items.length === 0 && <div className="p-10 text-center text-slate-500">No subscriptions found.</div>}</div>
      {pagination && <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600"><span>{pagination.total} result{pagination.total === 1 ? '' : 's'} · Page {pagination.page} of {Math.max(1, pagination.totalPages)}</span><div className="flex items-center gap-2"><label htmlFor="subscription-page-size">Rows</label><select id="subscription-page-size" className="rounded-lg border border-slate-300 bg-white p-2" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select><button type="button" className={secondary} disabled={!pagination.hasPrev || loading} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button><button type="button" className={secondary} disabled={!pagination.hasNext || loading} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></div>}
    </>}
  </>;
}

export function SubscriptionDetail() {
  const { id } = useParams();
  const { can } = useAdminSession();
  const navigate = useNavigate();
  const [item, setItem] = useState<AdminSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!id || !can('subscription:read')) return;
    let active = true;
    adminApi.subscription(id).then((result) => { if (active) { setItem(result); setError(''); } })
      .catch((cause) => { if (active) { setItem(null); setError(adminError(cause)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, revision, can]);
  const deleteItem = async () => {
    if (!id || !item || !window.confirm(`Deactivate ${item.name}? Existing tenant assignments will be preserved.`)) return;
    setDeleting(true); setError('');
    try { await adminApi.deleteSubscription(id); toast.success('Subscription deactivated.'); navigate('/admin/subscriptions'); }
    catch (cause) { setError(adminError(cause)); }
    finally { setDeleting(false); }
  };
  const limit = (value: number | null) => value === null ? 'Unlimited' : value.toLocaleString();
  return <><Link to="/admin/subscriptions" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C5A69]"><ArrowLeft size={17} /> All subscriptions</Link>{!can('subscription:read') ? <ErrorNotice message="You do not have permission to view subscriptions." /> : loading ? <p className="text-slate-500">Loading subscription...</p> : item ? <><div className="flex flex-wrap items-start justify-between gap-4"><Heading title={item.name} description={item.description || item.code} /><div className="flex gap-2">{can('subscription:update') && <Link to="edit" className={secondary}><Pencil size={16} /> Edit</Link>}{can('subscription:delete') && <button type="button" disabled={deleting} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50" onClick={() => void deleteItem()}><Trash2 size={16} /> Deactivate</button>}</div></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-6"><CreditCard className="text-[#0C5A69]" /><p className="mt-5 text-sm text-slate-500">Price</p><p className="text-2xl font-bold">{money(item)} <span className="text-base font-normal text-slate-500">/{item.interval === 'monthly' ? 'month' : 'year'}</span></p><p className="mt-4 text-sm">Status: <span className="font-semibold capitalize">{item.status}</span></p></div><div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Plan details</h2><p className="mt-4 text-sm text-slate-600">Code: {item.code}</p><p className="mt-2 text-sm text-slate-600">Created: {new Date(item.createdAt).toLocaleDateString()}</p></div></div><div className="grid gap-4 lg:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Allowed modules</h2>{item.allowedModules.length ? <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-600">{item.allowedModules.map((module) => <li key={module}>{module}</li>)}</ul> : <p className="mt-3 text-sm text-slate-500">No modules are enabled.</p>}</div><div className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Plan limits</h2><dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm"><div><dt className="text-slate-500">Users</dt><dd className="font-semibold">{limit(item.userLimit)}</dd></div><div><dt className="text-slate-500">Students</dt><dd className="font-semibold">{limit(item.studentLimit)}</dd></div><div><dt className="text-slate-500">Content</dt><dd className="font-semibold">{limit(item.contentLimit)}</dd></div><div><dt className="text-slate-500">Courses</dt><dd className="font-semibold">{limit(item.courseLimit)}</dd></div></dl></div></div></> : null}{error && <ErrorNotice message={error} retry={() => { setLoading(true); setRevision((value) => value + 1); }} />}</>;
}

const blankDraft: SubscriptionPayload = { name: '', code: '', description: '', price: 0, currency: 'INR', interval: 'monthly', status: 'active', isPopular: false, allowedModules: [], userLimit: null, studentLimit: null, contentLimit: null, courseLimit: null };
export function SubscriptionForm({ edit = false }: { edit?: boolean }) {
  const { id } = useParams();
  const { can } = useAdminSession();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<SubscriptionPayload>(blankDraft);
  const [allowedModulesText, setAllowedModulesText] = useState('');
  const [moduleCatalog, setModuleCatalog] = useState<AdminPlanModule[]>([]);
  const [loading, setLoading] = useState(edit);
  const [loadedItem, setLoadedItem] = useState(!edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!edit || !id || !can('subscription:update')) return;
    let active = true;
    adminApi.subscription(id).then((item) => { if (active) { setDraft({ name: item.name, code: item.code, description: item.description, price: item.price, currency: item.currency, interval: item.interval, status: item.status, isPopular: item.isPopular ?? false, allowedModules: item.allowedModules, userLimit: item.userLimit, studentLimit: item.studentLimit, contentLimit: item.contentLimit, courseLimit: item.courseLimit }); setAllowedModulesText(item.allowedModules.join('\n')); setLoadedItem(true); setError(''); } })
      .catch((cause) => { if (active) { setLoadedItem(false); setError(adminError(cause)); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [edit, id, revision, can]);
  useEffect(() => { adminApi.subscriptionModules().then(setModuleCatalog).catch((cause) => setError(adminError(cause))); }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    const allowedModules = [...new Set(allowedModulesText.split('\n').map((module) => module.trim()).filter(Boolean))];
    if (allowedModules.length > 50 || allowedModules.some((module) => module.length > 100)) { setError('Use no more than 50 module keys, each up to 100 characters.'); return; }
    if (draft.name.trim().length < 2) { setError('Plan name must contain at least 2 characters.'); return; }
    setSaving(true);
    try {
      const payload = { ...draft, name: draft.name.trim(), code: draft.code.trim().toLowerCase(), description: draft.description.trim(), allowedModules };
      const saved = edit && id ? await adminApi.updateSubscription(id, payload) : await adminApi.createSubscription(payload);
      toast.success(edit ? 'Subscription updated.' : 'Subscription created.');
      navigate(`/admin/subscriptions/${saved.id}`);
    } catch (cause) { setError(adminError(cause)); }
    finally { setSaving(false); }
  };
  const allowed = can(edit ? 'subscription:update' : 'subscription:create');
  const setLimit = (key: 'userLimit' | 'studentLimit' | 'contentLimit' | 'courseLimit', value: string) => setDraft({ ...draft, [key]: value === '' ? null : Number(value) });
  const selectedModules = [...new Set(allowedModulesText.split('\n').map((module) => module.trim()).filter(Boolean))];
  const setSelectedModules = (modules: string[]) => setAllowedModulesText(modules.join('\n'));
  return <><Link to={edit && id ? `/admin/subscriptions/${id}` : '/admin/subscriptions'} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C5A69]"><ArrowLeft size={17} /> Back</Link><Heading title={edit ? 'Edit subscription' : 'Create subscription'} description="Configure the plan shown in the admin catalog." />{!allowed ? <ErrorNotice message="You do not have permission to manage subscriptions." /> : loading ? <p className="text-slate-500">Loading subscription...</p> : !loadedItem ? <ErrorNotice message={error || 'Subscription could not be loaded.'} retry={() => { setLoading(true); setRevision((value) => value + 1); }} /> : <form onSubmit={submit} className="max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Plan name<input required minLength={2} maxLength={100} className={input} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Growth" /></label><label className="text-sm font-medium">Unique code<input required minLength={2} maxLength={50} pattern="[a-z0-9][a-z0-9-]*[a-z0-9]" title="2-50 lowercase letters, numbers or hyphens; start and end with a letter or number" className={input} value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toLowerCase() })} placeholder="growth" /></label></div><label className="block text-sm font-medium">Description<textarea rows={2} maxLength={500} className={input} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-medium">Price<input required min={0} step="0.01" type="number" className={input} value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label><label className="text-sm font-medium">Currency<select className={input} value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value as SubscriptionPayload['currency'] })}><option value="INR">INR</option><option value="USD">USD</option></select></label><label className="text-sm font-medium">Billing cycle<select className={input} value={draft.interval} onChange={(event) => setDraft({ ...draft, interval: event.target.value as SubscriptionPayload['interval'] })}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></label><label className="text-sm font-medium">Status<select className={input} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as SubscriptionPayload['status'] })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="flex items-center gap-3 self-end rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium"><input type="checkbox" className="h-4 w-4 accent-[#0C5A69]" checked={draft.isPopular} onChange={(event) => setDraft({ ...draft, isPopular: event.target.checked })} /> Mark as popular</label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">User limit <span className="font-normal text-slate-500">(blank = unlimited)</span><input min={0} step={1} type="number" className={input} value={draft.userLimit ?? ''} onChange={(event) => setLimit('userLimit', event.target.value)} /></label><label className="text-sm font-medium">Student limit <span className="font-normal text-slate-500">(blank = unlimited)</span><input min={0} step={1} type="number" className={input} value={draft.studentLimit ?? ''} onChange={(event) => setLimit('studentLimit', event.target.value)} /></label><label className="text-sm font-medium">Content limit <span className="font-normal text-slate-500">(blank = unlimited)</span><input min={0} step={1} type="number" className={input} value={draft.contentLimit ?? ''} onChange={(event) => setLimit('contentLimit', event.target.value)} /></label><label className="text-sm font-medium">Course limit <span className="font-normal text-slate-500">(blank = unlimited)</span><input min={0} step={1} type="number" className={input} value={draft.courseLimit ?? ''} onChange={(event) => setLimit('courseLimit', event.target.value)} /></label></div><ModulePicker catalog={moduleCatalog} selected={selectedModules} change={setSelectedModules} />{error && <ErrorNotice message={error} />}<div className="flex justify-end gap-2 border-t border-slate-100 pt-5"><Link className={secondary} to={edit && id ? `/admin/subscriptions/${id}` : '/admin/subscriptions'}>Cancel</Link><button disabled={saving} className={primary}>{saving ? 'Saving...' : edit ? 'Save changes' : 'Create subscription'}</button></div></form>}</>;
}

function ModulePicker({ catalog, selected, change }: { catalog: AdminPlanModule[]; selected: string[]; change: (modules: string[]) => void }) {
  const groups = catalog.reduce<Record<string, AdminPlanModule[]>>((all, item) => ({ ...all, [item.group]: [...(all[item.group] ?? []), item] }), {});
  const toggle = (key: string) => change(selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key]);
  return <section><div className="mb-3 flex justify-between"><div><h3 className="text-sm font-semibold">Allowed modules</h3><p className="text-xs text-slate-500">Choose the tenant portal modules included in this plan. Each card lists its available permissions.</p></div><span className="text-xs font-semibold text-[#0C5A69]">{selected.length} selected</span></div><div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-slate-200 p-3">{Object.entries(groups).map(([group, modules]) => <div key={group}><b className="text-xs uppercase text-slate-500">{group}</b><div className="mt-2 grid gap-2 sm:grid-cols-2">{modules.map((module) => <label key={module.key} className={`cursor-pointer rounded-lg border p-3 text-sm ${selected.includes(module.key) ? 'border-[#0C5A69] bg-[#e7f2f4]' : 'border-slate-200'}`}><span className="flex gap-2"><input type="checkbox" checked={selected.includes(module.key)} onChange={() => toggle(module.key)} /><span><b className="block capitalize">{module.label}</b><span className="text-xs text-slate-500">{module.description}</span></span></span><span className="mt-2 block text-xs text-slate-500">Permissions: {module.permissions.join(', ')}</span></label>)}</div></div>)}{!catalog.length && <p className="p-2 text-sm text-slate-500">Loading module permissions…</p>}</div></section>;
}
