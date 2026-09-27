import {
  CheckCircle2,
  Clock3,
  FileDown,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminError,
  ticketsApi,
  type TicketDashboard,
} from "../../tickets/api/tickets.api";

const statusLabels: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In progress",
  waiting_for_user: "Waiting for user",
  pending: "Pending",
  escalated: "Escalated",
  resolved: "Resolved",
  closed: "Closed",
};
const statusTones: Record<string, string> = {
  open: "bg-rose-50 text-rose-700",
  assigned: "bg-blue-50 text-blue-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  waiting_for_user: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  escalated: "bg-fuchsia-50 text-fuchsia-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
};
const categoryLabels: Record<string, string> = {
  course_access: "Course access",
  login: "Login & access",
  technical: "Technical issues",
  certificate: "Certificates",
  payment: "Billing & payments",
  content: "Content",
  whatsapp_integration: "WhatsApp",
  other: "Other support",
};

function Metric({
  label,
  value,
  note,
  tone,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span className={"rounded-lg p-2 " + tone}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </section>
  );
}

export default function ReportsPage() {
  const [data, setData] = useState<TicketDashboard | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setError("");
      setData(await ticketsApi.dashboard());
    } catch (requestError) {
      setError(adminError(requestError));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (!data && !error) return <State text="Loading ticket dashboard..." />;
  if (error || !data)
    return (
      <State text={error || "Unable to load ticket dashboard"} retry={load} />
    );

  const maxDaily = Math.max(1, ...data.daily.map((day) => day.total));
  const priorityRows = ["low", "medium", "high", "critical", "urgent"];
  const maxPriority = Math.max(
    1,
    ...priorityRows.map((key) => data.priorities[key] || 0),
  );
  const exportDashboard = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total tickets", String(data.total)],
      ["Open tickets", String(data.metrics.open)],
      ["Pending response", String(data.metrics.pendingResponse)],
      ["Resolved this week", String(data.metrics.resolvedThisWeek)],
      ["Escalations", String(data.metrics.escalated)],
      [
        "Average first response (minutes)",
        String(data.metrics.averageFirstResponseMinutes ?? "N/A"),
      ],
      [],
      ["Date", "Created", "Resolved"],
      ...data.daily.map((day) => [
        day._id,
        String(day.total),
        String(day.resolved),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "tickets-dashboard.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-[#0C5A69]">
            Support operations
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Tickets Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage support requests, queues and resolution progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/partner/tickets"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <Ticket size={16} /> My tickets
          </Link>
          <button
            type="button"
            onClick={exportDashboard}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-3 py-2 text-sm font-semibold text-white"
          >
            <FileDown size={16} /> Export data
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Open tickets"
          value={data.metrics.open}
          note="Needs active support work"
          tone="bg-rose-50 text-rose-600"
          icon={<Ticket size={18} />}
        />
        <Metric
          label="Pending response"
          value={data.metrics.pendingResponse}
          note="Waiting for user or support"
          tone="bg-amber-50 text-amber-600"
          icon={<Clock3 size={18} />}
        />
        <Metric
          label="Resolved this week"
          value={data.metrics.resolvedThisWeek}
          note="Confirmed resolutions in 7 days"
          tone="bg-emerald-50 text-emerald-600"
          icon={<CheckCircle2 size={18} />}
        />
        <Metric
          label="Avg response time"
          value={data.metrics.averageFirstResponseMinutes ?? 0}
          note={
            data.metrics.averageFirstResponseMinutes === null
              ? "No first response recorded yet"
              : "Minutes to first support reply"
          }
          tone="bg-fuchsia-50 text-fuchsia-600"
          icon={<Clock3 size={18} />}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Tickets by day</h2>
              <p className="mt-1 text-xs text-slate-500">
                Created and resolved tickets in the last 7 days.
              </p>
            </div>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#0C5A69]">
              Last 7 days
            </span>
          </div>
          <div className="mt-7 grid h-52 grid-cols-7 items-end gap-3 border-b border-slate-100 px-2">
            {data.daily.map((day) => (
              <div
                key={day._id}
                className="flex h-full flex-col justify-end text-center"
              >
                <span className="mb-2 text-xs font-bold text-slate-600">
                  {day.total}
                </span>
                <div className="relative h-full">
                  <div
                    style={{
                      height:
                        Math.max(
                          day.total ? 12 : 2,
                          Math.round((day.total / maxDaily) * 100),
                        ) + "%",
                    }}
                    className="absolute bottom-0 w-full rounded-t-md bg-[#0C5A69]"
                  />
                  <div
                    style={{
                      height:
                        Math.max(
                          day.resolved ? 10 : 0,
                          Math.round((day.resolved / maxDaily) * 100),
                        ) + "%",
                    }}
                    className="absolute bottom-0 w-full rounded-t-md bg-emerald-500"
                  />
                </div>
                <span className="mt-3 text-[11px] text-slate-500">
                  {new Date(day._id + "T00:00:00").toLocaleDateString(
                    undefined,
                    { weekday: "short" },
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <i className="size-2 rounded-full bg-[#0C5A69]" /> Created
            </span>
            <span className="flex items-center gap-1">
              <i className="size-2 rounded-full bg-emerald-500" /> Resolved
            </span>
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Recent conversations</h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest public replies and support updates
              </p>
            </div>
            <TrendingUp size={17} className="text-[#0C5A69]" />
          </div>
          <div className="mt-4 space-y-3">
            {data.recentActivity.length ? (
              data.recentActivity.slice(0, 5).map((activity) => (
                <Link
                  key={activity._id}
                  to={"/partner/tickets/" + activity.ticketId}
                  className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-[#0C5A69]">
                      #{activity.ticketNumber}
                    </p>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-bold " +
                        statusTones[activity.ticketStatus]
                      }
                    >
                      {statusLabels[activity.ticketStatus]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {activity.authorType === "admin" ? "Support: " : "You: "}
                    {activity.body}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No conversation updates yet.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Queue overview</h2>
              <p className="mt-1 text-xs text-slate-500">
                Live support categories
              </p>
            </div>
            <span className="text-xs text-slate-400">{data.total} total</span>
          </div>
          <div className="mt-5 space-y-4">
            {data.categories.length ? (
              data.categories.map((category) => (
                <div key={category._id}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {categoryLabels[category._id] || category._id}
                    </span>
                    <span className="text-slate-500">
                      {category.open} open / {category.total}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full rounded bg-[#0C5A69]"
                      style={{
                        width:
                          Math.round(
                            (category.open / Math.max(1, category.total)) * 100,
                          ) + "%",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No queues yet.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Priority mix</h2>
          <p className="mt-1 text-xs text-slate-500">Open tickets by urgency</p>
          <div className="mt-6 grid h-36 grid-cols-5 items-end gap-3 border-b border-slate-100">
            {priorityRows.map((priority) => {
              const count = data.priorities[priority] || 0;
              return (
                <div
                  key={priority}
                  className="flex h-full flex-col justify-end text-center"
                >
                  <span className="mb-2 text-xs font-bold">{count}</span>
                  <div
                    className={
                      priority === "critical" || priority === "urgent"
                        ? "rounded-t bg-rose-500"
                        : priority === "high"
                          ? "rounded-t bg-amber-500"
                          : "rounded-t bg-[#0C5A69]"
                    }
                    style={{
                      height:
                        Math.max(
                          count ? 12 : 2,
                          Math.round((count / maxPriority) * 100),
                        ) + "%",
                    }}
                  />
                  <span className="mt-2 text-[10px] capitalize text-slate-500">
                    {priority}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Status distribution</h2>
          <p className="mt-1 text-xs text-slate-500">All current tickets</p>
          <div className="mt-5 space-y-2.5">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-bold text-slate-800">
                  {data.statuses[status] || 0}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
function State({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <section className="p-10 text-center text-slate-500">
      <p>{text}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-3 rounded border px-3 py-1.5 text-[#0C5A69]"
        >
          Retry
        </button>
      )}
    </section>
  );
}
