import React, { useState } from 'react';
import type {
  OnboardingStateResponse,
  OnboardingPlanOption,
} from '../types/onboarding.types';
import { PasswordField } from '../components/PasswordField';
import { PlanCard } from '../components/PlanCard';
import { onboardingApi } from '../api/onboarding.api';
import { evaluatePasswordStrength } from '../utils/passwordStrength';
import { Globe, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AccountPlanStepProps {
  state: OnboardingStateResponse;
  plans: OnboardingPlanOption[];
  onSuccess: (nextStep: string) => void;
}

export const AccountPlanStep: React.FC<AccountPlanStepProps> = ({
  state,
  plans,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [ownerName, setOwnerName] = useState(state.account.name || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    state.plan.selectedPlanId || plans[0]?.id || '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordAlreadySet = state.account.passwordSet;
  const isPlanLocked = state.plan.isPlanLocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If password not set previously, require it now
    if (!isPasswordAlreadySet && !password) {
      toast.error('Please create a secure password for your owner account.');
      return;
    }

    if (password) {
      const strength = evaluatePasswordStrength(password);
      if (!strength.isValid) {
        toast.error(
          'Password must be at least 12 characters and contain both letters and numbers.',
        );
        return;
      }
    }

    if (!selectedPlanId) {
      toast.error('Please select a subscription plan to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onboardingApi.saveAccountAndPlan({
        password: password || undefined,
        ownerName: ownerName.trim() || undefined,
        planId: selectedPlanId,
      });

      toast.success('Account credentials and plan saved!');
      onSuccess(res.currentStep || 'BRANDING');
    } catch (err) {
      console.error('Failed to save account & plan:', err);
      toast.error('Failed to save credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Step Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create Workspace & Select Plan
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Set up your administrator credentials, confirm your academy address, and choose the plan that suits your institute.
        </p>
      </div>

      {/* Workspace Address (Read-only Pill) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Academy Address (Assigned by Admin)
          </label>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Reserved
          </span>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-sm font-semibold shadow-2xs">
          <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-slate-900">{state.slug}</span>
          <span className="text-slate-400">.akadly.com</span>
        </div>
      </div>

      {/* Administrator Credentials */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <h2 className="text-base font-bold text-slate-900">
          Owner Credentials
        </h2>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Email Address
          </label>
          <input
            type="email"
            value={state.account.email}
            disabled
            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed"
          />
          {state.account.googleLinked && (
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Verified via Google authentication
            </span>
          )}
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Dr. Jane Doe"
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <PasswordField
            value={password}
            onChange={setPassword}
            required={!isPasswordAlreadySet}
            label={
              isPasswordAlreadySet
                ? 'Change Account Password (Optional)'
                : 'Create Account Password'
            }
            placeholder={
              isPasswordAlreadySet
                ? 'Leave blank to keep existing password'
                : 'Create password (min 12 characters, letters & digits)'
            }
          />
          {isPasswordAlreadySet && !password && (
            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Your account password is already set. You can leave this blank or type a new password.
            </span>
          )}
        </div>
      </div>

      {/* Plan Selection */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Subscription Plan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPlanLocked
              ? 'Your subscription plan has been assigned and paid by the administrator.'
              : 'Select a plan for your academy. You can review pricing and billing in the next step.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              isSelected={selectedPlanId === p.id}
              onSelect={setSelectedPlanId}
              disabled={isPlanLocked && selectedPlanId !== p.id}
            />
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
