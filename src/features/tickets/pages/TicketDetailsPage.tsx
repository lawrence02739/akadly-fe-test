import {
  ArrowLeft,
  CheckCircle,
  Clock3,
  LockKeyhole,
  MessageCircle,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import {
  adminApi,
  adminError,
  type AdminTicket,
  type TicketAssignee,
  type TicketMessage,
} from "../../admin/api/admin.api";
import { useAdminSession } from "../../admin/AdminSession";

type Dialog = "assign" | "settings" | "close" | null;
const priorities: AdminTicket["priority"][] = [
  "low",
  "medium",
  "high",
  "critical",
  "urgent",
];
const categories = [
  "course_access",
  "login",
  "technical",
  "certificate",
  "payment",
  "content",
  "whatsapp_integration",
  "other",
];
const display = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Not set";
const inputDate = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
function sla(value?: string | null, completed = false) {
  if (completed)
    return [
      "Completed",
      "bg-emerald-500",
      "bg-emerald-100 text-emerald-700",
      100,
    ] as const;
  if (!value)
    return [
      "Not set",
      "bg-slate-300",
      "bg-slate-100 text-slate-600",
      0,
    ] as const;
  const diff = new Date(value).getTime() - Date.now();
  const hours = Math.ceil(Math.abs(diff) / 3600000);
  if (diff < 0)
    return [
      `${hours}h overdue`,
      "bg-rose-500",
      "bg-rose-100 text-rose-700",
      100,
    ] as const;
  if (hours <= 4)
    return [
      `${hours}h remaining`,
      "bg-amber-500",
      "bg-amber-100 text-amber-800",
      80,
    ] as const;
  return [
    `${hours}h remaining`,
    "bg-[#0C5A69]",
    "bg-teal-100 text-[#0C5A69]",
    45,
  ] as const;
}

export default function TicketDetailsPage({
  adminMode = true,
}: {
  adminMode?: boolean;
}) {
  const { can } = useAdminSession();
  const canManage = can("ticket:manage");
  const { ticketId = "" } = useParams();
  const [ticket, setTicket] = useState<AdminTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [assignees, setAssignees] = useState<TicketAssignee[]>([]);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [reply, setReply] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [replySent, setReplySent] = useState(false);
  const [internal, setInternal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [reason, setReason] = useState("");
  const [assignee, setAssignee] = useState("");
  const [email, setEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    priority: "medium" as AdminTicket["priority"],
    category: "other",
    firstResponseDueAt: "",
    resolutionDueAt: "",
  });
  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const [item, thread, people] = await Promise.all([
        adminApi.ticket(ticketId),
        adminApi.ticketMessages(ticketId),
        adminApi.ticketAssignees(),
      ]);
      setTicket(item);
      setMessages(thread.items);
      setAssignees(people);
      setAssignee(item.assignedAdminUserId || "");
      setSettings({
        priority: item.priority,
        category: item.category,
        firstResponseDueAt: inputDate(item.firstResponseDueAt),
        resolutionDueAt: inputDate(item.resolutionDueAt),
      });
      setError("");
    } catch (e) {
      setError(adminError(e));
    } finally {
      setLoading(false);
    }
  }, [ticketId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const draft = localStorage.getItem(`ticket-reply-draft-${ticketId}`);
    if (draft) setReply(draft);
  }, [ticketId]);
  const run = async (
    work: () => Promise<unknown>,
    message: string,
    dismiss = false,
  ) => {
    setSaving(true);
    try {
      await work();
      await load();
      if (dismiss) setDialog(null);
      toast.success(message);
    } catch (e) {
      toast.error(adminError(e));
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <State text="Loading ticket..." />;
  if (error || !ticket)
    return <State text={error || "Ticket not found"} retry={load} />;
  const active = canManage && !["resolved", "closed"].includes(ticket.status);
  const first = sla(
    ticket.firstResponseDueAt,
    Boolean(ticket.firstRespondedAt),
  );
  const resolve = sla(ticket.resolutionDueAt, Boolean(ticket.resolvedAt));
  return (
    <section className="mx-auto max-w-7xl space-y-5 p-5 sm:p-8">
      <Link
        to={adminMode ? "/admin/tickets" : "/partner/tickets"}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C5A69]"
      >
        <ArrowLeft size={16} /> Back to tickets
      </Link>
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="font-bold text-[#0C5A69]">#{ticket.ticketNumber}</p>
            <h1 className="mt-1 text-2xl font-bold">{ticket.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Raised {display(ticket.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge value={ticket.status.replaceAll("_", " ")} />
            <Badge value={ticket.priority} tone="blue" />
          </div>
        </div>
        <div className="mt-5 border-t pt-5">
          <h2 className="text-sm font-bold">Issue description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {ticket.description}
          </p>
        </div>
        {ticket.attachments?.length ? (
          <div className="mt-5 border-t pt-4">
            <p className="text-xs font-bold uppercase text-slate-500">
              Attachments ({ticket.attachments.length})
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ticket.attachments.map((file, index) => (
                <a
                  key={file.fileUrl + index}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border bg-slate-50 px-3 py-2 text-sm font-semibold text-[#0C5A69]"
                >
                  {file.fileName}{" "}
                  <small>({Math.ceil(file.sizeBytes / 1024)} KB)</small>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </header>
      <div className="grid gap-5 xl:grid-cols-3">
        <main className="space-y-5 xl:col-span-2">
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b p-5">
              <MessageCircle className="text-[#0C5A69]" />
              <div>
                <h2 className="font-bold">Conversation</h2>
                <p className="text-xs text-slate-500">
                  {messages.length} messages
                </p>
              </div>
            </div>
            <div className="max-h-[34rem] space-y-4 overflow-y-auto bg-slate-50/60 p-5">
              {messages.length ? (
                messages.map((message) => (
                  <Message key={message.id} item={message} />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">
                  No conversation yet.
                </p>
              )}
            </div>
            {ticket.status !== "closed" && (
              <div className="border-t p-5">
                <div className="flex gap-2">
                  <button
                    onClick={() => setInternal(false)}
                    className={
                      !internal
                        ? "rounded bg-teal-50 px-3 py-1.5 text-sm font-semibold text-[#0C5A69]"
                        : "px-3 py-1.5 text-sm"
                    }
                  >
                    Reply to tenant
                  </button>
                  <button
                    onClick={() => setInternal(true)}
                    className={
                      internal
                        ? "rounded bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800"
                        : "px-3 py-1.5 text-sm"
                    }
                  >
                    Internal note
                  </button>
                </div>
                <div className="mt-3 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setReply(`${reply}**bold**`)}
                    className="rounded border px-2 py-1 text-xs font-bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setReply(`${reply}_italic_`)}
                    className="rounded border px-2 py-1 text-xs italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => setReply(`${reply}` + "`code`")}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    &lt;/&gt;
                  </button>
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="mt-2 min-h-28 w-full rounded-lg border p-3 text-sm"
                  placeholder={
                    internal
                      ? "Visible only to admins..."
                      : "Write a reply to the tenant..."
                  }
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded border px-2 py-1 text-xs text-[#0C5A69]">
                    Attach files
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      accept="image/png,image/jpeg,application/pdf,.doc,.docx,text/plain"
                      onChange={(e) =>
                        setFiles(
                          Array.from(e.target.files ?? [])
                            .filter((file) => file.size <= 10 * 1024 * 1024)
                            .slice(0, 5),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem(
                        `ticket-reply-draft-${ticket.id}`,
                        reply,
                      );
                      toast.success("Draft saved in this browser");
                    }}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    Save draft
                  </button>
                </div>
                {files.length ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {files.map((file) => file.name).join(", ")}
                  </p>
                ) : null}
                {replySent ? (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    Reply sent successfully. The ticket conversation and tenant
                    portal are updated.
                  </div>
                ) : null}
                <button
                  disabled={saving || !reply.trim()}
                  onClick={() =>
                    void run(
                      async () => {
                        const attachments = await Promise.all(
                          files.map((file) =>
                            adminApi.uploadTicketAttachment(file),
                          ),
                        );
                        return adminApi.addTicketMessage(ticket.id, {
                          body: reply.trim(),
                          isInternal: internal,
                          attachments,
                        });
                      },
                      internal ? "Internal note added" : "Reply sent",
                    ).then(() => {
                      setReply("");
                      setFiles([]);
                      setReplySent(true);
                      localStorage.removeItem(
                        `ticket-reply-draft-${ticket.id}`,
                      );
                    })
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {internal ? <LockKeyhole size={16} /> : <Send size={16} />}
                  {internal ? "Add internal note" : "Send reply"}
                </button>
              </div>
            )}
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Activity & history</h2>
            <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
              {ticket.activityHistory.map((entry, index) => (
                <div key={`${entry.createdAt}-${index}`}>
                  <p className="text-sm font-semibold capitalize">
                    {entry.type.replaceAll("_", " ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {entry.message || "Ticket updated"} ·{" "}
                    {display(entry.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </main>
        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase text-slate-500">
              Quick actions
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                disabled={saving || !active || Boolean(ticket.acknowledgedAt)}
                onClick={() =>
                  void run(
                    () => adminApi.acknowledgeTicket(ticket.id),
                    "Ticket acknowledged",
                  )
                }
                className="rounded-lg border border-emerald-300 px-2 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
              >
                {ticket.acknowledgedAt ? "Acknowledged" : "Acknowledge"}
              </button>
              <button
                disabled={saving || !active}
                onClick={() => setDialog("assign")}
                className="rounded-lg border px-2 py-2 text-xs font-semibold"
              >
                Assign to
              </button>
              <button
                disabled={saving || !active}
                onClick={() => setDialog("settings")}
                className="rounded-lg border border-amber-300 px-2 py-2 text-xs font-semibold text-amber-700"
              >
                Configure
              </button>
              <button
                disabled={saving || !canManage || ticket.status === "closed"}
                onClick={() => setDialog("close")}
                className="rounded-lg border border-rose-300 px-2 py-2 text-xs font-semibold text-rose-700"
              >
                Close issue
              </button>
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase text-slate-500">
              Ticket details
            </h2>
            <label className="mt-3 block text-sm text-slate-600">
              Status
              <select
                value={ticket.status}
                disabled={saving || !active}
                onChange={(e) =>
                  void run(
                    () =>
                      adminApi.updateTicketStatus(
                        ticket.id,
                        e.target.value as AdminTicket["status"],
                      ),
                    "Status updated",
                  )
                }
                className="mt-1 w-full rounded-lg border p-2 text-slate-800"
              >
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In progress</option>
                <option value="waiting_for_user">Waiting for user</option>
                <option value="pending">Pending</option>
                <option value="escalated">Escalated</option>
              </select>
            </label>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Priority" value={ticket.priority} />
              <Row
                label="Category"
                value={ticket.category.replaceAll("_", " ")}
              />
              <Row
                label="Assigned"
                value={
                  ticket.assignedAt ? display(ticket.assignedAt) : "Unassigned"
                }
              />
              <Row
                label="Acknowledged"
                value={display(ticket.acknowledgedAt)}
              />
            </dl>
          </section>
          <Sla
            title="First response SLA"
            due={ticket.firstResponseDueAt}
            state={first}
          />
          <Sla
            title="Resolution SLA"
            due={ticket.resolutionDueAt}
            state={resolve}
          />
          <RequesterProfile profile={ticket.requesterProfile} />
          <RelatedTickets items={ticket.relatedTickets ?? []} />
          <Tags
            tags={ticket.tags ?? []}
            disabled={!active || saving}
            save={(tags) =>
              void run(
                () => adminApi.updateTicketDetails(ticket.id, { tags }),
                "Tags updated",
              )
            }
          />
          {active && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase text-slate-500">
                Resolve ticket
              </h2>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="mt-3 min-h-24 w-full rounded-lg border p-3 text-sm"
                placeholder="Resolution note (required)"
              />
              <label className="mt-3 flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={email}
                  onChange={(e) => setEmail(e.target.checked)}
                />{" "}
                Send resolution email
              </label>
              <button
                disabled={saving || resolution.trim().length < 3}
                onClick={() =>
                  void run(
                    () =>
                      adminApi.resolveTicket(ticket.id, {
                        resolutionNote: resolution.trim(),
                        sendResolutionEmail: email,
                      }),
                    "Ticket resolved",
                  ).then(() => setResolution(""))
                }
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                <CheckCircle size={16} /> Resolve
              </button>
            </section>
          )}
          {["resolved", "closed"].includes(ticket.status) && (
            <button
              onClick={() =>
                void run(
                  () => adminApi.reopenTicket(ticket.id),
                  "Ticket reopened",
                )
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0C5A69] px-3 py-2 text-sm font-bold text-[#0C5A69]"
            >
              <RotateCcw size={16} /> Reopen ticket
            </button>
          )}
        </aside>
      </div>
      {dialog === "assign" && (
        <Dialog title="Assign ticket" close={() => setDialog(null)}>
          <p className="text-sm text-slate-500">
            Select the platform admin responsible for this ticket.
          </p>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="mt-4 w-full rounded-lg border p-3"
          >
            <option value="">Choose an admin</option>
            {assignees.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} · {user.email}
              </option>
            ))}
          </select>
          <button
            disabled={!assignee || saving}
            onClick={() =>
              void run(
                () => adminApi.assignTicket(ticket.id, assignee),
                "Ticket assigned",
                true,
              )
            }
            className="mt-5 w-full rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Confirm assignment
          </button>
        </Dialog>
      )}
      {dialog === "settings" && (
        <Dialog title="Configure ticket settings" close={() => setDialog(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priority">
              <select
                value={settings.priority}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    priority: e.target.value as AdminTicket["priority"],
                  })
                }
              >
                {priorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                value={settings.category}
                onChange={(e) =>
                  setSettings({ ...settings, category: e.target.value })
                }
              >
                {categories.map((item) => (
                  <option key={item}>{item.replaceAll("_", " ")}</option>
                ))}
              </select>
            </Field>
            <Field label="First response due">
              <input
                type="datetime-local"
                value={settings.firstResponseDueAt}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    firstResponseDueAt: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Resolution due">
              <input
                type="datetime-local"
                value={settings.resolutionDueAt}
                onChange={(e) =>
                  setSettings({ ...settings, resolutionDueAt: e.target.value })
                }
              />
            </Field>
          </div>
          <button
            disabled={saving}
            onClick={() =>
              void run(
                () =>
                  adminApi.updateTicketDetails(ticket.id, {
                    priority: settings.priority,
                    category: settings.category,
                    firstResponseDueAt: settings.firstResponseDueAt
                      ? new Date(settings.firstResponseDueAt).toISOString()
                      : undefined,
                    resolutionDueAt: settings.resolutionDueAt
                      ? new Date(settings.resolutionDueAt).toISOString()
                      : undefined,
                  }),
                "Ticket settings saved",
                true,
              )
            }
            className="mt-5 w-full rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-bold text-white"
          >
            Save settings
          </button>
        </Dialog>
      )}
      {dialog === "close" && (
        <Dialog title="Close issue" close={() => setDialog(null)}>
          <p className="text-sm text-slate-500">
            Add a closure reason. It will be recorded in ticket history.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-4 min-h-28 w-full rounded-lg border p-3 text-sm"
            placeholder="Closure reason"
          />
          <button
            disabled={saving || reason.trim().length < 3}
            onClick={() =>
              void run(
                () => adminApi.closeTicket(ticket.id, reason.trim()),
                "Ticket closed",
                true,
              )
            }
            className="mt-5 w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Close ticket
          </button>
        </Dialog>
      )}
    </section>
  );
}
function Message({ item }: { item: TicketMessage }) {
  const internal = item.isInternal;
  const admin = item.authorType === "admin";
  return (
    <article
      className={
        admin && !internal ? "flex flex-row-reverse gap-3" : "flex gap-3"
      }
    >
      <span
        className={
          internal
            ? "grid size-9 place-items-center rounded-full bg-amber-100 text-amber-700"
            : admin
              ? "grid size-9 place-items-center rounded-full bg-[#0C5A69] text-white"
              : "grid size-9 place-items-center rounded-full border bg-white"
        }
      >
        {internal ? <LockKeyhole size={16} /> : <MessageCircle size={17} />}
      </span>
      <div className="max-w-[85%]">
        <p className="mb-1 text-xs font-bold">
          {internal ? "Internal note" : admin ? "Support team" : "Tenant"}{" "}
          <span className="font-normal text-slate-400">
            {display(item.createdAt)}
          </span>
        </p>
        <p
          className={
            internal
              ? "rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm"
              : admin
                ? "rounded-xl bg-[#0C5A69] p-3 text-sm text-white"
                : "rounded-xl border bg-white p-3 text-sm"
          }
        >
          {item.body}
        </p>
        {item.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.attachments.map((file, index) => (
              <a
                key={file.fileUrl + index}
                href={file.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded border bg-white px-2 py-1 text-xs text-[#0C5A69]"
              >
                {file.fileName}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
function RequesterProfile({
  profile,
}: {
  profile?: AdminTicket["requesterProfile"];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase text-slate-500">
        Customer profile
      </h2>
      {profile ? (
        <div className="mt-4 space-y-2 text-sm">
          <p className="font-bold text-slate-900">{profile.name}</p>
          <p className="break-all text-xs text-slate-500">
            {profile.email || "Email unavailable"}
          </p>
          <Row
            label="Organization"
            value={profile.organizationName || "Not available"}
          />
          <Row
            label="Organization type"
            value={profile.organizationType || "Not available"}
          />
          <Row
            label="Member status"
            value={profile.memberStatus || "Not available"}
          />
          <Row label="Joined" value={display(profile.joinedAt)} />
          {profile.courseTitle && (
            <>
              <Row label="Related course" value={profile.courseTitle} />
              <Row
                label="Course language"
                value={profile.courseLanguage || "Not set"}
              />
            </>
          )}
          {profile.cohort && <Row label="Cohort" value={profile.cohort} />}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Profile information is unavailable for this ticket.
        </p>
      )}
    </section>
  );
}
function RelatedTickets({
  items,
}: {
  items: NonNullable<AdminTicket["relatedTickets"]>;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase text-slate-500">
          Related issues
        </h2>
        <span className="text-xs text-slate-400">{items.length}</span>
      </div>
      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/admin/tickets/${item._id}`}
              className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
            >
              <div className="flex justify-between gap-2">
                <span className="text-xs font-bold text-[#0C5A69]">
                  #{item.ticketNumber}
                </span>
                <Badge value={item.status.replaceAll("_", " ")} />
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                {item.title}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Updated {display(item.updatedAt)}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No related tickets for this customer and issue.
        </p>
      )}
    </section>
  );
}
function Tags({
  tags,
  disabled,
  save,
}: {
  tags: string[];
  disabled: boolean;
  save: (tags: string[]) => void;
}) {
  const [value, setValue] = useState("");
  const add = () => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      save([...tags, tag]);
      setValue("");
    }
  };
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-bold uppercase text-slate-500">Tags</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag) => (
            <button
              key={tag}
              disabled={disabled}
              onClick={() => save(tags.filter((item) => item !== tag))}
              className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-[#0C5A69] disabled:opacity-60"
            >
              {tag} ×
            </button>
          ))
        ) : (
          <span className="text-sm text-slate-500">No tags yet.</span>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          maxLength={50}
          className="min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-sm"
          placeholder="Add tag"
        />
        <button
          disabled={disabled || !value.trim()}
          onClick={add}
          className="rounded-lg border border-[#0C5A69] px-2 py-1 text-xs font-bold text-[#0C5A69] disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </section>
  );
}
function Sla({
  title,
  due,
  state,
}: {
  title: string;
  due?: string | null;
  state: readonly [string, string, string, number];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between">
        <h2 className="text-xs font-bold uppercase text-slate-500">{title}</h2>
        <Clock3 size={16} className="text-slate-400" />
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded bg-slate-100">
        <div
          className={"h-full " + state[1]}
          style={{ width: `${state[3]}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={"rounded-full px-2 py-1 text-xs font-bold " + state[2]}
        >
          {state[0]}
        </span>
        <span className="text-right text-[11px] text-slate-500">
          Due {display(due)}
        </span>
      </div>
    </section>
  );
}
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      onMouseDown={close}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="mt-1 block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:p-2 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:p-2">
        {children}
      </span>
    </label>
  );
}
function Badge({
  value,
  tone = "rose",
}: {
  value: string;
  tone?: "rose" | "blue";
}) {
  return (
    <span
      className={
        "h-fit rounded-full px-3 py-1 text-xs font-bold capitalize " +
        (tone === "blue"
          ? "bg-blue-50 text-blue-700"
          : "bg-rose-50 text-rose-700")
      }
    >
      {value}
    </span>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right capitalize">{value}</dd>
    </div>
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
