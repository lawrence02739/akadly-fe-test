import { useState, useEffect } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import api from "../../../shared/api/axios";
import { useRazorpay } from "../hooks/useRazorpay";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [summary, setSummary] = useState<any>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const isRazorpayLoaded = useRazorpay();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, addonsRes] = await Promise.all([
        api.get('/billing/summary'),
        api.get('/public/addons')
      ]);
      setSummary(summaryRes.data?.data || summaryRes.data);
      setAddons(addonsRes.data?.data || addonsRes.data);
    } catch (e) {
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (checkoutPayload: any, total: number) => {
    if (!isRazorpayLoaded) {
      toast.error('Payment system is not ready yet');
      return;
    }

    try {
      setCheckoutLoading(true);
      // 1. Create order on backend
      const checkoutRes = await api.post('/billing/checkout', {
        ...checkoutPayload,
        clientExpectedTotal: total
      });

      const { orderId, amount, currency, keyId } = checkoutRes.data?.data || checkoutRes.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "Akadly",
        description: "Payment",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify on backend
            await api.post('/billing/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment successful!');
            fetchData(); // Refresh summary
          } catch (e) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#0C5A69"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (_response: any){
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Checkout initiation failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading billing information...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
        <p className="text-slate-500 mt-2">Manage your workspace subscription and add-on capacity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Current Plan */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Current Plan</h2>
                <p className="text-sm text-slate-500">{summary?.planSnapshot?.name || 'Free'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#0C5A69]">
                  {summary?.planSnapshot?.price > 0 ? `₹${summary.planSnapshot.price}` : 'Free'}
                </div>
                {summary?.planSnapshot?.price > 0 && <div className="text-xs text-slate-500">per {summary?.planSnapshot?.interval}</div>}
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${summary?.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Status: <span className="capitalize">{summary?.paymentStatus}</span></div>
                    {summary?.currentPeriodEnd && (
                      <div className="text-sm text-slate-500">Renews on {new Date(summary.currentPeriodEnd).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
                {summary?.paymentStatus === 'pending' && summary?.amountDue > 0 && (
                  <button
                    onClick={() => handleCheckout({ planId: summary.planId }, summary.amountDue)}
                    disabled={checkoutLoading}
                    className="bg-[#0C5A69] hover:bg-[#084855] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Pay Pending ₹{summary.amountDue}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Add-ons Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Add Extra Capacity</h2>
              <p className="text-sm text-slate-500">Purchase add-ons to increase your workspace limits.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {addons.map((addon) => (
                <div key={addon._id} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{addon.name}</h3>
                    <p className="text-sm text-slate-500">₹{addon.unitPrice} {addon.unitLabel}</p>
                  </div>
                  <button 
                    onClick={() => handleCheckout({ addons: [{ addonId: addon._id, quantity: addon.minQty }] }, addon.unitPrice * addon.minQty)}
                    disabled={checkoutLoading}
                    className="flex items-center gap-2 bg-[#0C5A69] hover:bg-[#084855] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Active Addons */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Active Add-ons</h3>
            {summary?.activeAddons?.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No active add-ons.</p>
            ) : (
              <ul className="space-y-3">
                {summary?.activeAddons?.map((a: any, i: number) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">{a.name || a.type}</span>
                    <span className="font-semibold text-slate-900">+{a.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Recent Payments</h3>
            {summary?.recentPayments?.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No recent payments.</p>
            ) : (
              <ul className="space-y-4">
                {summary?.recentPayments?.map((p: any) => (
                  <li key={p.id} className="text-sm">
                    <div className="flex justify-between font-medium text-slate-900">
                      <span>₹{p.amount}</span>
                      <span className="capitalize">{p.status}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs mt-1">
                      <span>{new Date(p.date).toLocaleDateString()}</span>
                      <span>{p.invoiceNumber}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
