import { ArrowLeft, Check, Edit2, FileText, Printer, AlertTriangle, Truck, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import OrderStatusBadge from '../components/OrderStatusBadge';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrder(id!);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading order details...</div>;
  }

  if (error || !order) {
    return <div className="p-8 text-center text-red-500">Failed to load order</div>;
  }

  const steps = [
    { label: 'Order Placed', status: 'COMPLETED', date: order.createdAt },
    { label: 'Processing', status: order.status === 'PENDING' ? 'CURRENT' : 'COMPLETED', date: order.createdAt },
    { label: 'Shipped', status: ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) ? 'COMPLETED' : order.status === 'SHIPPED' ? 'CURRENT' : 'UPCOMING', date: order.updatedAt },
    { label: 'In Transit', status: ['IN_TRANSIT', 'DELIVERED'].includes(order.status) ? 'COMPLETED' : order.status === 'IN_TRANSIT' ? 'CURRENT' : 'UPCOMING', date: order.updatedAt },
    { label: 'Delivered', status: order.status === 'DELIVERED' ? 'COMPLETED' : 'UPCOMING', date: undefined },
  ];

  const handleUpdateStatus = async (status: string) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, dto: { status: status as any } });
      toast.success(`Order marked as ${status}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/partner/orders')}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors w-max"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">Order details - #{order.orderNumber}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-sm font-semibold text-slate-800 mb-8">Fulfillment Progress Stepper</h2>
          <div className="flex items-start justify-between relative">
            <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-100 -z-10" />
            
            {steps.map((step, idx) => {
              const isCompleted = step.status === 'COMPLETED';
              const isCurrent = step.status === 'CURRENT';
              return (
                <div key={idx} className="flex flex-col items-center flex-1 relative">
                  {idx > 0 && isCompleted && (
                    <div className="absolute top-4 -left-[50%] w-full h-[2px] bg-emerald-300 -z-10" />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted ? 'bg-emerald-100 text-emerald-600' :
                    isCurrent ? 'bg-primary-600 text-white shadow-md' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : (idx + 1)}
                  </div>
                  <div className="mt-4 text-center">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-24">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Delivery Coordinates */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
              <button className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Student Delivery Coordinates</h2>
              <div className="grid grid-cols-3 gap-6 items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{order.studentName}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Student ID: {order.studentId.slice(0, 8)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">PHONE NUMBER</p>
                  <p className="text-sm font-medium text-slate-900">{order.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">SHIPPING ADDRESS</p>
                  <p className="text-sm font-medium text-slate-900">{order.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Book Manifest & Invoicing */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Book Manifest & Invoicing</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase py-3 px-4">Cover</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase py-3 px-4">Title / Author</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase py-3 px-4">Unit Price</th>
                      <th className="text-center text-xs font-medium text-slate-500 uppercase py-3 px-4">Qty</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase py-3 px-4">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 px-4">
                          <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {item.coverImageUrl ? (
                              <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="text-sm text-slate-500">{item.author}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="text-sm font-medium text-slate-900">₹{item.unitPrice}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <p className="text-sm font-medium text-slate-900">{item.qty}</p>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <p className="text-sm font-bold text-slate-900">₹{item.lineTotal}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex justify-end">
                  <div className="w-72 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Items Subtotal:</span>
                      <span className="font-semibold text-slate-900">₹{order.booksSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Academic Delivery Fee:</span>
                      <span className="font-semibold text-slate-900">₹{order.deliveryFee}</span>
                    </div>
                    <div className="border-t border-slate-200 border-dashed pt-3 flex justify-between">
                      <span className="font-bold text-slate-900">Total Payable:</span>
                      <span className="font-bold text-primary-600 text-lg">₹{order.totalPayable}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Courier Logistics Detail */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Courier Logistics Detail</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                  <Truck className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{order.courierPartnerName}</p>
                  <p className="text-sm text-slate-500">Est. Delivery: {new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">WAYBILL TRACKING ID</p>
                <p className="text-sm font-bold text-primary-600 hover:underline cursor-pointer">{order.trackingNumber || 'PENDING GENERATION'}</p>
              </div>
            </div>

            {/* Transit History Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Transit History Logs</h2>
              <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 ml-3">
                {order.status === 'PENDING' ? (
                  <div className="relative">
                    <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-300 border-4 border-white" />
                    <p className="text-sm font-semibold text-slate-900">Order placed</p>
                    <p className="text-sm text-slate-500 mt-1">Fulfillment request acknowledged.</p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-400 border-4 border-white" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Out for sorting</p>
                          <p className="text-sm text-slate-500 mt-1">Package arrived at regional sorting center.</p>
                          <p className="text-xs text-slate-400 mt-1">Sep 3, 2026</p>
                        </div>
                        <span className="text-xs text-slate-400">04:15 PM</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-400 border-4 border-white" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Picked up from warehouse</p>
                          <p className="text-sm text-slate-500 mt-1">Dispatched via partner services.</p>
                          <p className="text-xs text-slate-400 mt-1">Sep 2, 2026</p>
                        </div>
                        <span className="text-xs text-slate-400">02:00 PM</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-slate-400 border-4 border-white" />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Order placed</p>
                          <p className="text-sm text-slate-500 mt-1">Fulfillment request acknowledged.</p>
                          <p className="text-xs text-slate-400 mt-1">Sep 1, 2026</p>
                        </div>
                        <span className="text-xs text-slate-400">11:15 AM</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-20 right-0 bg-white border-t border-slate-300 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 rounded-t-3xl border-x">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Waybill Label
            </button>
            <button 
              onClick={() => handleUpdateStatus('CANCELLED')}
              className="px-5 py-2.5 bg-white border border-red-300 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors shadow-sm"
            >
              Cancel Shipment
            </button>
          </div>
          <div className="flex gap-4">
            <button className="px-5 py-2.5 bg-amber-50 border border-amber-300 text-amber-700 font-semibold text-sm rounded-xl hover:bg-amber-100 transition-colors shadow-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Report Delivery Issue
            </button>
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <button 
                onClick={() => handleUpdateStatus('DELIVERED')}
                className="px-5 py-2.5 bg-emerald-100 text-emerald-800 font-semibold text-sm rounded-xl hover:bg-emerald-200 transition-colors shadow-sm flex items-center gap-2"
              >
                Mark As Successfully Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
