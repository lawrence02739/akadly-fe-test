import { ArrowLeft, CircleUserRound, MessageCircle, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { adminError, ticketsApi, type TicketMessage, type TicketRecord } from "../api/tickets.api";

export default function TenantTicketDetailsPage() {
  const { ticketId = "" } = useParams(); const [ticket, setTicket] = useState<TicketRecord | null>(null); const [messages, setMessages] = useState<TicketMessage[]>([]); const [reply, setReply] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const [rating, setRating] = useState(0); const [ratingComment, setRatingComment] = useState("");
  const load = useCallback(async () => { if (!ticketId) return; setLoading(true); setError(""); try { const [current, conversation] = await Promise.all([ticketsApi.get(ticketId), ticketsApi.messages(ticketId)]); setTicket(current); setMessages(conversation.items); } catch (e) { setError(adminError(e)); } finally { setLoading(false); } }, [ticketId]);
  useEffect(() => { void load(); }, [load]);
  const send = async () => { if (!reply.trim() || !ticket) return; setSaving(true); try { await ticketsApi.reply(ticket.id, reply); setReply(""); await load(); toast.success("Reply sent to support"); } catch (e) { toast.error(adminError(e)); } finally { setSaving(false); } };
  const rate = async () => { if (!ticket || !rating) return; setSaving(true); try { await ticketsApi.rate(ticket.id, { rating, comment: ratingComment || undefined }); await load(); toast.success("Thank you for your feedback"); } catch (requestError) { toast.error(adminError(requestError)); } finally { setSaving(false); } };
  const reopen = async () => { if (!ticket) return; setSaving(true); try { await ticketsApi.reopen(ticket.id); await load(); toast.success("Ticket reopened"); } catch (e) { toast.error(adminError(e)); } finally { setSaving(false); } };
  const close = async () => { if (!ticket) return; setSaving(true); try { await ticketsApi.close(ticket.id); await load(); toast.success("Ticket closed"); } catch (e) { toast.error(adminError(e)); } finally { setSaving(false); } };
  if (loading) return <PageState text="Loading ticket…" />; if (error || !ticket) return <PageState text={error || "Ticket not found"} retry={load} />;
  const resolved = ticket.status === "resolved" || ticket.status === "closed";
  return <section className="mx-auto max-w-4xl space-y-5 p-5 sm:p-8"><Link to="/partner/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C5A69]"><ArrowLeft size={16} /> My tickets</Link>
    <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-sm font-bold text-[#0C5A69]">#{ticket.ticketNumber}</p><h1 className="mt-1 text-2xl font-bold">{ticket.title}</h1><p className="mt-2 text-sm text-slate-500">Raised {new Date(ticket.createdAt).toLocaleString()} · {ticket.module} · {ticket.issueType}</p></div><span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">{ticket.status}</span></div><p className="mt-5 border-t pt-5 text-sm leading-6 text-slate-600">{ticket.description}</p></header>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Ticket progress</h2><div className="mt-4 space-y-3 border-l border-slate-200 pl-4">{ticket.activityHistory.map((activity, index) => <div key={`${activity.createdAt}-${index}`}><p className="text-sm font-semibold capitalize">{activity.type.replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{activity.message || "Ticket updated"} · {new Date(activity.createdAt).toLocaleString()}</p></div>)}</div></section>
    {resolved && <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><h2 className="font-bold text-emerald-900">Issue resolved</h2><p className="mt-2 text-sm text-emerald-800">{ticket.resolutionNote || "Support marked this ticket as resolved."}</p><p className="mt-2 text-xs text-emerald-700">Resolution email: {ticket.resolutionEmailStatus}</p><button disabled={saving} onClick={reopen} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800"><RotateCcw size={15} /> Reopen issue</button>{ticket.status === "closed" && (ticket.satisfactionRating ? <p className="mt-4 text-sm font-semibold text-emerald-900">Thanks for your {ticket.satisfactionRating}/5 support rating.</p> : <div className="mt-5 border-t border-emerald-200 pt-4"><p className="text-sm font-bold text-emerald-900">Rate your support experience</p><div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={value <= rating ? "text-xl text-amber-500" : "text-xl text-slate-300"}>?</button>)}</div><textarea value={ratingComment} onChange={(event) => setRatingComment(event.target.value)} maxLength={2000} className="mt-2 min-h-20 w-full rounded-lg border border-emerald-200 bg-white p-2 text-sm" placeholder="Optional feedback" /><button disabled={saving || !rating} onClick={rate} className="mt-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Submit rating</button></div>)}</section>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-teal-50 text-[#0C5A69]"><MessageCircle size={18} /></span>
          <div><h2 className="font-bold">Conversation</h2><p className="text-xs text-slate-500">{messages.length} message{messages.length === 1 ? "" : "s"}</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"><ShieldCheck size={13} /> Visible to support</span>
      </div>
      <div className="max-h-[34rem] space-y-4 overflow-y-auto bg-slate-50/60 p-5 sm:p-6">
        {messages.length ? messages.map((message) => {
          const mine = message.authorType === "tenant";
          return <article key={message.id} className={mine ? "flex flex-row-reverse gap-3" : "flex gap-3"}>
            <span className={mine ? "grid size-9 shrink-0 place-items-center rounded-full bg-[#0C5A69] text-white" : "grid size-9 shrink-0 place-items-center rounded-full border border-teal-100 bg-white text-[#0C5A69]"}><CircleUserRound size={19} /></span>
            <div className="max-w-[85%]">
              <div className={mine ? "mb-1 flex justify-end gap-2 text-xs" : "mb-1 flex gap-2 text-xs"}><span className="font-bold text-slate-700">{mine ? "You" : "Support team"}</span><span className="text-slate-400">{new Date(message.createdAt).toLocaleString()}</span></div>
              <div className={mine ? "rounded-2xl rounded-tr-sm bg-[#0C5A69] px-4 py-3 text-sm leading-6 text-white" : "rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700"}><p className="whitespace-pre-wrap">{message.body}</p></div>
            </div>
          </article>;
        }) : <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center"><MessageCircle className="mx-auto text-slate-300" size={28} /><p className="mt-3 text-sm font-semibold text-slate-700">No conversation yet</p><p className="mt-1 text-sm text-slate-500">Add details below and the support team will receive them.</p></div>}
      </div>
      {ticket.status !== "closed" && <div className="border-t border-slate-100 bg-white p-5 sm:p-6">
        <label htmlFor="tenant-ticket-reply" className="text-sm font-bold text-slate-800">Add a reply</label>
        <p className="mt-1 text-xs text-slate-500">Your message is shared with the support team.</p>
        <textarea id="tenant-ticket-reply" value={reply} maxLength={4000} onChange={(e) => setReply(e.target.value)} className="mt-3 min-h-28 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none transition focus:border-[#0C5A69] focus:ring-2 focus:ring-teal-100" placeholder="Describe the update, question, or information that can help support..." />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-400">{reply.length}/4000</span><div className="flex items-center gap-2"><button disabled={saving} onClick={close} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">Close ticket</button><button disabled={saving || !reply.trim()} onClick={send} className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#094b57] disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} /> {saving ? "Sending..." : "Send reply"}</button></div></div>
      </div>}
    </section>
  </section>;
}
function PageState({ text, retry }: { text: string; retry?: () => void }) { return <section className="mx-auto max-w-4xl p-8 text-center text-slate-500"><p>{text}</p>{retry && <button onClick={retry} className="mt-3 rounded border px-3 py-1.5 text-[#0C5A69]">Retry</button>}</section>; }
