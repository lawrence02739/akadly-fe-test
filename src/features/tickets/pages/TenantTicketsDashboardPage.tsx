import { CheckCircle2, Clock3, MessageCircle, Ticket } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminError,
  ticketsApi,
  type TenantTicketDashboard,
  type TicketStatus,
} from "../api/tickets.api";

const statusLabel = (status: string) => status.replaceAll("_", " ");
const statusClass: Partial<Record<TicketStatus, string>> = {
  open: "bg-rose-50 text-rose-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  waiting_for_user: "bg-amber-50 text-amber-800",
  pending: "bg-amber-50 text-amber-800",
  escalated: "bg-fuchsia-50 text-fuchsia-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
};

function Metric({ label, value, note, icon }: { label: string; value: number; note: string; icon: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{label}</p><span className="text-[#0C5A69]">{icon}</span></div><p className="mt-4 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></section>;
}

export default function TenantTicketsDashboardPage() {
  const [data, setData] = useState<TenantTicketDashboard | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setError("");
      setData(await ticketsApi.dashboard());
    } catch (cause) {
      setError(adminError(cause));
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (!data && !error) return <main className="p-8 text-slate-500">Loading ticket dashboard...</main>;
  if (!data) return <main className="p-8 text-red-700">{error} <button onClick={() => void load()} className="underline">Retry</button></main>;

  return <main className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#0C5A69]">Help and support</p><h1 className="mt-1 text-2xl font-bold text-slate-900">My tickets dashboard</h1><p className="mt-1 text-sm text-slate-500">Track support progress, replies, and actions needed from you.</p></div><Link to="/partner/tickets" className="rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white">View my tickets</Link></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Active tickets" value={data.metrics.active} note="Support work still in progress" icon={<Ticket size={19} />} /><Metric label="Action needed" value={data.metrics.waitingForYou} note="Reply or add requested details" icon={<MessageCircle size={19} />} /><Metric label="In progress" value={data.metrics.inProgress} note="Assigned or being investigated" icon={<Clock3 size={19} />} /><Metric label="Resolved" value={data.metrics.resolved} note="Ready for your confirmation" icon={<CheckCircle2 size={19} />} /></section>
    <section className="grid gap-5 lg:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-bold">Recent ticket updates</h2><p className="mt-1 text-xs text-slate-500">Your latest raised issues and their current support status.</p></div><span className="text-sm text-slate-500">{data.total} total</span></div><div className="mt-5 divide-y">{data.recentTickets.map((ticket) => <Link key={ticket.id} to={`/partner/tickets/${ticket.id}`} className="block py-4 first:pt-0 hover:bg-slate-50"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold text-[#0C5A69]">#{ticket.ticketNumber}</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{ticket.title}</p><p className="mt-1 text-xs text-slate-500">Updated {new Date(ticket.updatedAt).toLocaleString()}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[ticket.status] ?? "bg-slate-100 text-slate-700"}`}>{statusLabel(ticket.status)}</span></div></Link>)}{!data.recentTickets.length && <div className="py-14 text-center text-sm text-slate-500">No tickets raised yet. Create a ticket when you need support.</div>}</div></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">Status overview</h2><p className="mt-1 text-xs text-slate-500">Live count for your visible tickets.</p><div className="mt-5 space-y-3">{Object.entries(data.statuses).length ? Object.entries(data.statuses).map(([status, count]) => <div key={status} className="flex items-center justify-between text-sm"><span className="capitalize text-slate-600">{statusLabel(status)}</span><strong>{count}</strong></div>) : <p className="py-8 text-center text-sm text-slate-500">No ticket activity yet.</p>}</div><Link to="/partner/tickets" className="mt-6 inline-block text-sm font-semibold text-[#0C5A69]">Open ticket listing →</Link></div></section>
  </main>;
}
