import {
  ArrowLeft,
  CircleUserRound,
  MessageCircle,
  Pencil,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import {
  adminError,
  ticketsApi,
  type TicketMessage,
  type TicketRecord,
  type TenantPlanContext,
} from "../api/tickets.api";

const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
function activityLabel(activity: TicketRecord["activityHistory"][number]) {
  if (activity.type === "priority_changed") return `Support changed priority from ${titleCase(activity.previousValue || "not set")} to ${titleCase(activity.newValue || "not set")}`;
  if (activity.type === "category_changed") return `Support updated ${activity.message?.toLowerCase().includes("issue type") ? "issue type" : "category"} from ${titleCase(activity.previousValue || "not set")} to ${titleCase(activity.newValue || "not set")}`;
  if (activity.type === "rating_submitted") return activity.message || `You rated the support experience ${activity.newValue || ""}/5`;
  return activity.message || titleCase(activity.type);
}
function slaState(due?: string | null) {
  if (!due) return { label: "Not set", className: "bg-slate-100 text-slate-600" };
  const milliseconds = new Date(due).getTime() - Date.now();
  if (milliseconds < 0) return { label: "Overdue", className: "bg-rose-100 text-rose-700" };
  if (milliseconds <= 2 * 60 * 60 * 1000) return { label: "Due soon", className: "bg-amber-100 text-amber-800" };
  return { label: "On track", className: "bg-emerald-100 text-emerald-700" };
}
function SupportRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="max-w-[60%] text-right font-semibold capitalize text-slate-800">{value}</dd></div>;
}
function TenantSla({ label, due }: { label: string; due?: string | null }) {
  const state = slaState(due);
  return <div className="rounded-lg border border-slate-100 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-700">{label}</p><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${state.className}`}>{state.label}</span></div><p className="mt-1 text-xs text-slate-500">{due ? `Due ${new Date(due).toLocaleString()}` : "Support has not set a deadline yet."}</p></div>;
}
function TenantPlanCard({ context }: { context?: TenantPlanContext }) {
  if (!context) return null;
  const plan = context.plan;
  const limit = (value: number | null) => value === null ? "Unlimited" : String(value);
  return <section className="rounded-xl border border-teal-200 bg-teal-50 p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold text-slate-900">Workspace plan and usage</h2><p className="mt-1 text-sm text-slate-600">Support uses this live account context while handling your request.</p></div><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold capitalize text-slate-700">{context.paymentStatus ?? "payment unknown"}</span></div>{plan ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><PlanValue label="Plan" value={plan.name} /><PlanValue label="Users" value={`${context.usage.users} / ${limit(plan.limits.users)}`} /><PlanValue label="Courses" value={`${context.usage.courses} / ${limit(plan.limits.courses)}`} /><PlanValue label="Students" value={`Limit: ${limit(plan.limits.students)}`} /><PlanValue label="Content storage" value={`Limit: ${limit(plan.limits.contentBytes)}`} /></div> : <p className="mt-3 text-sm text-slate-600">No plan is assigned to this workspace yet.</p>}</section>;
}
function PlanValue({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-teal-100 bg-white p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-800">{value}</p></div>; }

export default function TenantTicketDetailsPage() {
  const { ticketId = "" } = useParams();
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    relatedEntityType: "",
    referenceUrl: "",
  });
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError("");
    try {
      const [current, conversation] = await Promise.all([
        ticketsApi.get(ticketId),
        ticketsApi.messages(ticketId),
      ]);
      setTicket(current);
      setMessages(conversation.items);
    } catch (e) {
      setError(adminError(e));
    } finally {
      setLoading(false);
    }
  }, [ticketId]);
  useEffect(() => {
    void load();
  }, [load]);
  const send = async () => {
    if (!reply.trim() || !ticket) return;
    setSaving(true);
    try {
      const attachments = await Promise.all(replyFiles.map((file) => ticketsApi.presignAttachment(file)));
      await ticketsApi.reply(ticket.id, reply, attachments);
      setReply("");
      setReplyFiles([]);
      await load();
      toast.success("Reply sent to support");
    } catch (e) {
      toast.error(adminError(e));
    } finally {
      setSaving(false);
    }
  };
  const rate = async () => {
    if (!ticket || !rating) return;
    setSaving(true);
    try {
      await ticketsApi.rate(ticket.id, {
        rating,
        comment: ratingComment || undefined,
      });
      await load();
      toast.success("Thank you for your feedback");
    } catch (requestError) {
      toast.error(adminError(requestError));
    } finally {
      setSaving(false);
    }
  };
  const reopen = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await ticketsApi.reopen(ticket.id);
      await load();
      toast.success("Ticket reopened");
    } catch (e) {
      toast.error(adminError(e));
    } finally {
      setSaving(false);
    }
  };
  const close = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await ticketsApi.close(ticket.id);
      await load();
      toast.success("Ticket closed");
    } catch (e) {
      toast.error(adminError(e));
    } finally {
      setSaving(false);
    }
  };
  const openEdit = () => {
    if (!ticket) return;
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      relatedEntityType: ticket.relatedEntityType ?? "",
      referenceUrl: ticket.referenceUrl ?? "",
    });
    setEditFiles([]);
    setEditOpen(true);
  };
  const saveEdit = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const attachments = await Promise.all(
        editFiles.map((file) => ticketsApi.presignAttachment(file)),
      );
      const updated = await ticketsApi.update(ticket.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        relatedEntityType: editForm.relatedEntityType.trim() || null,
        referenceUrl: editForm.referenceUrl.trim() || null,
        attachments,
      });
      setTicket(updated);
      setEditOpen(false);
      toast.success("Ticket updated");
    } catch (e) {
      toast.error(adminError(e));
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <PageState text="Loading ticket…" />;
  if (error || !ticket)
    return <PageState text={error || "Ticket not found"} retry={load} />;
  const resolved = ticket.status === "resolved" || ticket.status === "closed";
  const supportName = ticket.assignedAdminName || (ticket.assignedAdminUserId ? "Support team" : "Awaiting support assignment");
  return (
    <section className="mx-auto max-w-4xl space-y-5 p-5 sm:p-8">
      <Link
        to="/partner/tickets"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C5A69]"
      >
        <ArrowLeft size={16} /> My tickets
      </Link>
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#0C5A69]">
              #{ticket.ticketNumber}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{ticket.title}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Raised {new Date(ticket.createdAt).toLocaleString()} ·{" "}
              {ticket.module} · {ticket.issueType}
            </p>
          </div>
          <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
            {ticket.status}
          </span>
        </div>
        <p className="mt-5 border-t pt-5 text-sm leading-6 text-slate-600">
          {ticket.description}
        </p>
        {ticket.referenceUrl && (
          <a
            href={ticket.referenceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex max-w-full break-all text-sm font-semibold text-[#0C5A69] underline"
          >
            Open affected page
          </a>
        )}
        {ticket.attachments?.length ? (
          <div className="mt-5 border-t pt-4">
            <p className="text-xs font-bold uppercase text-slate-500">Attachments ({ticket.attachments.length})</p>
            <div className="mt-3 flex flex-wrap gap-2">{ticket.attachments.map((attachment) => <a key={`${attachment.fileUrl}-${attachment.fileName}`} href={attachment.fileUrl} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#0C5A69] hover:bg-teal-50">{attachment.fileName}</a>)}</div>
          </div>
        ) : null}
        {!resolved && (
          <button
            type="button"
            onClick={openEdit}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={15} /> Edit issue
          </button>
        )}
      </header>
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-ticket-title"
          onMouseDown={() => !saving && setEditOpen(false)}
        >
          <section
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="edit-ticket-title" className="text-lg font-bold text-slate-900">Edit issue</h2>
            <p className="mt-1 text-sm text-slate-500">Update the information that will help support resolve this ticket.</p>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Title<input value={editForm.title} maxLength={200} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="block text-sm font-semibold text-slate-700">Description<textarea value={editForm.description} maxLength={10000} rows={6} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="block text-sm font-semibold text-slate-700">Related course, form, payment, or account item<input value={editForm.relatedEntityType} maxLength={80} onChange={(event) => setEditForm({ ...editForm, relatedEntityType: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <label className="block text-sm font-semibold text-slate-700">Affected page URL<input type="url" value={editForm.referenceUrl} maxLength={2048} onChange={(event) => setEditForm({ ...editForm, referenceUrl: event.target.value })} placeholder="https://portal.example.com/page" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
              <section><p className="text-sm font-semibold text-slate-700">Add screenshots or files</p><p className="mt-1 text-xs text-slate-500">New files are added to existing attachments. Existing files are not replaced.</p><input type="file" multiple accept="image/png,image/jpeg,application/pdf,.doc,.docx,text/plain" onChange={(event) => { const selected = Array.from(event.target.files ?? []); const valid = selected.filter((file) => file.size <= 10 * 1024 * 1024); if (valid.length !== selected.length) toast.error("Each file must be 10 MB or smaller"); setEditFiles((current) => [...current, ...valid].slice(0, 5)); event.currentTarget.value = ""; }} className="mt-3 block w-full text-sm" />{editFiles.length > 0 && <ul className="mt-2 space-y-1 text-sm text-slate-600">{editFiles.map((file, index) => <li key={`${file.name}-${index}`} className="flex justify-between gap-3"><span className="truncate">{file.name}</span><button type="button" onClick={() => setEditFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))} className="font-semibold text-red-700">Remove</button></li>)}</ul>}</section>
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={saving} onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Cancel</button><button type="button" disabled={saving || editForm.title.trim().length < 3 || editForm.description.trim().length < 3} onClick={saveEdit} className="rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button></div>
          </section>
        </div>
      )}
      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div><h2 className="font-bold">Support status</h2><dl className="mt-4 space-y-3 text-sm"><SupportRow label="Current status" value={ticket.status.replaceAll("_", " ")} /><SupportRow label="Assigned support" value={supportName} /><SupportRow label="Priority" value={ticket.priority} /></dl></div>
        <div><h2 className="font-bold">Service deadlines</h2><div className="mt-4 space-y-3"><TenantSla label="First response" due={ticket.firstResponseDueAt} /><TenantSla label="Resolution" due={ticket.resolutionDueAt} /></div></div>
      </section>
      <TenantPlanCard context={ticket.tenantPlan} />
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold">Ticket progress</h2>
        <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
          {ticket.activityHistory.map((activity, index) => (
            <div key={`${activity.createdAt}-${index}`}>
              <p className="text-sm font-semibold">{activityLabel(activity)}</p>
              <p className="text-xs text-slate-500">
                {activity.message || "Ticket updated"} ·{" "}
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
      {resolved && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="font-bold text-emerald-900">Issue resolved</h2>
          <p className="mt-2 text-sm text-emerald-800">
            {ticket.resolutionNote || "Support marked this ticket as resolved."}
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            Resolution email: {ticket.resolutionEmailStatus}
          </p>
          <button
            disabled={saving}
            onClick={reopen}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800"
          >
            <RotateCcw size={15} /> Reopen issue
          </button>
          {resolved &&
            (ticket.satisfactionRating ? (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-3 text-emerald-900">
                <div className="flex items-center gap-1" aria-label={`${ticket.satisfactionRating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((value) => <Star key={value} size={18} className={value <= ticket.satisfactionRating! ? "fill-amber-400 text-amber-400" : "text-slate-300"} />)}
                </div>
                <p className="mt-2 text-sm font-semibold">Thanks for your {ticket.satisfactionRating}/5 support rating.</p>
                {ticket.satisfactionComment && <p className="mt-1 text-sm text-emerald-800">“{ticket.satisfactionComment}”</p>}
              </div>
            ) : (
              <div className="mt-5 border-t border-emerald-200 pt-4">
                <p className="text-sm font-bold text-emerald-900">
                  Rate your support experience
                </p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={
                        value <= rating
                          ? "text-xl text-amber-500"
                          : "text-xl text-slate-300"
                      }
                      aria-label={`Rate ${value} out of 5 stars`}
                    >
                      <Star size={23} fill={value <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={ratingComment}
                  onChange={(event) => setRatingComment(event.target.value)}
                  maxLength={2000}
                  className="mt-2 min-h-20 w-full rounded-lg border border-emerald-200 bg-white p-2 text-sm"
                  placeholder="Optional feedback"
                />
                <button
                  disabled={saving || !rating}
                  onClick={rate}
                  className="mt-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Submit rating
                </button>
              </div>
            ))}
        </section>
      )}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-teal-50 text-[#0C5A69]">
              <MessageCircle size={18} />
            </span>
            <div>
              <h2 className="font-bold">Conversation</h2>
              <p className="text-xs text-slate-500">
                {messages.length} message{messages.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <ShieldCheck size={13} /> Visible to support
          </span>
        </div>
        <div className="max-h-[34rem] space-y-4 overflow-y-auto bg-slate-50/60 p-5 sm:p-6">
          {messages.length ? (
            messages.map((message) => {
              const mine = message.authorType === "tenant";
              return (
                <article
                  key={message.id}
                  className={
                    mine ? "flex flex-row-reverse gap-3" : "flex gap-3"
                  }
                >
                  <span
                    className={
                      mine
                        ? "grid size-9 shrink-0 place-items-center rounded-full bg-[#0C5A69] text-white"
                        : "grid size-9 shrink-0 place-items-center rounded-full border border-teal-100 bg-white text-[#0C5A69]"
                    }
                  >
                    <CircleUserRound size={19} />
                  </span>
                  <div className="max-w-[85%]">
                    <div
                      className={
                        mine
                          ? "mb-1 flex justify-end gap-2 text-xs"
                          : "mb-1 flex gap-2 text-xs"
                      }
                    >
                      <span className="font-bold text-slate-700">
                        {mine ? "You" : "Support team"}
                      </span>
                      <span className="text-slate-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={
                        mine
                          ? "rounded-2xl rounded-tr-sm bg-[#0C5A69] px-4 py-3 text-sm leading-6 text-white"
                          : "rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"
                      }
                    >
                      <p className="whitespace-pre-wrap">{message.body}</p>
                    </div>
                    {message.attachments?.length ? (
                      <div className={mine ? "mt-2 flex flex-wrap justify-end gap-2" : "mt-2 flex flex-wrap gap-2"}>
                        {message.attachments.map((attachment, index) => (
                          <a key={`${attachment.fileUrl}-${index}`} href={attachment.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0C5A69] hover:bg-teal-50">
                            {attachment.fileName}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <MessageCircle className="mx-auto text-slate-300" size={28} />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                No conversation yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add details below and the support team will receive them.
              </p>
            </div>
          )}
        </div>
        {!resolved && (
          <div className="border-t border-slate-100 bg-white p-5 sm:p-6">
            <label
              htmlFor="tenant-ticket-reply"
              className="text-sm font-bold text-slate-800"
            >
              Add a reply
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Your message is shared with the support team.
            </p>
            <textarea
              id="tenant-ticket-reply"
              value={reply}
              maxLength={4000}
              onChange={(e) => setReply(e.target.value)}
              className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-[#0C5A69] focus:ring-2 focus:ring-teal-100"
              placeholder="Describe the update, question, or information that can help support..."
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-[#0C5A69] hover:bg-teal-50">
                Attach files
                <input type="file" multiple className="sr-only" accept="image/png,image/jpeg,application/pdf,.doc,.docx,text/plain" onChange={(event) => { const selected = Array.from(event.target.files ?? []); const valid = selected.filter((file) => file.size <= 10 * 1024 * 1024); if (valid.length !== selected.length) toast.error("Each file must be 10 MB or smaller"); setReplyFiles((current) => [...current, ...valid].slice(0, 5)); event.currentTarget.value = ""; }} />
              </label>
              {replyFiles.map((file, index) => <span key={`${file.name}-${index}`} className="inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">{file.name}<button type="button" onClick={() => setReplyFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="font-bold text-red-700">Remove</button></span>)}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {reply.length}/4000
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={saving}
                  onClick={close}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Close ticket
                </button>
                <button
                  disabled={saving || !reply.trim()}
                  onClick={send}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#094b57] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={16} /> {saving ? "Sending..." : "Send reply"}
                </button>
              </div>
            </div>
          </div>
        )}
        {resolved && (
          <div className="border-t border-slate-100 bg-white p-5 text-sm text-slate-600 sm:p-6">
            This ticket is resolved. Select <strong>Reopen issue</strong> above if you need to send a new message to support.
          </div>
        )}
      </section>
    </section>
  );
}
function PageState({ text, retry }: { text: string; retry?: () => void }) {
  return (
    <section className="mx-auto max-w-4xl p-8 text-center text-slate-500">
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
