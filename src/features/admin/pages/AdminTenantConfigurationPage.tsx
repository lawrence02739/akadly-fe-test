import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Info, Search, ShieldCheck } from "lucide-react";
import {
  adminApi,
  adminError,
  type AdminTenantConfiguration,
  type AdminTenantConfigurationOption,
  type TenantConfigurationPreview,
  type TenantConfigurationValues,
} from "../api/admin.api";
import { useAdminSession } from "../AdminSession";

const card = "rounded-lg border border-slate-200 bg-white";
const input = "mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-[11px] text-slate-700 outline-none focus:border-[#0b6273]";
const defaultValues: TenantConfigurationValues = {
  disabledModules: [], language: "en", timezone: "UTC",
  dailyDigestEnabled: false, digestHour: 9,
  loginAlertsEnabled: false, sessionTimeoutMinutes: 20160,
};
const fieldNames: Record<keyof TenantConfigurationValues, string> = {
  disabledModules: "Module access",
  language: "Default language",
  timezone: "Academy timezone",
  dailyDigestEnabled: "Daily email digest",
  digestHour: "Digest delivery hour",
  loginAlertsEnabled: "Login alerts",
  sessionTimeoutMinutes: "Session timeout",
};
const valueText = (value: unknown): string =>
  Array.isArray(value) ? value.length ? value.join(", ") : "None" :
  typeof value === "boolean" ? value ? "Enabled" : "Disabled" :
  value === null || value === undefined ? "Not set" : String(value);
const limitText = (key: string, value: unknown): string =>
  key === "content_limit" && typeof value === "number"
    ? `${Math.round(value / (1024 * 1024))} MB`
    : valueText(value);

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className={card}><div className="border-b border-slate-100 px-4 py-3"><h2 className="text-xs font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-[10px] text-slate-500">{description}</p></div><div className="p-4">{children}</div></section>;
}

export default function AdminTenantConfigurationPage() {
  const { can, profile } = useAdminSession();
  const [tenants, setTenants] = useState<AdminTenantConfigurationOption[]>([]);
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantPage, setTenantPage] = useState(1);
  const [hasMoreTenants, setHasMoreTenants] = useState(false);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [config, setConfig] = useState<AdminTenantConfiguration | null>(null);
  const [draft, setDraft] = useState<TenantConfigurationValues>(defaultValues);
  const [preview, setPreview] = useState<TenantConfigurationPreview | null>(null);
  const [reason, setReason] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const reviewRequest = useRef(0);

  useEffect(() => {
    if (!can("tenant:read")) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setTenantsLoading(true);
      void adminApi.tenantConfigurationOptions({ page: tenantPage, pageSize: 50, search: tenantSearch.trim() || undefined })
        .then(result => { if (active) { setTenants(current => tenantPage === 1 ? result.items : [...current, ...result.items]); setHasMoreTenants(result.pagination.hasNext); setTenantId(id => id || result.items[0]?.id || ""); } })
        .catch(err => { if (active) setError(adminError(err)); })
        .finally(() => { if (active) setTenantsLoading(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [can, tenantSearch, tenantPage]);

  useEffect(() => {
    if (!tenantId || !can("tenant:read")) return;
    reviewRequest.current += 1;
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setBusy(false);
      setError("");
      setSuccess("");
      setConfig(null);
      setPreview(null);
      setReviewed(false);
      setReason("");
      void adminApi.tenantConfiguration(tenantId)
        .then(result => { if (active) { setConfig(result); setDraft(result.values); } })
        .catch(err => { if (active) setError(adminError(err)); })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [can, tenantId]);

  const update = <K extends keyof TenantConfigurationValues>(key: K, value: TenantConfigurationValues[K]) => {
    reviewRequest.current += 1;
    setBusy(false);
    setDraft(current => ({ ...current, [key]: value }));
    setPreview(null);
    setReviewed(false);
    setSuccess("");
  };
  const toggleModule = (module: string) =>
    update("disabledModules", draft.disabledModules.includes(module)
      ? draft.disabledModules.filter(item => item !== module)
      : [...draft.disabledModules, module]);
  const changes = useMemo(() => config ?
    (Object.keys(draft) as Array<keyof TenantConfigurationValues>).filter(key =>
      JSON.stringify(config.values[key]) !== JSON.stringify(draft[key])) : [], [config, draft]);
  const filteredModules = config?.allowedModules.filter(module => module.toLowerCase().includes(search.toLowerCase())) ?? [];
  const selectedTenant = tenants.find(tenant => tenant.id === tenantId);
  const searchTenants = (value: string) => { setTenantPage(1); setTenantSearch(value); };
  const selectTenant = (id: string) => {
    reviewRequest.current += 1;
    setConfig(null);
    setPreview(null);
    setReviewed(false);
    setReason("");
    setError("");
    setSuccess("");
    setTenantId(id);
  };

  async function review() {
    if (!config) return;
    const request = ++reviewRequest.current;
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await adminApi.previewTenantConfiguration(config.tenant.id, draft);
      if (request === reviewRequest.current) setPreview(result);
    } catch (err) { if (request === reviewRequest.current) setError(adminError(err)); }
    finally { if (request === reviewRequest.current) setBusy(false); }
  }
  async function publish() {
    if (!config || !preview || !reviewed || reason.trim().length < 10) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const result = await adminApi.publishTenantConfiguration(config.tenant.id, {
        ...preview.proposed, expectedRevision: preview.expectedRevision, reason: reason.trim(),
      });
      setConfig(result);
      setDraft(result.values);
      setPreview(null);
      setReviewed(false);
      setReason("");
      setSuccess("Workspace configuration published.");
    } catch (err) { setError(adminError(err)); }
    finally { setBusy(false); }
  }

  if (!can("tenant:read")) return <main className="p-8 text-sm text-slate-600">You do not have access to tenant configuration.</main>;

  return <main className="min-h-screen bg-white">
    <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4 sm:px-7"><label className="flex w-56 items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] text-slate-400"><Search size={13} /><input value={tenantSearch} onChange={event => searchTenants(event.target.value)} aria-label="Search workspaces" placeholder="Search workspaces..." className="w-full outline-none" /></label><div className="flex items-center gap-2 text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#0b6273] text-[10px] font-bold text-white">{(profile?.displayName || "A").slice(0, 1).toUpperCase()}</span><span className="hidden text-[10px] font-semibold sm:block">{profile?.displayName || "Admin"}</span></div></div>
    <div className="mx-auto max-w-[1480px] space-y-4 px-4 py-6 sm:px-7">
      <header className="flex flex-wrap justify-between gap-3"><div><h1 className="text-[22px] font-bold text-slate-950">Tenant-level configuration</h1><p className="mt-1 text-xs text-slate-500">Manage workspace settings with visibility into plan entitlements, overrides and effective values.</p></div><a href="#configuration-history" className="text-[11px] font-semibold text-slate-600 hover:text-[#0b6273]"><ShieldCheck size={14} className="mr-1 inline" /> Workspace history</a></header>
      <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 pb-3"><label className="text-[10px] font-semibold text-slate-600">Search workspaces<input value={tenantSearch} onChange={event => searchTenants(event.target.value)} placeholder="Search by name" className={`${input} block w-44`} /></label><label className="min-w-64 text-[10px] font-semibold text-slate-600">Select workspace<select value={tenantId} disabled={busy} onChange={event => selectTenant(event.target.value)} className={input}><option value="">Select a workspace</option>{tenantId && !tenants.some(item => item.id === tenantId) && <option value={tenantId}>{config?.tenant.name ?? "Selected workspace"}</option>}{tenants.map(item => <option key={item.id} value={item.id}>{item.name}{item.ownerName ? ` (${item.ownerName})` : ""}</option>)}</select></label>{hasMoreTenants && <button type="button" disabled={tenantsLoading} onClick={() => { setTenantsLoading(true); setTenantPage(page => page + 1); }} className="rounded-md border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-700 disabled:opacity-50">{tenantsLoading ? "Loading..." : "Load more workspaces"}</button>}{config && <span className="ml-auto rounded-full bg-sky-50 px-3 py-1 text-[10px] font-semibold text-sky-700">Revision {config.revision}</span>}</div>
      {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">{success}</p>}
      {loading && <p className={`${card} p-6 text-xs text-slate-500`}>Loading workspace configuration...</p>}
      {!loading && !config && !error && <p className={`${card} p-6 text-xs text-slate-500`}>Select a workspace to view its configuration.</p>}
      {config && <><div className="rounded-md bg-sky-50 px-3 py-2 text-[11px] text-sky-800"><Info size={13} className="mr-1 inline" />Subscription plan grants eligibility. Workspace overrides can disable a granted module; they cannot add modules outside the plan.</div>
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.85fr)_minmax(290px,.95fr)]">
          <div className="min-w-0 space-y-3">
            <Section title="Modules & learning experience" description={`Modules included with ${config.plan?.name ?? "the assigned plan"}; switch a module off for this workspace.`}>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search modules" aria-label="Search modules" className={`${input} mb-3`} />
              <div className="overflow-x-auto"><table className="w-full min-w-[460px] text-left text-[11px]"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="p-2">Module</th><th className="p-2">Plan entitlement</th><th className="p-2">Workspace access</th></tr></thead><tbody>{filteredModules.map(module => <tr key={module} className="border-t"><td className="p-2 font-semibold text-slate-800">{module}</td><td className="p-2 text-emerald-700">Included</td><td className="p-2"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={!draft.disabledModules.includes(module)} disabled={!can("tenant:update")} onChange={() => toggleModule(module)} />{draft.disabledModules.includes(module) ? "Disabled" : "Enabled"}</label></td></tr>)}</tbody></table></div>
              <p className="mt-2 text-[10px] text-slate-500">Changes are saved for this workspace only after Review impact and Publish configuration. Tick the module again and publish to restore access.</p>
              {!config.allowedModules.length && <p className="mt-2 text-[11px] text-slate-500">This plan has no explicit module entitlements. Change the subscription plan before granting a module here.</p>}
              {config.items.filter(item => item.group === "Plan limits").length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{config.items.filter(item => item.group === "Plan limits").map(item => <div key={item.key} className="rounded-md border border-slate-100 p-2 text-[10px]"><span className="text-slate-500">{item.label}</span><p className="mt-1 font-semibold">{limitText(item.key, item.value)} <span className="font-normal text-slate-500">· used {item.usage === null ? "not tracked" : item.key === "content_limit" ? limitText(item.key, item.usage) : item.usage ?? "—"}</span></p></div>)}</div>}
              {!config.available.contentUsage && <p className="mt-2 text-[10px] text-amber-700">Content storage usage and quota enforcement are not available yet. The plan limit above is configured, but upload usage is not measured.</p>}
            </Section>
            <Section title="Localization" description="Defaults are English and UTC; set the academy timezone for this workspace."><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Default language<select value={draft.language} disabled={!can("tenant:update")} onChange={event => update("language", event.target.value)} className={input}><option value="en">English</option><option value="hi">Hindi</option></select></label><label className="text-[10px] font-semibold text-slate-600">Academy timezone<select value={draft.timezone} disabled={!can("tenant:update")} onChange={event => update("timezone", event.target.value)} className={input}><option value="UTC">UTC</option><option value="Asia/Kolkata">Asia/Kolkata</option><option value="Asia/Dubai">Asia/Dubai</option><option value="Europe/London">Europe/London</option><option value="America/New_York">America/New_York</option></select></label></div>{draft.language === "hi" && <p className="mt-2 text-[10px] text-amber-700">Hindi preference is saved, but translation coverage across tenant pages is not complete yet.</p>}</Section>
            <Section title="Notifications" description="Daily digest for the workspace owner and active academy admins."><label className="flex items-center gap-2 text-[11px] text-slate-700"><input type="checkbox" checked={draft.dailyDigestEnabled} disabled={!can("tenant:update")} onChange={event => update("dailyDigestEnabled", event.target.checked)} />Send daily email digest</label><label className="mt-3 block max-w-48 text-[10px] font-semibold text-slate-600">Delivery hour (academy timezone)<select value={draft.digestHour} disabled={!can("tenant:update") || !draft.dailyDigestEnabled} onChange={event => update("digestHour", Number(event.target.value))} className={input}>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}</select></label></Section>
            <Section title="Security controls" description="Workspace session and account security preferences."><div className="grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-semibold text-slate-600">Session timeout<select value={draft.sessionTimeoutMinutes} disabled={!can("tenant:update")} onChange={event => update("sessionTimeoutMinutes", Number(event.target.value))} className={input}>{[15, 30, 60, 120, 480, 1440, 20160].map(minutes => <option key={minutes} value={minutes}>{minutes === 20160 ? "14 days (current default)" : `${minutes} minutes`}</option>)}</select></label><label className="flex items-center gap-2 self-end pb-2 text-[11px] text-slate-700"><input type="checkbox" checked={draft.loginAlertsEnabled} disabled={!can("tenant:update")} onChange={event => update("loginAlertsEnabled", event.target.checked)} />Login alert emails</label></div></Section>
            <Section title="Feature availability & rollout" description="Preview of edits made above; publishing applies them to the selected workspace."><div className="space-y-2">{changes.length ? changes.map(key => <div key={key} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-2 text-[11px]"><strong>{fieldNames[key]}</strong><span className="text-slate-500">{valueText(config.values[key])} → <span className="font-semibold text-[#0b6273]">{valueText(draft[key])}</span></span></div>) : <p className="text-[11px] text-slate-500">No unpublished changes.</p>}</div></Section>
          </div>
          <aside className="space-y-3">
            <Section title="Change summary & impact" description="Server-calculated review before publication."><p className="text-[11px]"><strong>{preview?.changes.length ?? changes.length}</strong> proposed changes · {config.tenant.name}</p><p className="mt-2 text-[10px] text-slate-500">Assigned plan: {config.plan?.name ?? "None"} · Published revision: {config.revision}</p>{preview && <div className="mt-3 space-y-1 border-t pt-3">{preview.changes.map(change => <p key={change.key} className="text-[10px]"><strong>{fieldNames[change.key]}</strong>: {valueText(change.before)} → {valueText(change.after)}</p>)}</div>}<button type="button" onClick={review} disabled={!can("tenant:update") || !changes.length || busy} className="mt-3 rounded-md border border-[#0b6273] px-3 py-2 text-[10px] font-semibold text-[#0b6273] disabled:opacity-50">Review impact</button></Section>
            <Section title="Save & publish safeguards" description="Publish only after checking the server preview."><label className="block text-[10px] font-semibold text-slate-600">Reason for change<input value={reason} onChange={event => setReason(event.target.value)} disabled={!can("tenant:update")} placeholder="At least 10 characters" className={input} /></label><label className="mt-3 flex items-start gap-2 text-[10px] text-slate-600"><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} disabled={!preview} />I reviewed the proposed settings and affected workspace.</label><button type="button" onClick={publish} disabled={!preview || !reviewed || reason.trim().length < 10 || busy || !can("tenant:update")} className="mt-3 rounded-md bg-[#0b6273] px-3 py-2 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Working..." : "Publish configuration"}</button><p className="mt-2 text-[10px] text-slate-500">A concurrent change will require a fresh review.</p></Section>
            <Section title="Audience & application" description="Only the selected workspace is affected."><p className="text-[11px] font-semibold">{config.tenant.name}</p><p className="mt-1 text-[10px] text-slate-500">{config.tenant.slug} · Owner: {selectedTenant?.ownerName || config.tenant.ownerName}</p><p className="mt-2 text-[10px] text-slate-500">Module access remains limited by the assigned subscription.</p></Section>
            <Section title="Applied configuration" description="Last published workspace values."><p className="text-[10px]">Revision {config.revision} · {config.publishedAt ? new Date(config.publishedAt).toLocaleString() : "Platform defaults"}</p><p className="mt-2 text-[10px] text-slate-500">Language: {config.values.language} · Timezone: {config.values.timezone}</p><p className="mt-1 text-[10px] text-slate-500">Modules active: {config.effectiveModules.length} of {config.allowedModules.length}</p><p className="mt-1 text-[10px] text-slate-500">Daily digest: {config.values.dailyDigestEnabled ? `${String(config.values.digestHour).padStart(2, "0")}:00` : "Off"} · Login alerts: {config.values.loginAlertsEnabled ? "On" : "Off"}</p><p className="mt-1 text-[10px] text-slate-500">Session timeout: {config.values.sessionTimeoutMinutes} minutes</p></Section>
            <div id="configuration-history"><Section title="Field and source operations" description="Published history and source of settings."><p className="text-[10px] text-slate-500">Plan grants modules and limits. Workspace configuration narrows module access and sets local preferences.</p><div className="mt-3 max-h-36 space-y-2 overflow-auto">{config.history.length ? [...config.history].reverse().map(entry => <p key={entry.revision} className="border-t pt-2 text-[10px]"><Check size={11} className="mr-1 inline text-emerald-600" />Rev {entry.revision} · {entry.reason} · {new Date(entry.changedAt).toLocaleDateString()}</p>) : <p className="text-[10px] text-slate-500">No published changes yet.</p>}</div></Section></div>
          </aside>
        </div>
      </>}
    </div>
  </main>;
}
