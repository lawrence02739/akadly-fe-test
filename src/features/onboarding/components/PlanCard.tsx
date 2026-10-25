import React from 'react';
import type { OnboardingPlanOption } from '../types/onboarding.types';
import { Check, Lock, Sparkles } from 'lucide-react';

interface PlanCardProps {
  plan: OnboardingPlanOption;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  disabled?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const isLocked = plan.isLocked;

  const formattedPrice =
    plan.price === 0
      ? 'Free'
      : `${plan.currency === 'INR' ? '₹' : '$'}${plan.price.toLocaleString('en-IN')}`;

  const intervalLabel = plan.interval === 'yearly' ? '/yr' : '/mo';

  return (
    <div
      onClick={() => {
        if (!disabled && !isLocked) {
          onSelect(plan.id);
        }
      }}
      className={`relative rounded-2xl p-5 border transition-all text-left flex flex-col justify-between ${
        isSelected
          ? 'border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
      } ${disabled || isLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Popular badge */}
      {plan.isRecommended && (
        <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-[10px] font-bold tracking-wide uppercase shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>Recommended</span>
        </div>
      )}

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
          </div>

          {isLocked && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Assigned by Admin</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4">
          {plan.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formattedPrice}
          </span>
          {plan.price > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              {intervalLabel}
            </span>
          )}
        </div>

        {/* Features Divider */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Included Features
          </span>
          {plan.features.slice(0, 4).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-tight">{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
