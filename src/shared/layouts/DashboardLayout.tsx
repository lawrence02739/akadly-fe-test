import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AccessRoute from "../auth/AccessRoute";
import type { RootState } from "../../store";
import api from "../api/axios";
import { moduleForPartnerPath, WorkspaceModulesContext } from "../auth/WorkspaceModulesContext";

export default function DashboardLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const isPaymentPage = location.pathname === "/partner/payments";
  const readOnly = !!user?.isReadOnly;
  const [language, setLanguage] = useState("en");
  const [effectiveModules, setEffectiveModules] = useState<string[]>([]);
  const [preferencesResult, setPreferencesResult] = useState<{ userId: string; status: "ready" | "error" } | null>(null);
  const preferencesStatus = preferencesResult && preferencesResult.userId === user?.id ? preferencesResult.status : "loading";
  const requiredModule = moduleForPartnerPath(location.pathname);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    let latestRequest = 0;
    const refreshPreferences = () => { const request = ++latestRequest; void api.get("/auth/me/preferences").then(({ data }) => {
      if (!active || request !== latestRequest) return;
      const preferences = data?.data ?? data;
      const nextLanguage = preferences?.language === "hi" ? "hi" : "en";
      setLanguage(nextLanguage);
      setEffectiveModules(Array.isArray(preferences?.effectiveModules) ? preferences.effectiveModules : []);
      setPreferencesResult({ userId: user.id, status: "ready" });
      document.documentElement.lang = nextLanguage;
      if (typeof preferences?.timezone === "string") {
        document.documentElement.dataset.timezone = preferences.timezone;
      }
    }).catch(() => {
      if (active && request === latestRequest) {
        setLanguage("en");
        setEffectiveModules([]);
        setPreferencesResult({ userId: user.id, status: "error" });
        document.documentElement.lang = "en";
      }
    }); };
    refreshPreferences();
    window.addEventListener('focus', refreshPreferences);
    const refreshTimer = window.setInterval(refreshPreferences, 60_000);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshPreferences);
      window.clearInterval(refreshTimer);
    };
  }, [user?.id]);

  return (
    <AccessRoute>
      <WorkspaceModulesContext.Provider value={effectiveModules}>
      <div className="flex h-screen flex-col overflow-hidden bg-body md:flex-row">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopNav language={language} />
          {readOnly && (
            <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
              <span>
                <strong>Read-only mode.</strong> Your payment is overdue, so
                changes are paused until payment is settled.
              </span>
              {!isPaymentPage && effectiveModules.includes("account") && (
                <Link
                  to="/partner/payments"
                  className="shrink-0 rounded-md bg-amber-700 px-3 py-1.5 font-semibold text-white hover:bg-amber-800"
                >
                  View payment
                </Link>
              )}
            </div>
          )}
          <main className="flex-1 overflow-y-auto p-2">
            <div
              className={
                readOnly && !isPaymentPage
                  ? "pointer-events-none select-none opacity-80"
                  : undefined
              }
            >
              {preferencesStatus === "loading" ? (
                <div className="m-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading workspace access...</div>
              ) : preferencesStatus === "error" ? (
                <div className="m-auto max-w-lg rounded-xl border border-amber-200 bg-white p-8 text-center"><h1 className="text-xl font-bold text-slate-900">Workspace access unavailable</h1><p className="mt-2 text-sm text-slate-600">Could not load your workspace settings. Please refresh the page.</p></div>
              ) : requiredModule && !effectiveModules.includes(requiredModule) ? (
                <div className="m-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center"><h1 className="text-xl font-bold text-slate-900">Module unavailable</h1><p className="mt-2 text-sm text-slate-500">This module is not enabled for your workspace.</p></div>
              ) : <Outlet />}
            </div>
          </main>
        </div>
      </div>
      </WorkspaceModulesContext.Provider>
    </AccessRoute>
  );
}
