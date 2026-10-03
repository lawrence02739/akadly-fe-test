import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  AlertCircle,
  Search,
  BookOpen,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { useMyOrders } from '../hooks/useStudentPortal';
import type { StudentOrder } from '../api/student-portal.api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  SHIPPED: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-slate-100 text-slate-400',
};

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useMyOrders({
    search: search || undefined,
    status: status || undefined,
    page,
    limit: 10,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">My Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search orders…"
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-400"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
        >
          <option value="">All statuses</option>
          {['PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED'].map(
            (s) => <option key={s} value={s}>{s}</option>,
          )}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Failed to load orders. Please try again.
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <Package className="h-12 w-12 opacity-30" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((order: StudentOrder) => (
            <div
              key={order.id}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => navigate(`/student/orders/${order.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'}`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    {order.openIssueCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {order.openIssueCount} open issue{order.openIssueCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Books */}
                  <div className="mt-2 space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.bookId} className="flex items-center gap-2 text-sm text-slate-600">
                        <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{item.title}</span>
                        <span className="text-slate-400">×{item.qty}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-slate-400">
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Courier */}
                  {order.trackingNumber && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Truck className="h-3 w-3" />
                      {order.courierPartnerName} · {order.trackingNumber}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold text-slate-800">
                    ₹{order.totalPayable.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.issueEligibility.eligible ? (
                    <Link
                      to={`/student/orders/${order.id}/issue`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 rounded-lg bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-800"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Raise Issue
                    </Link>
                  ) : (
                    <span
                      className="cursor-default rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-400"
                      title={order.issueEligibility.reason ?? 'Not eligible'}
                    >
                      Raise Issue
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 10 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">{data.total} orders</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page * 10 >= data.total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
