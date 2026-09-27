import { useState } from 'react';
import { Loader2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateOrder } from '../hooks/useOrders';
import StudentSelect from '../components/StudentSelect';
import CourierPartnerSelect from '../components/CourierPartnerSelect';
import BookManifestPicker from '../components/BookManifestPicker';
import type { CreateOrderDto } from '../types';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const [form, setForm] = useState<CreateOrderDto>({
    studentId: '',
    studentName: '',
    courierPartnerId: '',
    courierPartnerName: '',
    shippingAddress: '42 MG Road, Bangalore 560001, India',
    phone: '',
    items: [],
    deliveryFee: 50,
    shippingTier: 'EXPRESS',
    deliveryInstructions: '',
    weight: 1.45,
    height: 120,
    width: 40,
    breadth: 32,
  });

  const set = (key: keyof CreateOrderDto, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const subtotal = form.items.reduce((sum, item) => sum + (item.qty * (item as any).unitPrice || 0), 0);
  const finalEstimate = subtotal + form.deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.courierPartnerId || !form.shippingAddress) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.items.length === 0) {
      toast.error('Please add at least one book to the order');
      return;
    }

    try {
      await createOrder.mutateAsync(form);
      toast.success('Order created successfully');
      navigate('/partner/orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create order');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-auto">
      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Create New Shipment</h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 pb-24">
          
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            
            {/* Section 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-6">Section 1: Student Target Address</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Search & Select Student
                  </label>
                  <StudentSelect
                    value={form.studentId}
                    onChange={(id, name) => {
                      set('studentId', id);
                      set('studentName', name);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Auto-filled Delivery Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.shippingAddress}
                      onChange={(e) => set('shippingAddress', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-slate-900">Section 2: Book Inventory Manifest</h2>
                <span className="text-sm text-slate-500 font-medium">Running Subtotal: <span className="text-slate-900">₹{subtotal.toLocaleString()}</span></span>
              </div>
              <div className="-mx-6">
                <BookManifestPicker
                  items={form.items}
                  onChange={(items) => set('items', items)}
                />
              </div>
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-base font-bold text-slate-900 mb-6">Section 3: Courier & Service Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Courier Logistics Partner
                  </label>
                  <CourierPartnerSelect
                    value={form.courierPartnerId}
                    onChange={(id, name) => {
                      set('courierPartnerId', id);
                      set('courierPartnerName', name);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Estimated Parcel weight
                  </label>
                  <div className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 font-medium">
                    1.45 kg (Auto-calculated)
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Shipping Tier Speed
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'STANDARD', label: 'Standard (5-7 days)' },
                      { id: 'EXPRESS', label: 'Express (2-3 days)' },
                      { id: 'PRIORITY', label: 'Priority Next Day' },
                    ].map((tier) => (
                      <label
                        key={tier.id}
                        className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          form.shippingTier === tier.id
                            ? 'border-cyan-600 bg-cyan-50 text-cyan-900'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.shippingTier === tier.id ? 'border-cyan-600' : 'border-slate-300'}`}>
                          {form.shippingTier === tier.id && <div className="w-2 h-2 rounded-full bg-cyan-600" />}
                        </div>
                        <span className="ml-3 text-sm font-medium">{tier.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Height</label>
                    <div className="relative">
                      <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg pr-12 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.height} onChange={(e) => set('height', e.target.value)} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-900">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Width</label>
                    <div className="relative">
                      <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg pr-12 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.width} onChange={(e) => set('width', e.target.value)} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-900">cm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Breadth</label>
                    <div className="relative">
                      <input type="number" className="w-full px-4 py-2 border border-slate-200 rounded-lg pr-12 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.breadth} onChange={(e) => set('breadth', e.target.value)} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-900">cm</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Delivery Instructions
                  </label>
                  <textarea
                    value={form.deliveryInstructions}
                    onChange={(e) => set('deliveryInstructions', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-slate-400"
                    placeholder="Deliver after 3 PM. Call student before arrival at Karnataka address."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dispatch Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-900">Section 4: Dispatch Summary</h2>
              
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">TARGET STUDENT</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {/* Placeholder image for mock student */}
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Student" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{form.studentName || 'Select Student'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Bangalore 560001</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">PRODUCT IMAGE</p>
                <div className="w-full h-24 rounded-lg bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 opacity-60"></div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">SELECTED MANIFEST</p>
                {form.items.length === 0 ? (
                  <p className="text-sm text-slate-400">No books selected.</p>
                ) : (
                  <div className="space-y-2 border-b border-dashed border-slate-200 pb-4">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 truncate pr-4">{(item as any).title || 'Book'}</span>
                        <span className="text-slate-600 whitespace-nowrap">Qty: {item.qty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">SHIPPING LOGISTICS</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Provider:</span>
                    <span className="font-bold text-slate-900">{form.courierPartnerName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Delivery:</span>
                    <span className="font-bold text-slate-900">Sep 5 - Sep 6</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Logistics Fee:</span>
                    <span className="font-bold text-slate-900">₹{form.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Courier Tracking ID:</span>
                    <span className="font-bold text-blue-600 hover:underline cursor-pointer">BD-104821-560001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Docket Number:</span>
                    <span className="font-bold text-blue-600 hover:underline cursor-pointer">AKD-2026-00918</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100/50 rounded-lg p-4 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">Final Estimate:</span>
                  <span className="text-xl font-bold text-teal-700">₹{finalEstimate.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-500">Includes all domestic Indian educational shipping levies.</p>
              </div>

            </div>
          </div>

          {/* Sticky Form Actions */}
          <div className="fixed bottom-0 left-20 right-0 bg-white border-t border-slate-200 p-4 shadow-sm z-20">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/partner/orders')}
                className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={createOrder.isPending}
                className="px-6 py-2.5 text-sm font-semibold bg-teal-700 text-white rounded-lg hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Shipment & Dispatch'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

