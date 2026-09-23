import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { adminApi, clearAdminSession, hasAdminSession, type AdminProfile } from './api/admin.api';

interface SessionContext {
  profile: AdminProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  can: (permission: string) => boolean;
}
const Context = createContext<SessionContext | null>(null);
export function useAdminSession() {
  const session = useContext(Context);
  if (!session) throw new Error('AdminSessionProvider is missing');
  return session;
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [checking, setChecking] = useState(hasAdminSession());
  useEffect(() => {
    let active = true;
    const ended = () => { if (active) { setProfile(null); setChecking(false); } };
    window.addEventListener('admin-session-ended', ended);
    if (hasAdminSession()) {
      adminApi.profile().then((user) => { if (active) setProfile(user); })
        .catch(() => { clearAdminSession(); })
        .finally(() => { if (active) setChecking(false); });
    }
    return () => { active = false; window.removeEventListener('admin-session-ended', ended); };
  }, []);
  const signIn = async (email: string, password: string) => {
    await adminApi.login(email, password);
    try { setProfile(await adminApi.profile()); }
    catch (error) { clearAdminSession(); throw error; }
  };
  const signOut = async () => { try { await adminApi.logout(); } finally { setProfile(null); } };
  return <Context.Provider value={{ profile, signIn, signOut, can: (permission) => Boolean(profile?.isSuperAdmin || profile?.permissions.includes(permission)) }}>
    {checking ? <div className="min-h-screen grid place-items-center text-slate-500">Checking admin session…</div> : children}
  </Context.Provider>;
}

export function AdminGuard() {
  const { profile } = useAdminSession();
  return profile ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
