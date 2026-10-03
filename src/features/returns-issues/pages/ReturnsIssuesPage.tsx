import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  User,
  Truck,
  BookOpen,
  Send,
  RefreshCw,
} from 'lucide-react';
import {
  useTicketSummary,
  useTicketList,
  useTicketDetail,
  useAddTicketNote,
  useInitiateReversePickup,
  useMarkReturnReceived,
  useResolveTicket,
} from '../hooks/useReturnsIssues';
import type { StudentTicketRow, TicketStatus } from '../types';
import toast from 'react-hot-toast';

// ── Badge helpers ─────────────────────────────────────────────────────────────

const ISSUE_TYPE_COLORS: Record<string, string> = {
  DAMAGED: 'bg-red-100 text-red-700',
  DEFECTIVE: 'bg-red-100 text-red-700',
  INCORRECT_EDITION: 'bg-red-100 text-red-700',
  WRONG_BOOK: 'bg-amber-100 text-amber-700',
  NOT_RECEIVED: 'bg-amber-100 text-amber-700',
  MISSING_PAGES: 'bg-amber-100 text-amber-700',
  OTHER: 'bg-slate-100 text-slate-600',
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  PENDING: 'bg-amber-100 text-amber-700',
  RETURN_SHIPPED: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

function IssueTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ISSUE_TYPE_COLORS[type] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {type.replace(/_/g, ' ')}
    </span>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function IssueDetailPanel({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const addNote = useAddTicketNote();
  const reversePickup = useInitiateReversePickup();
  const returnReceived = useMarkReturnReceived();
  const resolve = useResolveTicket();

  const [noteText, setNoteText] = useState('');
  const [noteVisible, setNoteVisible] = useState(false);
  const [pickupTracking, setPickupTracking] = useState('');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [resolveType, setResolveType] = useState<
    'REPLACED' | 'REFUNDED' | 'REJECTED' | null
  >(null);
  const [resolveNotes, setResolveNotes] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!ticket) return null;

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addNote.mutateAsync({ id: ticketId, note: noteText, visibleToStudent: noteVisible });
      setNoteText('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    }
  };

  const handleReversePickup = async () => {
    if (!pickupTracking.trim()) return;
    try {
      await reversePickup.mutateAsync({
        id: ticketId,
        payload: { trackingNumber: pickupTracking },
      });
      setShowPickupModal(false);
      setPickupTracking('');
      toast.success('Reverse pickup initiated');
    } catch {
      toast.error('Failed to initiate pickup');
    }
  };

  const handleResolve = async () => {
    if (!resolveType) return;
    try {
      await resolve.mutateAsync({ id: ticketId, resolution: resolveType, notes: resolveNotes || undefined });
      setResolveType(null);
      toast.success('Ticket resolved');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? 'Failed to resolve ticket');
    }
  };

  const canInitiatePickup = ticket.isActive && ['NONE', 'PENDING'].includes(ticket.return.status);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">
              Issue Detail: #{ticket.ticketNumber}
            </h2>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Order {ticket.order.orderNumber} ·{' '}
            {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {/* Student + Book */}
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-slate-700">{ticket.student.fullName}</p>
              <p className="text-xs text-slate-400">{ticket.student.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
              <BookOpen className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="font-medium text-slate-700">{ticket.item.title}</p>
              <p className="text-xs text-slate-400">{ticket.item.author} · Qty {ticket.item.qty}</p>
            </div>
          </div>
        </div>

        {/* Reported Issue */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <IssueTypeBadge type={ticket.issueType} />
            <span className="text-xs text-slate-400">{ticket.priority} priority</span>
          </div>
          <p className="text-sm font-medium text-slate-700">{ticket.title}</p>
          <p className="mt-1 text-sm text-slate-600">{ticket.description}</p>
        </div>

        {/* Return tracking */}
        {ticket.return.trackingNumber && (
          <div className="flex items-center gap-2 rounded-lg bg-teal-50 p-3">
            <Truck className="h-4 w-4 text-teal-600" />
            <div>
              <p className="text-xs text-teal-600">Return Tracking</p>
              <p className="font-medium text-teal-700">
                {ticket.return.trackingNumber}
              </p>
            </div>
          </div>
        )}

        {/* Resolution notes area */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Resolution &amp; Action Notes
          </p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Add a note…"
            className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={noteVisible}
                onChange={(e) => setNoteVisible(e.target.checked)}
                className="rounded"
              />
              Visible to student
            </label>
            <button
              onClick={handleAddNote}
              disabled={addNote.isPending || !noteText.trim()}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
              Add note
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Timeline
          </p>
          <div className="space-y-2">
            {ticket.timeline.slice(-8).reverse().map((entry: any, i: number) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="mt-0.5 shrink-0 text-slate-400">
                  {new Date(entry.at).toLocaleString()}
                </span>
                <div>
                  <span
                    className={`font-medium ${entry.visibility === 'INTERNAL' ? 'text-amber-600' : 'text-slate-700'}`}
                  >
                    {entry.actor.name}
                  </span>{' '}
                  <span className="text-slate-500">{entry.action.replace(/_/g, ' ').toLowerCase()}</span>
                  {entry.note && (
                    <p className="mt-0.5 text-slate-500 italic">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-slate-200 p-4 space-y-2">
        {/* Mark return received */}
        {ticket.return.status === 'IN_TRANSIT' && (
          <button
            onClick={() => returnReceived.mutate(ticketId, { onSuccess: () => toast.success('Return marked as received') })}
            disabled={returnReceived.isPending}
            className="w-full rounded-lg border border-teal-300 bg-teal-50 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-50"
          >
            Mark Return Received
          </button>
        )}

        {/* Initiate Reverse Pickup */}
        {canInitiatePickup && !showPickupModal && (
          <button
            onClick={() => setShowPickupModal(true)}
            className="w-full rounded-lg bg-primary-700 py-2 text-sm font-semibold text-white hover:bg-primary-800"
          >
            Initiate Reverse Pickup
          </button>
        )}

        {showPickupModal && (
          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-slate-600">Return Tracking Number</p>
            <input
              value={pickupTracking}
              onChange={(e) => setPickupTracking(e.target.value)}
              placeholder="e.g. BLUEDART-RTN-9284"
              className="w-full rounded border border-slate-200 p-2 text-sm outline-none focus:border-primary-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReversePickup}
                disabled={reversePickup.isPending || !pickupTracking.trim()}
                className="flex-1 rounded-lg bg-primary-700 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Confirm Pickup
              </button>
              <button
                onClick={() => setShowPickupModal(false)}
                className="rounded-lg border border-slate-200 px-4 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Resolve actions */}
        {ticket.isActive && (
          <>
            {resolveType ? (
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-600">
                  {resolveType === 'REPLACED'
                    ? 'Replace Book'
                    : resolveType === 'REFUNDED'
                      ? 'Refund & Close'
                      : 'Close without action'}
                </p>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Optional notes…"
                  rows={2}
                  className="w-full rounded border border-slate-200 p-2 text-sm outline-none focus:border-primary-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleResolve}
                    disabled={resolve.isPending}
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setResolveType(null); setResolveNotes(''); }}
                    className="rounded-lg border border-slate-200 px-4 text-sm text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setResolveType('REPLACED')}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Replace Book
                </button>
                <button
                  onClick={() => setResolveType('REFUNDED')}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Refund &amp; Close
                </button>
              </div>
            )}
            {!resolveType && (
              <button
                onClick={() => setResolveType('REJECTED')}
                className="w-full text-center text-xs text-slate-400 underline hover:text-slate-600"
              >
                Close without action
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all', label: 'All Issues', summaryKey: 'all' as const },
  { key: 'pending-returns', label: 'Pending Returns', summaryKey: 'pendingReturns' as const },
  { key: 'in-transit-returns', label: 'In Transit Returns', summaryKey: 'inTransitReturns' as const },
  { key: 'resolved', label: 'Resolved', summaryKey: 'resolved' as const },
];

export default function ReturnsIssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') ?? 'all';
  const selectedIssueId = searchParams.get('issue') ?? '';
  const searchQ = searchParams.get('search') ?? '';
  const page = Number(searchParams.get('page') ?? 1);

  const { data: summary } = useTicketSummary();
  const { data: tickets, isLoading } = useTicketList({
    tab: activeTab,
    search: searchQ || undefined,
    orderId: searchParams.get('orderId') ?? undefined,
    page,
    limit: 20,
  });

  const setTab = (tab: string) => {
    const p = new URLSearchParams(searchParams);
    p.set('tab', tab);
    p.delete('page');
    setSearchParams(p);
  };

  const setSearch = (q: string) => {
    const p = new URLSearchParams(searchParams);
    if (q) p.set('search', q); else p.delete('search');
    p.delete('page');
    setSearchParams(p);
  };

  const selectIssue = (id: string) => {
    const p = new URLSearchParams(searchParams);
    if (id) p.set('issue', id); else p.delete('issue');
    setSearchParams(p);
  };

  const tabCount = (key: 'all' | 'pendingReturns' | 'inTransitReturns' | 'resolved') =>
    summary?.tabCounts[key] ?? 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Returns &amp; Issues
              </h1>
              <p className="text-sm text-slate-400">
                Track and resolve student order issues
              </p>
            </div>
          </div>

          {/* Stat cards */}
          {summary && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={AlertCircle}
                label="Open Issues"
                value={summary.openIssues}
                color="bg-blue-100 text-blue-600"
              />
              <StatCard
                icon={Clock}
                label="Pending Returns"
                value={summary.pendingReturns}
                color="bg-amber-100 text-amber-600"
              />
              <StatCard
                icon={CheckCircle2}
                label="Resolved This Month"
                value={summary.resolvedThisMonth}
                color="bg-emerald-100 text-emerald-600"
              />
              <StatCard
                icon={TrendingUp}
                label="Return Rate"
                value={`${summary.returnRate}%`}
                color="bg-indigo-100 text-indigo-600"
              />
            </div>
          )}
        </div>

        {/* Tabs + filters */}
        <div className="border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary-700 text-primary-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                    activeTab === tab.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tabCount(tab.summaryKey)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white px-6 py-3 border-b border-slate-100">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQ}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, student, order…"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
            </div>
          ) : tickets?.items.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-400">
              <Package className="h-10 w-10 opacity-40" />
              <p className="text-sm">No issues found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-white">
                <tr>
                  {['Issue ID', 'Order ID', 'Student', 'Book Title', 'Issue Type', 'Status', 'Reported'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets?.items.map((ticket: StudentTicketRow) => (
                  <tr
                    key={ticket.id}
                    onClick={() => selectIssue(ticket.id)}
                    className={`cursor-pointer transition-colors hover:bg-primary-50 ${selectedIssueId === ticket.id ? 'bg-primary-50' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-primary-700">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ticket.order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {ticket.student.fullName}
                    </td>
                    <td className="px-4 py-3 max-w-[160px] truncate text-slate-600">
                      {ticket.item.title}
                    </td>
                    <td className="px-4 py-3">
                      <IssueTypeBadge type={ticket.issueType} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {tickets && tickets.total > 20 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-400">
                {tickets.total} results · page {page}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', String(page - 1));
                    setSearchParams(p);
                  }}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page * 20 >= tickets.total}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', String(page + 1));
                    setSearchParams(p);
                  }}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedIssueId && (
        <div className="w-96 shrink-0 border-l border-slate-200 bg-white shadow-lg">
          <IssueDetailPanel
            ticketId={selectedIssueId}
            onClose={() => selectIssue('')}
          />
        </div>
      )}
    </div>
  );
}
