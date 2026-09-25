import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useListOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import type { ListOrdersParams, OrderStatus } from '../types';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderRowActionsMenu from '../components/OrderRowActionsMenu';

const TABS: { label: string; value: string }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Returns', value: 'RETURNED' },
];

export default function ManageOrdersPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<ListOrdersParams>({
    page: 1,
    limit: 20,
    status: '', // "" means all
  });
  const [search, setSearch] = useState('');
  
  const { data, isLoading } = useListOrders(params);
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const applySearch = () => {
    setParams((p) => ({ ...p, page: 1, search: search || undefined }));
  };

  const handleUpdateStatus = async (id: string, status: OrderStatus, trackingNumber?: string) => {
    try {
      await updateStatus.mutateAsync({ id, dto: { status, trackingNumber } });
      toast.success('Order status updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update order status');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage student book shipments</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => navigate('/partner/orders/new')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Manual Dispatch
            </button>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex items-center justify-between mt-6 border-b border-slate-200 pb-px">
          <div className="flex items-center gap-6">
            {TABS.map((tab) => {
              const isActive = params.status === tab.value || (tab.value === '' && !params.status);
              return (
                <button
                  key={tab.label}
                  onClick={() => setParams((p) => ({ ...p, page: 1, status: tab.value }))}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="pb-3 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 min-w-52 max-w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                placeholder="Search Order ID or Student..."
                className="bg-transparent text-sm text-slate-700 outline-none flex-1 placeholder:text-slate-400"
              />
            </div>
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Date Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
          <div className="overflow-auto" style={{ maxHeight: '60vh', minHeight: '340px' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                  {['Order ID', 'Student', 'Book(s) Requested', 'Qty', 'Courier Partner', 'Tracking #', 'Status', 'Created Date', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 text-sm">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 text-sm">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/partner/orders/${order.id}`)}
                    >
                      <td className="px-4 py-3 font-mono font-medium text-primary-700 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{order.studentName}</p>
                        <p className="text-xs text-slate-500">{order.studentId}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="truncate">
                          {order.items.map((i) => i.title).join(', ')}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ₹{order.totalPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })} total
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {order.items.reduce((sum, i) => sum + i.qty, 0)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {order.courierPartnerName}
                        <div className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
                          {order.shippingTier}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {order.trackingNumber || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <OrderRowActionsMenu
                          order={order}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
            <span>Showing {from}–{to} of {total} orders</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setParams((p) => ({ ...p, page: Math.max((p.page ?? 1) - 1, 1) }))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-primary-800 text-white text-xs font-semibold">{page}</span>
              <span className="text-slate-400 text-xs">of {totalPages}</span>
              <button
                onClick={() => setParams((p) => ({ ...p, page: Math.min((p.page ?? 1) + 1, totalPages) }))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
