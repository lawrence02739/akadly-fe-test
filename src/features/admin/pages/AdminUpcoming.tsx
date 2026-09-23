import { Users } from 'lucide-react';

export default function AdminUpcoming() {
  const Icon = Users;
  return <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-[#0C5A69]">Platform administration</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-900">Team Management</h1>
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8">
      <Icon size={32} className="text-[#0C5A69]" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Admin team management</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">This section is ready for admin team APIs. The backend does not currently expose admin team management endpoints.</p>
    </div>
  </main>;
}
