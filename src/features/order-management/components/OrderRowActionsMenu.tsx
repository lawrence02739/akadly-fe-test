import { useState } from 'react';
import { Package, MapPin, CheckCircle, XCircle, Ban, Truck } from 'lucide-react';
import type { Order } from '../types';

interface Props {
  order: Order;
  onUpdateStatus: (id: string, status: Order['status'], trackingNumber?: string) => void;
}

export default function OrderRowActionsMenu({ order, onUpdateStatus }: Props) {
  const [showShippedPrompt, setShowShippedPrompt] = useState(false);
  const [tracking, setTracking] = useState('');

  if (showShippedPrompt) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="Tracking #"
          className="w-24 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-primary-500"
          autoFocus
        />
        <button
          onClick={() => {
            if (tracking.trim()) {
              onUpdateStatus(order.id, 'SHIPPED', tracking.trim());
              setShowShippedPrompt(false);
            }
          }}
          className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700"
        >
          Save
        </button>
        <button
          onClick={() => setShowShippedPrompt(false)}
          className="text-xs text-slate-500 hover:text-slate-700 px-1"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {order.status === 'PENDING' && (
        <>
          <button
            title="Mark Shipped"
            onClick={() => setShowShippedPrompt(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Package className="w-4 h-4" />
          </button>
          <button
            title="Cancel Order"
            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Ban className="w-4 h-4" />
          </button>
        </>
      )}

      {order.status === 'SHIPPED' && (
        <>
          <button
            title="Mark In Transit"
            onClick={() => onUpdateStatus(order.id, 'IN_TRANSIT')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Truck className="w-4 h-4" />
          </button>
          <button
            title="Mark Delivered"
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            title="Mark Failed"
            onClick={() => onUpdateStatus(order.id, 'FAILED')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      )}

      {order.status === 'IN_TRANSIT' && (
        <>
          <button
            title="Mark Delivered"
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            title="Mark Failed"
            onClick={() => onUpdateStatus(order.id, 'FAILED')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      )}

      {(order.status === 'DELIVERED' || order.status === 'FAILED') && (
        <button
          title="Mark Returned"
          onClick={() => onUpdateStatus(order.id, 'RETURNED')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MapPin className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
