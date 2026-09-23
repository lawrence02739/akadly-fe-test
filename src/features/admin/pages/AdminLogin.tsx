import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { adminError } from '../api/admin.api';
import { useAdminSession } from '../AdminSession';

export default function AdminLogin() {
  const { profile, signIn } = useAdminSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (profile) return <Navigate to="/admin/tenants" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setLoading(true);
    try { await signIn(email.trim(), password); navigate('/admin/tenants', { replace: true }); }
    catch (cause) { setError(adminError(cause)); }
    finally { setLoading(false); }
  };
  return <div className="min-h-screen bg-[#f3f6f8] flex items-center justify-center p-5">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 p-8 sm:p-10">
      <div className="w-12 h-12 rounded-xl bg-[#0C5A69] text-white flex items-center justify-center"><LockKeyhole size={24} /></div>
      <p className="mt-6 text-xs font-bold tracking-[.18em] uppercase text-[#0C5A69]">Akadly administration</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin sign in</h1>
      <p className="mt-2 text-slate-500 text-sm">Manage workspaces and tenant access.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium text-slate-700">Email address<input required autoComplete="username" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-[#0C5A69]/30" /></label>
        <label className="block text-sm font-medium text-slate-700">Password<input required autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 p-3 outline-none focus:ring-2 focus:ring-[#0C5A69]/30" /></label>
        {error && <p role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-[#0C5A69] p-3 text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#084855] disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} /></button>
      </form>
      <Link to="/login" className="block text-center mt-7 text-sm text-slate-500 hover:text-[#0C5A69]">Go to tenant portal</Link>
    </div>
  </div>;
}
