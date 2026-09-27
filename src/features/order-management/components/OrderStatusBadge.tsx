import type { OrderStatus } from '../types';

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { color: string; label: string }> = {
    PENDING: { color: 'bg-slate-100 text-slate-700', label: 'Pending' },
    SHIPPED: { color: 'bg-amber-100 text-amber-700', label: 'Shipped' },
    IN_TRANSIT: { color: 'bg-amber-100 text-amber-700', label: 'In Transit' },
    DELIVERED: { color: 'bg-emerald-100 text-emerald-700', label: 'Delivered' },
    FAILED: { color: 'bg-red-100 text-red-700', label: 'Failed' },
    RETURNED: { color: 'bg-red-100 text-red-700', label: 'Returned' },
    CANCELLED: { color: 'bg-slate-100 text-slate-500', label: 'Cancelled' },
  };

  const { color, label } = map[status] || map.PENDING;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
