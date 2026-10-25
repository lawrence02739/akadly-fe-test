import React, { useState, useEffect } from 'react';
import type {
  OnboardingStateResponse,
  CheckoutSummaryResponse,
  SaveBillingProfileRequest,
} from '../types/onboarding.types';
import { BillingForm } from '../components/BillingForm';
import { OrderSummary } from '../components/OrderSummary';
import { onboardingApi } from '../api/onboarding.api';
import { useRazorpay } from '../../../shared/hooks/useRazorpay';
import { ArrowRight, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutStepProps {
  state: OnboardingStateResponse;
  onSuccess: () => void;
}

export const CheckoutStep: React.FC<CheckoutStepProps> = ({
  state,
  onSuccess,
}) => {
  const isRazorpayLoaded = useRazorpay();
  const [summary, setSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [billing, setBilling] = useState<SaveBillingProfileRequest>({
    legalName:
      state.billingProfile?.legalName || state.account.name || state.workspaceName,
    billingEmail: state.billingProfile?.billingEmail || state.account.email,
    addressLine1: state.billingProfile?.addressLine1 || '',
    addressLine2: state.billingProfile?.addressLine2 || '',
    city: state.billingProfile?.city || '',
    state: state.billingProfile?.state || '',
    postalCode: state.billingProfile?.postalCode || '',
    country: state.billingProfile?.country || 'IN',
    gstin: state.billingProfile?.gstin || '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof SaveBillingProfileRequest, string>>
  >({});

  useEffect(() => {
    let isMounted = true;
    async function loadSummary() {
      try {
        const res = await onboardingApi.getCheckoutSummary();
        if (isMounted) {
          setSummary(res);
        }
      } catch (err) {
        console.error('Failed to load checkout summary:', err);
        toast.error('Failed to compute checkout pricing.');
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    }
    loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const validateBilling = (): boolean => {
    const errs: Partial<Record<keyof SaveBillingProfileRequest, string>> = {};
    if (!billing.legalName.trim()) {
      errs.legalName = 'Legal business name is required.';
    }
    if (!billing.billingEmail.trim()) {
      errs.billingEmail = 'Billing email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.billingEmail)) {
      errs.billingEmail = 'Please enter a valid email address.';
    }
    if (!billing.addressLine1.trim()) {
      errs.addressLine1 = 'Street address is required.';
    }
    if (!billing.city.trim()) {
      errs.city = 'City is required.';
    }
    if (!billing.state.trim()) {
      errs.state = 'State / province is required.';
    }
    if (!billing.postalCode.trim()) {
      errs.postalCode = 'Postal / PIN code is required.';
    }
    if (
      billing.country === 'IN' &&
      billing.gstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        billing.gstin.trim().toUpperCase(),
      )
    ) {
      errs.gstin = 'Invalid GSTIN format (15 alphanumeric characters).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateBilling()) {
      toast.error('Please complete all required billing fields.');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Save billing profile
      await onboardingApi.saveBillingProfile(billing);

      // 2. Start checkout order
      const orderRes = await onboardingApi.startCheckout();

      // If free plan or admin already paid, bypass payment modal
      if (!orderRes.requiresPayment || orderRes.alreadyPaid) {
        toast.success('Plan activated successfully!');
        onSuccess();
        return;
      }

      // Ensure Razorpay script is loaded
      if (!isRazorpayLoaded || !window.Razorpay) {
        toast.error(
          'Payment gateway is loading. Please wait a moment and try again.',
        );
        return;
      }

      if (!orderRes.orderId || !orderRes.keyId) {
        toast.error('Failed to initialize payment gateway order.');
        return;
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount || (summary?.totalAmount ? summary.totalAmount * 100 : 0),
        currency: orderRes.currency || 'INR',
        name: orderRes.academyName || state.workspaceName,
        description: `${summary?.planName || 'Academy'} Subscription Onboarding`,
        order_id: orderRes.orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            await onboardingApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success(
              '🎉 Payment verified successfully! An invoice has been sent to your billing email.',
            );
            onSuccess();
          } catch (err) {
            console.error('Payment verification failed:', err);
            toast.error(
              'Payment verification failed. If your account was debited, please contact support.',
            );
          }
        },
        prefill: {
          name: billing.legalName,
          email: billing.billingEmail,
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function () {
            toast('Payment process was cancelled. You can retry anytime.', {
              icon: 'ℹ️',
            });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: unknown) {
        console.error('Razorpay payment failed:', resp);
        toast.error('Payment was not completed. Please try again.');
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout failed:', err);
      toast.error('Checkout could not be started. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingSummary || !summary) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-600">
          Computing checkout & order summary...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="flex flex-col gap-8">
      {/* Step Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Checkout & Provisioning
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Provide your billing details for official tax receipts and activate your subscription.
        </p>
      </div>

      {/* Order Summary Box */}
      <OrderSummary summary={summary} />

      {/* Billing Profile Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <h2 className="text-base font-bold text-slate-900">
          Billing Profile & Tax Information
        </h2>

        <BillingForm
          values={billing}
          onChange={(patch) => setBilling((prev) => ({ ...prev, ...patch }))}
          errors={errors}
        />
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={isProcessing}
          className="px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : !summary.requiresPayment || summary.alreadyPaid ? (
            <>
              <span>Proceed to Launch</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>
                Pay ₹{summary.totalAmount.toLocaleString('en-IN')} via Razorpay
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
