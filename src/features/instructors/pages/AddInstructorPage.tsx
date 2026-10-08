import { useNavigate, useParams } from 'react-router-dom';
import { instructorsApi, instructorError, type InstructorTypeCode, type InstructorOptions, type CreateInstructor } from '../api/instructors.api';
import { listCourses } from '../../courses/api/courses.api';
import { listBatches, type BatchListItem } from '../../batches/api/batches.api';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';

type InstructorType = 'Full-time' | 'Part-time' | 'Contract-based' | 'Guest';
const types: InstructorType[] = ['Full-time', 'Part-time', 'Contract-based', 'Guest'];
const descriptions = ['Start date only', 'Start + weekly availability', 'Start + end dates', 'Time-limited engagement'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const blank = { name: '', email: '', phone: '', specialty: '', expertise: '', bio: '', start: '', end: '', note: '', availability: '16', course: '', cohort: '', role: 'Co-instructor', timezone: 'Asia/Kolkata' };
const input = 'mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0C5A69] focus:ring-2 focus:ring-teal-50';
function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) { return <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-xs text-slate-500">{description}</p>}<div className="mt-4">{children}</div></section>; }
export default function AddInstructorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [editLoading, setEditLoading] = useState(!!id);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [cohorts, setCohorts] = useState<BatchListItem[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [cohortsLoading, setCohortsLoading] = useState(true);
  const [assignmentRetry, setAssignmentRetry] = useState(0);
  const [assignmentError, setAssignmentError] = useState('');
  const [type, setType] = useState<InstructorType>('Full-time');
  const [form, setForm] = useState(blank);
  const [expertiseDraft, setExpertiseDraft] = useState('');
  const expertiseItems = form.expertise.split(/[,;\n]+/).map(value => value.trim()).filter(Boolean);
  const [options, setOptions] = useState<InstructorOptions | null>(null);
  const specialtyChoices = Array.from(new Set(['Frontend development', 'Backend development', 'UX design', 'Data analytics', 'Other', ...(form.specialty ? [form.specialty] : [])]));
  const [optionsError, setOptionsError] = useState('');
  const [optionsRetry, setOptionsRetry] = useState(0);
  const roleCode = form.role === 'Instructor' ? 'instructor' : 'co_instructor';
  const selectedRole = options?.roles.find(role => role.key === roleCode);
  useEffect(() => {
    let active = true;
    void instructorsApi.options().then(result => { if (active) setOptions(result); }).catch(error => { if (active) setOptionsError(instructorError(error)); });
    return () => { active = false; };
  }, [optionsRetry]);
  const [invite, setInvite] = useState(true);
  const verify = true;
  const [schedule, setSchedule] = useState(days.map(() => ({ enabled: false, start: '09:00', end: '17:00' })));
  const [message, setMessage] = useState('');
  const [review, setReview] = useState(false);
  useEffect(() => {
    if (!id) return;
    let active = true;
    void instructorsApi.get(id).then(record => {
      if (!active) return;
      if (record.archivedAt) { setEditError('Restore this instructor before editing.'); return; }
      const profile = record.instructorProfile;
      const titles: Record<InstructorTypeCode, InstructorType> = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract-based', guest: 'Guest' };
      setType(titles[profile.employment.type]);
      setForm({ ...blank, name: record.name, email: record.email, phone: record.phone, bio: record.bio, specialty: profile.specialty, expertise: profile.expertise ?? '', start: profile.employment.startDate ?? '', end: profile.employment.endDate ?? '', note: profile.employment.renewalNote ?? '', availability: String((profile.availability?.requiredMinutesPerWeek ?? 960) / 60), timezone: profile.availability?.timezone ?? blank.timezone, course: profile.initialAssignment?.courseId ?? '', cohort: profile.initialAssignment?.batchId ?? '', role: record.teachingRole === 'co_instructor' ? 'Co-instructor' : 'Instructor' });
      const time = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      setSchedule(days.map((_, index) => { const slot = profile.availability?.slots.find(item => item.day === index + 1); return slot ? { enabled: true, start: time(slot.startMinute), end: time(slot.endMinute) } : { enabled: false, start: '09:00', end: '17:00' }; }));
    }).catch(error => { if (active) setEditError(instructorError(error)); }).finally(() => { if (active) setEditLoading(false); });
    return () => { active = false; };
  }, [id]);
  useEffect(() => {
    let active = true;
    void listCourses().then((result: Array<{ id?: string; _id?: string; title: string }>) => {
      if (active) setCourses(result.map(course => ({ id: course.id ?? course._id ?? '', title: course.title })).filter(course => course.id));
    }).catch(() => { if (active) setAssignmentError('Could not load courses. Refresh to retry.'); }).finally(() => { if (active) setCoursesLoading(false); });
    return () => { active = false; };
  }, [assignmentRetry]);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const items: BatchListItem[] = [];
        let page = 1;
        while (active) {
          const result = await listBatches({ ...(form.course ? { courseId: form.course } : {}), view: 'active', page, pageSize: 100 });
          items.push(...result.items.filter(batch => batch.status === 'active' || batch.status === 'upcoming'));
          if (!result.pagination.hasNext) break;
          page += 1;
        }
        if (active) setCohorts(items);
      } catch { if (active) setAssignmentError('Could not load cohorts. Please retry.'); }
      finally { if (active) setCohortsLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [form.course, assignmentRetry]);

  const change = (key: keyof typeof blank, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  function collectExpertise(extra: string) {
    const entries = [...expertiseItems, ...extra.split(/[,;\n]+/).map(value => value.trim()).filter(Boolean)];
    const seen = new Set<string>();
    return entries.filter(value => { const key = value.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).join(', ');
  }
  function addExpertise(value = expertiseDraft) {
    const combined = collectExpertise(value);
    if (combined.length > 2000) { setMessage('Expertise must fit within 2,000 characters in total.'); return; }
    change('expertise', combined); setExpertiseDraft('');
  }
  const hours = schedule.reduce((sum, day) => { if (!day.enabled) return sum; const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3)); return sum + Math.max(0, minutes(day.end) - minutes(day.start)) / 60; }, 0);
  const timed = type === 'Guest' || type === 'Contract-based';
  function submit(event: FormEvent) { event.preventDefault(); if (timed && form.end < form.start) { setMessage('End date must be on or after the start date.'); return; } if (type === 'Part-time' && hours !== Number(form.availability)) { setMessage('Weekly schedule must match the required weekly availability.'); return; } setMessage(''); setReview(true); }
  async function persist(sendInvitation: boolean) {
    if (saving) return;
    if (!selectedRole) { setMessage('Wait for the instructor access policy to load before saving.'); return; }
    const element = document.getElementById('instructor-form') as HTMLFormElement | null;
    if (!element?.reportValidity()) return;
    if (timed && form.end < form.start) { setMessage('End date must be on or after the start date.'); return; }
    if (type === 'Part-time' && (hours !== Number(form.availability) || schedule.some(day => day.enabled && day.end <= day.start))) { setMessage('Weekly schedule must have valid times and match required availability.'); return; }
    const expertise = collectExpertise(expertiseDraft);
    if (expertise.length > 2000) { setMessage('Expertise must fit within 2,000 characters in total.'); return; }
    setSaving(true); setMessage('');
    const typeCodes: Record<InstructorType, InstructorTypeCode> = { 'Full-time': 'full_time', 'Part-time': 'part_time', 'Contract-based': 'contract', Guest: 'guest' };
    const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
    try {
      const payload: CreateInstructor = {
        name: form.name, email: form.email, phone: form.phone, bio: form.bio, teachingRole: roleCode, sendInvitation,
        instructorProfile: {
          specialty: form.specialty, ...(expertise ? { expertise } : {}),
          employment: { type: typeCodes[type], ...(form.start ? { startDate: form.start } : {}), ...(timed ? { endDate: form.end, renewalNote: form.note } : {}) },
          ...(type === 'Part-time' ? { availability: { timezone: form.timezone, requiredMinutesPerWeek: Math.round(Number(form.availability) * 60), slots: schedule.flatMap((day, index) => day.enabled ? [{ day: index + 1, startMinute: minutes(day.start), endMinute: minutes(day.end) }] : []) } } : {}),
          ...(form.course ? { initialAssignment: { courseId: form.course, ...(form.cohort ? { batchId: form.cohort } : {}), teachingRole: form.role === 'Instructor' ? 'instructor' as const : 'co_instructor' as const } } : {}),
        },
      };
      const result = id ? await instructorsApi.update(id, (({ sendInvitation: _send, ...profile }) => profile)(payload)) : await instructorsApi.create(payload);
      navigate('/partner/instructors', { state: { notice: id ? 'Instructor updated.' : result.deliveryStatus === 'failed' ? 'Instructor saved, but email delivery failed. Retry from the listing.' : sendInvitation ? 'Instructor invitation sent.' : 'Instructor draft saved. Send an invitation from the listing when ready.' } });
    } catch (error) { setMessage(instructorError(error)); }
    finally { setSaving(false); }
  }
  function saveDraft() { void persist(false); }

  if (editLoading) return <p role="status" className="p-6">Loading instructor...</p>;
  if (editError) return <div className="p-6"><p role="alert">{editError}</p><button onClick={() => navigate('/partner/instructors')}>Back to instructors</button></div>;
  return <div className="mx-auto max-w-7xl px-5 py-6 text-slate-900"><form id="instructor-form" onSubmit={submit}>
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">{id ? 'Edit Instructor' : type === 'Guest' ? 'Add Guest Instructor' : type === 'Part-time' ? 'Add Part-time Instructor' : 'Add Instructor'}</h1><p className="mt-1 text-sm text-slate-500">{type === 'Guest' || type === 'Part-time' ? 'Create a profile and invite an instructor.' : 'Create a profile and invite an instructor to your academy.'}</p></div><div className="flex gap-2"><button type="button" disabled={saving || !selectedRole} onClick={() => { navigate('/partner/instructors'); }} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold">Cancel</button>{!id && <button type="button" disabled={saving || !selectedRole} onClick={saveDraft} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold">Save draft</button>}<button disabled={saving || !selectedRole} className="rounded-md bg-[#0C5A69] px-4 py-2 text-xs font-semibold text-white">{id ? 'Review changes' : type === 'Guest' || type === 'Part-time' ? 'Review invitation' : 'Send invitation'}</button></div></header>
    {message && <p role="status" className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="space-y-4">
      <Card title="Identity & expertise" description="Required fields are marked with *. This profile has not been sent."><div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold">Full name *<input required value={form.name} onChange={e => change('name', e.target.value)} placeholder="Full name" autoComplete="name" className={input} /></label>
        <label className="text-xs font-semibold">Email address *<input readOnly={!!id} required type="email" value={form.email} onChange={e => change('email', e.target.value)} placeholder="name@example.com" autoComplete="email" className={input} /></label>
        <label className="text-xs font-semibold">Phone (optional)<input type="tel" value={form.phone} onChange={e => change('phone', e.target.value)} autoComplete="tel" className={input} /></label>
        <div className="text-xs font-semibold"><label htmlFor="instructor-specialty">Specialty *</label><select id="instructor-specialty" required disabled={saving} value={form.specialty} onChange={e => change('specialty', e.target.value)} className={input}><option value="">Select specialty</option>{specialtyChoices.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="text-xs font-semibold sm:col-span-2"><label htmlFor="instructor-expertise">Expertise</label><div className="mt-1.5 rounded-md border border-slate-200 bg-white p-3"><div className="mb-2 flex flex-wrap gap-2">{expertiseItems.map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-2 rounded-md bg-teal-50 px-2 py-1 text-xs text-[#0C5A69]">{item}<button type="button" disabled={saving} aria-label={`Remove expertise ${item}`} onClick={() => change('expertise', expertiseItems.filter((_, itemIndex) => itemIndex !== index).join(', '))}><X size={13} /></button></span>)}</div><div className="flex gap-2"><input id="instructor-expertise" aria-describedby="instructor-expertise-help" value={expertiseDraft} maxLength={2000} disabled={saving} onChange={e => setExpertiseDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addExpertise(); } }} onPaste={e => { const pasted = e.clipboardData.getData('text'); if (/[,;\n]/.test(pasted)) { e.preventDefault(); addExpertise(expertiseDraft + pasted); } }} placeholder="Enter expertise or paste a list" className="min-w-0 flex-1 text-sm font-normal outline-none" /><button type="button" disabled={saving || !expertiseDraft.trim()} onClick={() => addExpertise()} className="rounded-md bg-[#0C5A69] px-3 py-1 text-xs text-white disabled:opacity-40">Add</button></div></div><p id="instructor-expertise-help" className="mt-2 font-normal text-slate-500">Use Enter or commas, or paste multiple lines. Duplicate entries are removed. Up to 2,000 characters total.</p></div>
        <label className="text-xs font-semibold sm:col-span-2">Short bio (optional)<textarea rows={3} value={form.bio} onChange={e => change('bio', e.target.value)} className={input} /></label>
      </div></Card>
      <Card title="Instructor type *" description="Select Full-time, Part-time, Contract-based or Guest. Engagement fields depend on this selection."><div role="group" aria-label="Instructor type" className="grid gap-2 sm:grid-cols-4">{types.map((value, index) => <button key={value} type="button" aria-pressed={type === value} onClick={() => { setType(value); setMessage(''); }} className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-xs ${type === value ? 'border-[#0C5A69] bg-[#0C5A69] text-white' : 'border-slate-200 text-slate-700'}`}><strong>{value}</strong><span className={`text-[10px] ${type === value ? 'text-teal-100' : 'text-slate-500'}`}>{type === value ? 'Selected' : descriptions[index]}</span></button>)}</div>
      {type !== 'Full-time' && <div className="mt-5"><h3 className="text-sm font-bold">{type === 'Part-time' ? 'Employment details' : type === 'Guest' ? 'Engagement details' : 'Contract details'}</h3><p className="mt-1 text-xs text-slate-500">{type === 'Part-time' ? 'For part-time instructors, define the start date and required weekly availability. No end date is required for ongoing part-time engagements.' : `Required for ${type.toLowerCase()} instructors. Set the start and end dates.`}</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className={`text-xs font-semibold ${timed ? 'sm:col-span-2' : ''}`}>{type === 'Guest' ? 'Engagement' : type === 'Contract-based' ? 'Contract' : 'Employment'} start date *<input required type="date" value={form.start} onChange={e => change('start', e.target.value)} className={input} /></label>{timed ? <label className="text-xs font-semibold sm:col-span-2">{type === 'Guest' ? 'Engagement' : 'Contract'} end date *<input required min={form.start} type="date" value={form.end} onChange={e => change('end', e.target.value)} className={input} /></label> : <label className="text-xs font-semibold">Engagement<input readOnly value="Ongoing - no fixed end date" className={`${input} bg-slate-50`} /></label>}{type === 'Contract-based' && <label className="text-xs font-semibold sm:col-span-2">Renewal / expiry note<textarea value={form.note} onChange={e => change('note', e.target.value)} rows={3} className={input} /></label>}</div>
      {type === 'Part-time' && <div className="mt-4"><label className="text-xs font-semibold">Required weekly availability *<input required type="number" min="1" max="168" step="0.5" value={form.availability} onChange={e => change('availability', e.target.value)} className={input} /></label><h4 className="mt-4 text-xs font-bold">Weekly schedule</h4><p className="mt-1 text-xs text-slate-500">Add the days and hours this instructor is available to teach.</p><div className="mt-3 space-y-2">{days.map((day, index) => <div key={day} className="flex flex-wrap items-center gap-3 text-xs"><label className="flex w-28 items-center gap-2"><input type="checkbox" checked={schedule[index].enabled} onChange={e => setSchedule(prev => prev.map((item, i) => i === index ? { ...item, enabled: e.target.checked } : item))} />{day}</label>{schedule[index].enabled ? <><input aria-label={`${day} start time`} type="time" value={schedule[index].start} onChange={e => setSchedule(prev => prev.map((item, i) => i === index ? { ...item, start: e.target.value } : item))} className="rounded border border-slate-200 p-1" /><span>to</span><input aria-label={`${day} end time`} type="time" value={schedule[index].end} onChange={e => setSchedule(prev => prev.map((item, i) => i === index ? { ...item, end: e.target.value } : item))} className="rounded border border-slate-200 p-1" /></> : <span className="rounded border border-slate-100 px-3 py-1 text-slate-400">Unavailable</span>}</div>)}</div><label className="mt-3 block text-xs">Timezone<select value={form.timezone} onChange={e => change('timezone', e.target.value)} className={input}>{Array.from(new Set([form.timezone, 'UTC', ...Intl.supportedValuesOf('timeZone')])).map(zone => <option key={zone}>{zone}</option>)}</select></label><p className="mt-3 text-xs font-semibold">Total: {hours} hours/week</p></div>}
      <p className="mt-4 text-xs text-slate-500">{type === 'Part-time' ? 'The schedule is used for planning and availability checks.' : 'Engagement dates are stored separately from invitation and account status.'}</p></div>}</Card>
      {assignmentError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{assignmentError} <button type="button" onClick={() => { setAssignmentError(''); setCoursesLoading(true); setCohortsLoading(true); setAssignmentRetry(value => value + 1); }} className="underline">Retry</button></p>}
      <Card title="Initial assignment" description={id ? "Saving updates the batch teacher assignment. Occupied teaching roles cannot be replaced." : "Optional. Save a planned course and cohort assignment."}><div className={`grid gap-4 ${type === 'Full-time' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}><label className={`text-xs font-semibold ${type !== 'Full-time' ? 'sm:col-span-2' : ''}`}>Course<select value={form.course} disabled={coursesLoading} onChange={e => { setForm(prev => ({ ...prev, course: e.target.value, cohort: '' })); setCohorts([]); setCohortsLoading(true); setAssignmentError(''); }} className={input}><option value="">{coursesLoading ? 'Loading courses...' : courses.length ? 'Select course (optional)' : 'No courses available'}</option>{courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label><label className="text-xs font-semibold">Cohort<select value={form.cohort} disabled={cohortsLoading} onChange={e => { const batch = cohorts.find(item => item.id === e.target.value); if (batch && batch.courseId !== form.course) setCohortsLoading(true); setForm(prev => ({ ...prev, cohort: e.target.value, course: batch?.courseId ?? prev.course })); }} className={input}><option value="">{cohortsLoading ? 'Loading cohorts...' : cohorts.length ? 'Select cohort (optional)' : 'No active or upcoming cohorts'}</option>{cohorts.map(batch => <option key={batch.id} value={batch.id}>{batch.name} | {batch.courseTitle || courses.find(course => course.id === batch.courseId)?.title || 'Course unavailable'} ({batch.status})</option>)}</select></label><label className="text-xs font-semibold">Teaching role<select value={form.role} onChange={e => change('role', e.target.value)} className={input}><option>Co-instructor</option><option>Instructor</option></select></label></div></Card>
    </div><aside className="space-y-4"><Card title="Instructor permissions" description="Instructor and Co-instructor system roles grant full tenant access.">{optionsError && <p role="alert" className="mb-3 text-xs text-red-600">{optionsError} <button type="button" onClick={() => { setOptionsError(''); setOptionsRetry(value => value + 1); }} className="underline">Retry</button></p>}{!options && !optionsError && <p role="status" className="text-xs text-slate-500">Loading role permissions...</p>}{selectedRole && <p className="mb-3 text-xs font-semibold">{selectedRole.name}</p>}<div className="max-h-80 overflow-y-auto">{options?.permissions.filter(permission => selectedRole?.permissions.includes(permission.key)).map(permission => <label key={permission.key} className="mb-3 flex items-start gap-2 text-xs"><input type="checkbox" checked disabled className="mt-0.5 accent-[#0C5A69]" /><span><strong>{permission.label}</strong><span className="mt-1 block text-[11px] text-slate-500">{permission.description}</span></span></label>)}</div><p className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">Full workspace permissions, including publishing and tenant administration. Subscription and workspace module restrictions still apply.</p></Card>{!id && <Card title="Invitation & activation"><label className="flex items-start gap-2 text-xs"><input checked={invite} onChange={e => setInvite(e.target.checked)} type="checkbox" className="accent-[#0C5A69]" /><strong>Send an email invitation</strong></label><p className="my-3 text-[11px] text-slate-500">Sending an invitation keeps the account inactive until secure setup is completed.</p><label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={verify} disabled /><strong>Accept & verify email</strong></label><p className="mt-3 text-[11px] text-slate-500">The instructor completes secure account setup. Access starts after acceptance and email verification.</p>{type === 'Guest' && <div className="mt-4 text-[11px] text-slate-500"><strong className="text-slate-700">Invitation schedule</strong><p className="mt-2">Engagement starts: {form.start || 'Not set'}</p><p>Engagement ends: {form.end || 'Not set'}</p></div>}</Card>}</aside></div>
    </form>{review && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5"><section role="dialog" aria-modal="true" aria-labelledby="instructor-review-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h2 id="instructor-review-title" className="text-lg font-bold">{id ? 'Review changes' : 'Review invitation'}</h2><button disabled={saving || !selectedRole} onClick={() => setReview(false)} aria-label="Close review"><X size={18} /></button></div><div>{message && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p>}</div><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-slate-500">Instructor</dt><dd>{form.name} | {form.email}</dd></div><div><dt className="text-slate-500">Engagement</dt><dd>{type}{form.start && ` - ${form.start}`}{timed && ` - ${form.end}`}</dd></div><div><dt className="text-slate-500">Specialty</dt><dd>{form.specialty}</dd></div>{type === 'Part-time' && <div><dt className="text-slate-500">Weekly availability</dt><dd>{hours} hours | {form.timezone}</dd></div>}</dl><p className="mt-5 rounded-lg bg-sky-50 p-3 text-xs text-sky-900">Confirm the profile and permissions before saving. Email acceptance is required before activation.</p><button disabled={saving || !selectedRole} onClick={() => { void persist(invite); }} className="mt-4 flex items-center gap-2 rounded-md bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white"><Check size={15} />{saving ? 'Saving...' : id ? 'Save changes' : invite ? 'Send invitation' : 'Save draft'}</button></section></div>}</div>;
}
