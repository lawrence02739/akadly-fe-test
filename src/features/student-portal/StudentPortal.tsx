/**
 * StudentPortal.tsx
 *
 * A completely isolated React sub-application that lives at /student/*.
 * It uses its own cookie name (student_access_token, set by the backend
 * student-login route), so it never conflicts with the tenant session.
 *
 * Routes:
 *   /student/login            — Login form
 *   /student/reset-password   — Set password from token link
 *   /student/dashboard        — Protected dashboard (requires student session)
 *   /student                  → redirects to /student/login
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GraduationCap, BookOpen, LogOut, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const STUDENT_API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:3000/api";

const studentApi = axios.create({
  baseURL: STUDENT_API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Student Auth Context ──────────────────────────────────────────────────────

interface StudentUser {
  id: string;
  name?: string;
  email: string;
  studentCode?: string;
  courseTitle?: string;
  planName?: string;
}

interface StudentAuthCtx {
  student: StudentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const StudentAuthContext = createContext<StudentAuthCtx | null>(null);

function useStudentAuth() {
  const ctx = useContext(StudentAuthContext);
  if (!ctx) throw new Error("useStudentAuth must be inside StudentAuthProvider");
  return ctx;
}

function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const STORAGE_KEY = "student_user";

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setStudent(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await studentApi.post("/student/auth/login", { email, passwordRaw: password });
    const user: StudentUser = data.data?.user ?? data.user;
    setStudent(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const logout = async () => {
    try { await studentApi.post("/student/auth/logout"); } catch { /* ignore */ }
    setStudent(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <StudentAuthContext.Provider value={{ student, isLoading, login, logout }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

function StudentProtectedRoute({ children }: { children: React.ReactNode }) {
  const { student, isLoading } = useStudentAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }
  return student ? <>{children}</> : <Navigate to="/student/login" replace />;
}

// ── Login Page ────────────────────────────────────────────────────────────────

function StudentLoginPage() {
  const { login, student } = useStudentAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (student) navigate("/student/dashboard", { replace: true });
  }, [student, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/student/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-white/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Student Portal</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to access your learning space</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="student-email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  id="student-password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a href="/student/forgot-password" className="text-xs text-primary-600 hover:underline">
                Forgot your password?
              </a>
            </div>

            <button
              id="student-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0C5A69] hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign in to Portal"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Powered by Akadly · Student portal for enrolled members only
        </p>
      </div>
    </div>
  );
}

// ── Reset Password Page ───────────────────────────────────────────────────────

function StudentResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await studentApi.post("/student/auth/reset-password", {
        token,
        newPasswordRaw: password,
        confirmPasswordRaw: confirm,
      });
      setSuccess(true);
      toast.success("Password set! You can now log in.");
      setTimeout(() => navigate("/student/login", { replace: true }), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to set password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-slate-600 mb-4">Invalid or missing reset link.</p>
          <a href="/student/login" className="text-primary-600 text-sm hover:underline">Go to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-white/20">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set your password</h1>
          <p className="text-white/60 text-sm mt-1">Create a secure password for your student account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-emerald-600 font-semibold">Password set successfully!</p>
              <p className="text-slate-500 text-sm mt-1">Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Re-enter password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0C5A69] hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Setting password…" : "Set Password & Log In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────

function StudentDashboard() {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    studentApi.get("/student/me")
      .then(({ data }) => setProfile(data.data ?? data))
      .catch(() => { /* backend not yet ready — show basic info */ });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/student/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="bg-[#0C5A69] px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-white" />
          <span className="text-white font-semibold text-lg">Student Portal</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
              {(profile?.fullName ?? student?.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome, {profile?.fullName ?? student?.name ?? "Student"}! 👋
              </h1>
              <p className="text-slate-500 text-sm">{student?.email}</p>
              {(profile?.studentCode ?? student?.studentCode) && (
                <span className="inline-block mt-1 bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full font-mono">
                  {profile?.studentCode ?? student?.studentCode}
                </span>
              )}
            </div>
          </div>

          {/* Course Info */}
          {(profile?.courseTitle ?? student?.courseTitle) && (
            <div className="bg-gradient-to-r from-primary-50 to-teal-50 rounded-xl p-5 border border-primary-100">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Current Enrolment</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {profile?.courseTitle ?? student?.courseTitle}
                  </p>
                  {(profile?.planName ?? student?.planName) && (
                    <p className="text-sm text-slate-500 mt-0.5">Plan: {profile?.planName ?? student?.planName}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        {profile?.payment && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Schedule</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Fee", value: `₹${profile.payment.totalAmount?.toLocaleString()}` },
                { label: "Paid", value: `₹${profile.payment.paidAmount?.toLocaleString()}`, color: "text-emerald-600" },
                { label: "Due", value: `₹${profile.payment.dueAmount?.toLocaleString()}`, color: "text-red-500" },
              ].map(({ label, value, color = "text-slate-900" }) => (
                <div key={label} className="text-center">
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {profile.payment.schedule?.length > 0 && (
              <div className="space-y-2">
                {profile.payment.schedule.map((inst: any) => (
                  <div
                    key={inst.no}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${inst.status === "PAID" ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">Instalment {inst.no}</p>
                      <p className="text-xs text-slate-400">
                        Due: {new Date(inst.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₹{inst.amount.toLocaleString()}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inst.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {inst.status === "PAID" ? "✓ Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Coming Soon Banner */}
        {!profile && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-600">Your course content is coming soon</h2>
            <p className="text-slate-400 text-sm mt-1">
              Your instructor is preparing your learning materials. Check back shortly!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root Export ───────────────────────────────────────────────────────────────

export default function StudentPortal() {
  return (
    <StudentAuthProvider>
      <Routes>
        <Route path="login" element={<StudentLoginPage />} />
        <Route path="reset-password" element={<StudentResetPasswordPage />} />
        <Route
          path="dashboard"
          element={
            <StudentProtectedRoute>
              <StudentDashboard />
            </StudentProtectedRoute>
          }
        />
        {/* Default: redirect / → login */}
        <Route index element={<Navigate to="login" replace />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </StudentAuthProvider>
  );
}
