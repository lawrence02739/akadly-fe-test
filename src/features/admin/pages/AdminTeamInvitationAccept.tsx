import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import { adminApi, adminError, type AdminTeamInvitationPreview } from '../api/admin.api';

export default function AdminTeamInvitationAccept() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';
  const [invite, setInvite] = useState<AdminTeamInvitationPreview | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { setError('Invitation token is missing.'); setLoading(false); return; }
    adminApi.previewTeamInvitation(token).then(setInvite).catch((requestError) => setError(adminError(requestError))).finally(() => setLoading(false));
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      await adminApi.acceptTeamInvitation(token, password);
      navigate('/admin/login', { state: { message: 'Password set. Sign in with your new password.' } });
    } catch (requestError) { setError(adminError(requestError)); }
    finally { setSaving(false); }
  };

  return <AuthLayout><div><h1 className="text-3xl font-bold text-slate-900">Set your admin password</h1>{loading && <p className="mt-5 text-slate-500">Checking your invitation…</p>}{error && <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{invite && <><p className="mt-2 text-slate-500">Welcome, {invite.name}. Create your password for the Akadly admin portal.</p><form className="mt-7 space-y-4" onSubmit={submit}><Password label="New password" value={password} change={setPassword} /><Password label="Confirm password" value={confirmPassword} change={setConfirmPassword} /><p className="text-xs text-slate-500">Use at least 8 characters.</p><button disabled={saving} className="w-full rounded-xl bg-[#0C5A69] py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving password…' : 'Set password'}</button></form></>}<Link to="/admin/login" className="mt-6 block text-center text-sm font-semibold text-slate-500">Back to admin login</Link></div></AuthLayout>;
}

function Password({ label, value, change }: { label: string; value: string; change: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span><input type="password" minLength={8} required value={value} onChange={(event) => change(event.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0C5A69] focus:ring-2 focus:ring-[#0C5A69]/20" /></label>;
}
