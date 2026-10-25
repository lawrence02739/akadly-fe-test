import React from 'react';
import type { CheckoutSummaryResponse } from '../types/onboarding.types';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OrderSummaryProps {
  summary: CheckoutSummaryResponse;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ summary }) => {
  const currencySymbol = summary.currency === 'INR' ? '₹' : '$';

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {summary.planName}
          </h4>
          <span className="text-xs text-slate-500 capitalize">
            {summary.interval} subscription plan
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
          Active Plan
        </span>
      </div>

      {/* Line Item Breakdown */}
      <div className="flex flex-col gap-2.5 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-900">
            {currencySymbol}
            {summary.baseAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {summary.taxPercent > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>GST / Taxes</span>
              <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                {summary.taxPercent}%
              </span>
            </span>
            <span className="font-semibold text-slate-900">
              {currencySymbol}
              {summary.taxAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
          <span className="text-sm font-bold text-slate-900">Total Due</span>
          <div className="text-right">
            <span className="text-xl font-extrabold text-indigo-600 tracking-tight">
              {currencySymbol}
              {summary.totalAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Inclusive of all taxes
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee */}
      <div className="pt-3 border-t border-slate-200/70 flex items-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Bank-grade 256-bit SSL encrypted checkout. Invoice will be emailed to your billing address.
        </span>
      </div>

      {summary.alreadyPaid && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Plan already paid or activated by your administrator.</span>
        </div>
      )}
    </div>
  );
};
