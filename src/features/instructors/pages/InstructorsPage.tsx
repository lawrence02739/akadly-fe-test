import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, Mail, Plus, Search, X, RefreshCw, ShieldCheck, Ban, Pencil, Archive, Trash2, RotateCcw, Loader2, FilterX } from 'lucide-react';
import { instructorsApi, instructorError, instructorTypeLabels, type Instructor } from '../api/instructors.api';
import { teamApi, type PaginationMeta } from '../../team/api/team.api';

const input = 'rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600';
const labels: Record<Instructor['status'], string> = { active: 'Active', invited: 'Invited', suspended: 'Suspended', disabled: 'Disabled', draft: 'Draft' };
function engagement(row: Instructor) {
  const profile = row.instructorProfile;
  const dates = [profile.employment.startDate, profile.employment.endDate].filter(Boolean).join(' - ');
  return [dates, profile.availability ? `${profile.availability.requiredMinutesPerWeek / 60} hrs/week` : ''].filter(Boolean).join(' - ') || 'Ongoing';
}
function lastActive(value: string | null) {
  return value ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'Not activated';
}
function InstructorDialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} aria-labelledby="instructor-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-0 shadow-xl backdrop:bg-slate-950/45">
    <header className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 id="instructor-dialog-title" className="text-lg font-bold">{title}</h2><button disabled={busy} onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 hover:bg-slate-50 disabled:opacity-40"><X size={18} /></button></header>
    <div className="p-6">{children}</div>
  </dialog>;
}
type Operation = 'send' | 'revoke' | 'activate' | 'suspend' | 'archive' | 'restore' | 'permanent';
export default function InstructorsPage({ archived = false }: { archived?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const canManage = !!(currentUser?.isOwner || currentUser?.permissions?.includes('member:manage'));
  const [confirmation, setConfirmation] = useState<{ row: Instructor; operation: Operation } | null>(null);
  const [actionError, setActionError] = useState('');
  const [optionsError, setOptionsError] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<Instructor[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<string>((location.state as { notice?: string } | null)?.notice ?? '');
  useEffect(() => { let active = true; void instructorsApi.options().then(options => { if (active) { setSpecialties(options.specialties); setOptionsError(''); } }).catch(reason => { if (active) setOptionsError(instructorError(reason)); }); return () => { active = false; }; }, [refresh, archived]);
  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoading(true); setError('');
      void instructorsApi.list({ page, pageSize, view: archived ? 'archived' : 'active', ...(search ? { search } : {}), ...(subject ? { specialty: subject } : {}), ...(status ? { status } : {}), ...(type ? { type } : {}) })
        .then(result => { if (active) { if (page > Math.max(1, result.meta.totalPages)) { setPage(Math.max(1, result.meta.totalPages)); return; } setRows(result.data); setMeta(result.meta); } })
        .catch(reason => { if (active) setError(instructorError(reason)); })
        .finally(() => { if (active) setLoading(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [page, pageSize, search, subject, status, type, refresh, archived]);
  async function action(row: Instructor, operation: Operation) {
    if (busy || !canManage) return;
    setBusy(true); setActionError(''); setNotice('');
    try {
      if (operation === 'send') {
        const result = await teamApi.resend(row.id);
        setNotice(result.deliveryStatus === 'failed' ? 'Email delivery failed. Retry when the mail provider is available.' : 'Invitation sent.');
      } else if (operation === 'archive') { await instructorsApi.archive(row.id); setNotice('Instructor moved to archive.'); }
      else if (operation === 'restore') { await instructorsApi.restore(row.id); setNotice('Instructor restored.'); }
      else if (operation === 'permanent') { await instructorsApi.deleteArchived(row.id); setNotice('Archived instructor deleted.'); }
      else if (operation === 'revoke') { await teamApi.revoke(row.id); setNotice('Invitation revoked.'); }
      else { await teamApi.status(row.id, operation); setNotice(operation === 'activate' ? 'Instructor access restored.' : 'Instructor access suspended.'); }
      setConfirmation(null); setLoading(true); setRefresh(value => value + 1);
    } catch (reason) { setActionError(instructorError(reason)); }
    finally { setBusy(false); }
  }
  function changeStatus(value: string) { if (value === status && page === 1) return; setLoading(true); setStatus(value); setPage(1); }
  function clearFilters() { setSearch(''); setSubject(''); setStatus(''); setType(''); setPage(1); setLoading(true); setRefresh(value => value + 1); }
  function requestAction(row: Instructor, operation: Operation) { setActionError(''); setConfirmation({ row, operation }); }
  const hasFilters = !!(search.trim() || subject || status || type);
  return <div className="mx-auto max-w-7xl px-5 py-6">
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900">{archived ? 'Archived instructors' : 'Instructors Management'}</h1><p className="mt-1 text-sm text-slate-500">Manage teaching staff, engagement periods and access across your academy.</p></div><div className="flex gap-2"><Link to={archived ? "/partner/instructors" : "/partner/instructors/archive"} className="rounded-md border px-3 py-2 text-xs">{archived ? "All instructors" : "Archive"}</Link>{canManage && <Link to="/partner/instructors/new" className="inline-flex items-center gap-2 rounded-md bg-[#0C5A69] px-3 py-2 text-xs font-semibold text-white"><Plus size={14} />Add Instructor</Link>}</div></header>
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
      <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2"><Search size={14} /><input aria-label="Search instructors" value={search} maxLength={120} onChange={event => { setLoading(true); setSearch(event.target.value); setPage(1); }} placeholder="Search name or email..." className="w-44 text-xs outline-none" /></label>
      <select aria-label="Filter specialty" value={subject} onChange={event => { setLoading(true); setSubject(event.target.value); setPage(1); }} className={input}><option value="">All specialties</option>{specialties.map(value => <option key={value} value={value}>{value}</option>)}</select>
      <select aria-label="Filter status" value={status} onChange={event => changeStatus(event.target.value)} className={input}><option value="">All statuses</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select aria-label="Filter instructor type" value={type} onChange={event => { setLoading(true); setType(event.target.value); setPage(1); }} className={input}><option value="">All instructor types</option>{Object.entries(instructorTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <div role="group" aria-label="Instructor status" className="flex flex-wrap rounded-md bg-slate-50 p-1">{[['', 'All instructors'], ['active', 'Active instructor'], ['invited', 'Invited'], ['suspended', 'Suspended'], ['draft', 'Drafts'], ['disabled', 'Disabled']].map(([value, label]) => <button key={value} aria-pressed={status === value} onClick={() => changeStatus(value)} className={`rounded px-3 py-2 text-xs ${status === value ? 'bg-[#0C5A69] font-semibold text-white' : 'text-slate-600'}`}>{label}</button>)}</div>
    </div>
    {hasFilters && <div className="mb-4 flex items-center gap-3 text-xs text-slate-500"><span>Filters applied</span><button onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-[#0C5A69]"><FilterX size={14} />Clear filters</button></div>}
    {optionsError && <p role="alert" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Specialty options: {optionsError} <button onClick={() => { setOptionsError(''); setRefresh(value => value + 1); }} className="underline">Retry</button></p>}
    {actionError && !confirmation && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
    {notice && <p role="status" className="mb-3 rounded-md bg-sky-50 p-3 text-sm text-sky-800">{notice}</p>}
    {error && <div role="alert" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error} <button onClick={() => setRefresh(value => value + 1)} className="ml-3 underline">Retry</button></div>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white" aria-busy={loading}>
      <table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-slate-50 text-[11px] font-semibold text-slate-600"><tr>{['Instructor / email', 'Specialty', 'Courses', 'Learners', 'Last active (IST)', 'Instructor type', 'Status', 'Actions'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{!loading && !error && rows.map(row => <tr key={row.id} className="hover:bg-slate-50">
        <td className="px-4 py-4"><p className="font-semibold text-slate-900">{row.name}</p><p className="mt-1 text-[10px] text-slate-500">{row.email}</p></td>
        <td className="px-4 py-4">{row.instructorProfile.specialty}</td><td className="px-4 py-4">{row.courseCount}{row.plannedCourseCount > 0 && <span className="block text-slate-500">{row.plannedCourseCount} planned</span>}</td><td className="px-4 py-4">{row.learnerCount}</td>
        <td className="px-4 py-4 text-slate-600">{lastActive(row.lastActiveAt)}</td><td className="px-4 py-4"><p className="font-semibold">{instructorTypeLabels[row.instructorProfile.employment.type]}</p><p className="mt-1 text-[10px] text-slate-500">{engagement(row)}</p></td>
        <td className="px-4 py-4"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : row.status === 'invited' || row.status === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{labels[row.status]}</span>{row.deliveryStatus === 'failed' && <p className="mt-1 text-red-600">Email failed</p>}</td>
        <td className="px-4 py-4"><div className="flex gap-1"><button aria-label={`View ${row.name}`} disabled={busy} title="View instructor" onClick={() => navigate(`/partner/instructors/${row.id}`)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 text-[#0C5A69]"><Eye size={13} /></button>{canManage && !archived && (row.status === 'invited' || row.status === 'draft') && <button disabled={busy} aria-label={`Send invitation to ${row.name}`} onClick={() => { requestAction(row, 'send'); }} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 text-[#0C5A69]">{row.status === 'draft' ? <Mail size={13} /> : <RefreshCw size={13} />}</button>}{canManage && !archived && (row.status === 'active' || row.status === 'suspended') && <button disabled={busy} aria-label={`${row.status === 'active' ? 'Suspend' : 'Restore'} ${row.name}`} onClick={() => { requestAction(row, row.status === 'active' ? 'suspend' : 'activate'); }} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 text-[#0C5A69]">{row.status === 'active' ? <Ban size={13} /> : <ShieldCheck size={13} />}</button>}{canManage && !archived && row.status === 'invited' && <button disabled={busy} aria-label={`Revoke invitation for ${row.name}`} onClick={() => { requestAction(row, 'revoke'); }} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 text-[#0C5A69]"><X size={13} /></button>}{canManage && (!archived ? <><Link aria-label={`Edit ${row.name}`} to={`/partner/instructors/${row.id}/edit`} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Pencil size={13} /></Link><button disabled={busy} aria-label={`Archive ${row.name}`} onClick={() => { requestAction(row, 'archive'); }} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><Archive size={13} /></button></> : <><button disabled={busy} aria-label={`Restore ${row.name}`} onClick={() => { requestAction(row, 'restore'); }} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40"><RotateCcw size={13} /></button><button disabled={busy} aria-label={`Permanently delete ${row.name}`} onClick={() => { requestAction(row, 'permanent'); }} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 disabled:opacity-40 text-red-600"><Trash2 size={13} /></button></>)}</div></td>
      </tr>)}</tbody></table>
      {loading && <p role="status" className="p-8 text-center text-sm text-slate-500"><Loader2 size={18} className="mr-2 inline animate-spin" />Loading instructors...</p>}
      {!loading && !error && !rows.length && <p className="p-8 text-center text-sm text-slate-500">{hasFilters ? 'No instructors match these filters.' : archived ? 'No archived instructors.' : 'No instructors yet. Add your first instructor to get started.'}</p>}
      {meta && !error && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><div className="flex flex-wrap items-center gap-3"><label>Rows per page <select aria-label="Rows per page" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); setLoading(true); }} className={input}>{[10,20,50,100].map(size => <option key={size} value={size}>{size}</option>)}</select></label><span>{meta.total} instructors | Page {meta.page} of {Math.max(1, meta.totalPages)}</span></div><div className="flex gap-2"><button disabled={loading || !meta.hasPrev} onClick={() => { setLoading(true); setPage(value => value - 1); }} className={`${input} disabled:opacity-40`}>Previous</button><button disabled={loading || !meta.hasNext} onClick={() => { setLoading(true); setPage(value => value + 1); }} className={`${input} disabled:opacity-40`}>Next</button></div></div>}
    </div>
    <aside className="mt-4 rounded-lg border border-sky-200 bg-white p-4 text-xs text-[#0C5A69]"><h2 className="font-semibold">Pending invitations are not active accounts</h2><p className="mt-1">Account setup requires accepting the email invitation. Saved drafts have no active login access. Planned assignments are shown separately from existing teaching assignments.</p></aside>
    {confirmation && <InstructorDialog title={confirmation.operation === 'permanent' ? 'Permanently delete instructor?' : `${confirmation.operation.charAt(0).toUpperCase() + confirmation.operation.slice(1)} instructor`} busy={busy} onClose={() => { setConfirmation(null); setActionError(''); }}>
      <p className="text-sm text-slate-600"><strong>{confirmation.row.name}</strong><br />{confirmation.row.email}</p>
      <p className="mt-4 text-sm text-slate-600">{confirmation.operation === 'permanent' ? 'This permanently removes the archived instructor profile. It cannot be restored. Batch assignments must be removed first.' : confirmation.operation === 'archive' ? 'This moves the instructor to Archive and disables their workspace access. You can restore them later.' : confirmation.operation === 'restore' ? 'This restores the previous account status. Subscription limits still apply.' : confirmation.operation === 'send' ? 'Send a new invitation email. The previous setup link will be replaced.' : confirmation.operation === 'revoke' ? 'This cancels the pending invitation and disables the account.' : confirmation.operation === 'suspend' ? 'This suspends workspace access until you restore it.' : 'This restores the suspended workspace access.'}</p>
      {actionError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
      <div className="mt-6 flex justify-end gap-3"><button disabled={busy} onClick={() => { setConfirmation(null); setActionError(''); }} className={input}>Cancel</button><button disabled={busy} onClick={() => { void action(confirmation.row, confirmation.operation); }} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${confirmation.operation === 'permanent' ? 'bg-red-600' : 'bg-[#0C5A69]'}`}>{busy ? 'Working...' : 'Confirm'}</button></div>
    </InstructorDialog>}

  </div>;
}
