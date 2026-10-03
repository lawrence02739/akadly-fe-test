import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Truck,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useMyIssues, useCancelIssue } from '../hooks/useStudentPortal';
import type { StudentIssue } from '../api/student-portal.api';
import toast from 'react-hot-toast';

const STATUS_CONFIGS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  OPEN: { icon: AlertCircle, color: 'text-blue-500 bg-blue-50', label: 'Open' },
  IN_PROGRESS: { icon: RefreshCw, color: 'text-indigo-500 bg-indigo-50', label: 'In Progress' },
  PENDING: { icon: Clock, color: 'text-amber-500 bg-amber-50', label: 'Pending Info' },
  RETURN_SHIPPED: { icon: Truck, color: 'text-orange-500 bg-orange-50', label: 'Return Shipped' },
  RESOLVED: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50', label: 'Resolved' },
  CANCELLED: { icon: XCircle, color: 'text-slate-400 bg-slate-50', label: 'Cancelled' },
};

export default function MyIssuesPage() {
  const navigate = useNavigate();
  const cancelIssue = useCancelIssue();
  const { data, isLoading } = useMyIssues({});

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this issue?')) return;
    try {
      await cancelIssue.mutateAsync(id);
      toast.success('Issue cancelled');
    } catch {
      toast.error('Cannot cancel this issue');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-xl font-bold text-slate-800">My Issues</h1>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <Package className="h-12 w-12 opacity-30" />
          <p>No issues raised yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((issue: StudentIssue) => {
            const cfg = STATUS_CONFIGS[issue.status] ?? STATUS_CONFIGS.OPEN;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={issue.id}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => navigate(`/student/issues/${issue.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-2 ${cfg.color}`}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary-700">
                          {issue.ticketNumber}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {issue.issueType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-slate-700">
                        {issue.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {issue.item.title} · Order {issue.order.orderNumber} ·{' '}
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    {issue.status === 'OPEN' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCancel(issue.id);
                        }}
                        className="text-xs text-slate-400 underline hover:text-red-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Return status strip */}
                {issue.return.status !== 'NONE' && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-700">
                    <Truck className="h-3.5 w-3.5" />
                    Return: {issue.return.status.replace(/_/g, ' ')}
                    {issue.return.trackingNumber
                      ? ` · ${issue.return.trackingNumber}`
                      : ''}
                  </div>
                )}

                {/* Resolved strip */}
                {issue.resolution && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {issue.resolution.type === 'REPLACED'
                      ? 'Replacement arranged'
                      : issue.resolution.type === 'REFUNDED'
                        ? 'Refund initiated'
                        : 'Closed without action'}
                    {issue.resolution.notes
                      ? ` — "${issue.resolution.notes.slice(0, 60)}${issue.resolution.notes.length > 60 ? '…' : ''}"`
                      : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
