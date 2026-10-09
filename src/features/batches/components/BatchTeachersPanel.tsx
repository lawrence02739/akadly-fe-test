import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { batchTeacherApi, type AssignedTeacher, type TeacherAssignment } from '../api/batches.api';
import { instructorsApi, type Instructor } from '../../instructors/api/instructors.api';
export default function BatchTeachersPanel({ batchId, onChanged }: { batchId: string; onChanged?: () => Promise<unknown> }) {
 const [entries,setEntries] = useState<AssignedTeacher[]>([]);
 const [members,setMembers] = useState<Instructor[]>([]);
 const [userId,setUserId] = useState('');
 const [role,setRole] = useState<TeacherAssignment['teachingRole']>('instructor');
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState('');
 const [loaded,setLoaded] = useState(false);
 useEffect(() => { let active=true; (async () => {
  const assigned=await batchTeacherApi.list(batchId); const all: Instructor[]=[]; let page=1;
  while(true) { const result=await instructorsApi.list({ page, pageSize:100, status:'active' }); all.push(...result.data); if (!result.meta.hasNext) break; page++; }
  if(active){setEntries(assigned);setMembers(all);setLoaded(true);}
 })().catch(() => { if(active)setError('Could not load assigned teachers. Refresh to retry.'); }); return()=>{active=false}; },[batchId]);
 async function run(work:()=>Promise<unknown>) { setBusy(true);setError('');try{await work();setEntries(await batchTeacherApi.list(batchId));await onChanged?.();toast.success('Teacher assignments updated.');return true;}catch(err){const message=(err as {response?:{data?:{message?:string}}}).response?.data?.message || 'Could not update teacher assignment';setError(message);return false;}finally{setBusy(false);} }
 return <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Assigned teachers</h2><p className="mt-1 text-sm text-slate-500">Assign multiple teachers. Removing a teacher affects only this batch.</p>{error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}{!loaded && !error && <p>Loading teachers...</p>}
 <div className="mt-4 space-y-3">{entries.map(entry=><div key={entry.userId} className="flex flex-wrap items-center gap-3 rounded-lg border p-3"><div className="mr-auto"><p>{entry.name}</p><p className="text-xs text-slate-500">{entry.email} | {entry.status}</p></div><select aria-label={`Teaching role for ${entry.name}`} disabled={busy} value={entry.teachingRole} onChange={event=>void run(()=>batchTeacherApi.role(batchId,{userId:entry.userId,teachingRole:event.target.value as TeacherAssignment['teachingRole']}))}><option value="instructor">Instructor</option><option value="co_instructor">Co-instructor</option></select><button disabled={busy} onClick={()=>{if(window.confirm(`Remove ${entry.name} from this batch?`))void run(()=>batchTeacherApi.remove(batchId,entry.userId));}} className="text-sm text-rose-600">Remove</button></div>)}</div>
 {loaded && !entries.length && <p className="mt-3 text-sm text-slate-500">No teachers assigned.</p>}
 <form className="mt-4 flex flex-wrap gap-3" onSubmit={event=>{event.preventDefault();void run(()=>batchTeacherApi.add(batchId,{userId,teachingRole:role})).then(saved=>{if(saved)setUserId('');});}}><select required aria-label="Teacher" disabled={busy || !loaded} value={userId} onChange={event=>setUserId(event.target.value)}><option value="">Select an active teacher</option>{members.filter(member=>!entries.some(entry=>entry.userId===member.userId)).map(member=><option key={member.userId} value={member.userId}>{member.name}</option>)}</select><select aria-label="Teaching role" disabled={busy} value={role} onChange={event=>setRole(event.target.value as TeacherAssignment['teachingRole'])}><option value="instructor">Instructor</option><option value="co_instructor">Co-instructor</option></select><button disabled={busy || !userId} className="rounded-lg bg-[#0C5A69] px-4 py-2 text-sm text-white">Add teacher</button></form></section>;
}
