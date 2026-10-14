import { useState, useEffect } from "react";
import { Plus, ShieldCheck, Sparkles, Check, X, ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import api from "../../../shared/api/axios";
import { useRazorpay } from "../hooks/useRazorpay";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [summary, setSummary] = useState<any>(null);
  const [addons, setAddons] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const isRazorpayLoaded = useRazorpay();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, addonsRes, plansRes] = await Promise.all([
        api.get('/billing/summary'),
        api.get('/public/addons'),
        api.get('/public/plans').catch(() => ({ data: [] })),
      ]);
      setSummary(summaryRes.data?.data || summaryRes.data);
      setAddons(addonsRes.data?.data || addonsRes.data);
      setPlans(plansRes.data?.data || plansRes.data || []);
    } catch {
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (checkoutPayload: any, total: number) => {
    try {
      setCheckoutLoading(true);
      // 1. Create order or activate free plan on backend
      const checkoutRes = await api.post('/billing/checkout', {
        ...checkoutPayload,
        clientExpectedTotal: total,
      });

      const resData = checkoutRes.data?.data || checkoutRes.data;

      // Direct free plan activation
      if (resData?.isFree) {
        toast.success(resData.message || 'Plan updated successfully!');
        setShowPlansModal(false);
        fetchData();
        return;
      }

      if (!isRazorpayLoaded) {
        toast.error('Payment gateway is still loading, please try again in a moment');
        return;
      }

      const { orderId, amount, currency, keyId } = resData;

      // 2. Open Razorpay Checkout
      const options = {
        key: keyId,
        amount,
        currency,
        name: "Akadly",
        description: "Subscription & Add-ons Payment",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 3. Verify on backend
            await api.post('/billing/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Plan updated.');
            setShowPlansModal(false);
            fetchData();
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#0C5A69",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (_response: any) {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Checkout initiation failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading billing information...</div>;

  const currentPlanCode = summary?.planSnapshot?.code || summary?.plan || 'free';

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
                <p className="text-sm text-slate-500 capitalize">{summary?.planSnapshot?.name || 'Free'}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-[#0C5A69]">
                    {summary?.planSnapshot?.price > 0 ? `₹${summary.planSnapshot.price}` : 'Free'}
                  </div>
                  {summary?.planSnapshot?.price > 0 && (
                    <div className="text-xs text-slate-500">per {summary?.planSnapshot?.interval}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlansModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C5A69] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0a4854] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Change Plan
                </button>
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
                    onClick={() => handleCheckout({ addons: [{ addonId: addon._id, quantity: addon.minQty || 1 }] }, addon.unitPrice * (addon.minQty || 1))}
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

        {/* Sidebar / Active Addons & Recent Payments */}
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Active Add-ons</h3>
            {summary?.activeAddons?.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No active add-ons.</p>
            ) : (
              <ul className="space-y-3">
                {summary?.activeAddons?.map((a: any, i: number) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700 capitalize">{a.name || a.type}</span>
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

      {/* Upgrade / Change Plan Modal */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Subscription Plans</h3>
                <p className="text-sm text-slate-500">Choose the best plan for your academy.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlansModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.map((p) => {
                const isCurrent =
                  p._id === summary?.planId ||
                  p.code?.toLowerCase() === currentPlanCode?.toLowerCase();
                const price = Number(p.price ?? 0);

                return (
                  <div
                    key={p._id}
                    className={`relative flex flex-col justify-between rounded-xl border p-5 transition-shadow ${
                      isCurrent
                        ? 'border-[#0C5A69] ring-2 ring-[#0C5A69]/20 bg-teal-50/20'
                        : 'border-slate-200 hover:shadow-md bg-white'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-3 right-4 rounded-full bg-[#0C5A69] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Active
                      </span>
                    )}

                    <div>
                      <h4 className="text-lg font-bold capitalize text-slate-900">{p.name}</h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{p.description || 'Full features access'}</p>

                      <div className="mt-4 flex items-baseline">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {price > 0 ? `₹${price}` : 'Free'}
                        </span>
                        {price > 0 && (
                          <span className="ml-1 text-xs text-slate-500">/{p.interval || 'month'}</span>
                        )}
                      </div>

                      <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-4 w-4 text-[#0C5A69] shrink-0" />
                          <span>
                            <strong>{p.userLimit === null ? 'Unlimited' : p.userLimit}</strong> workspace users
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-4 w-4 text-[#0C5A69] shrink-0" />
                          <span>
                            <strong>{p.courseLimit === null ? 'Unlimited' : p.courseLimit}</strong> courses
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Check className="h-4 w-4 text-[#0C5A69] shrink-0" />
                          <span>
                            <strong>{p.studentLimit === null ? 'Unlimited' : p.studentLimit}</strong> students
                          </span>
                        </div>
                        {p.allowedModules?.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Included Modules:</span>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {p.allowedModules.slice(0, 6).map((m: string) => (
                                <span key={m} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 capitalize">
                                  {m}
                                </span>
                              ))}
                              {p.allowedModules.length > 6 && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                                  +{p.allowedModules.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 text-xs font-semibold text-slate-500 cursor-default"
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCheckout({ planId: p._id }, price)}
                          disabled={checkoutLoading}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0C5A69] py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0a4854] transition-colors disabled:opacity-50"
                        >
                          {price > 0 ? (
                            <>
                              <span>Upgrade to {p.name}</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <span>Switch to Free</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
