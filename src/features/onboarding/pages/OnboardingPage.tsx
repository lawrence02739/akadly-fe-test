import React, { useState, useEffect } from 'react';
import type {
  OnboardingStateResponse,
  OnboardingPlanOption,
  OnboardingStep,
} from '../types/onboarding.types';
import { onboardingApi } from '../api/onboarding.api';
import { useBrandingDraftStore } from '../store/brandingDraft.store';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { AccountPlanStep } from '../steps/AccountPlanStep';
import { BrandingStep } from '../steps/BrandingStep';
import { CheckoutStep } from '../steps/CheckoutStep';
import { LaunchStep } from '../steps/LaunchStep';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingStateResponse | null>(null);
  const [plans, setPlans] = useState<OnboardingPlanOption[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('ACCOUNT_PLAN');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initFromState = useBrandingDraftStore((s) => s.initFromState);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stateRes, plansRes] = await Promise.all([
        onboardingApi.getState(),
        onboardingApi.listPlans(),
      ]);

      if (stateRes.isCompleted) {
        // Already completed — redirect to dashboard
        navigate('/partner/courses', { replace: true });
        return;
      }

      setState(stateRes);
      setPlans(plansRes);
      setCurrentStep(stateRes.currentStep || 'ACCOUNT_PLAN');
      initFromState(stateRes);
    } catch (err) {
      console.error('Failed to load onboarding state:', err);
      setError(
        'Unable to load your workspace onboarding session. Please make sure you are logged in as the workspace owner.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <span className="text-sm font-bold text-slate-700">
          Loading your workspace onboarding session...
        </span>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Session Unavailable
            </h2>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      completedSteps={state.completedSteps}
      skippedSteps={state.skippedSteps}
      onSelectStep={(step) => setCurrentStep(step)}
    >
      {currentStep === 'ACCOUNT_PLAN' && (
        <AccountPlanStep
          state={state}
          plans={plans}
          onSuccess={(next) => {
            const nextStep = (next as OnboardingStep) || 'BRANDING';
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    currentStep: nextStep,
                    completedSteps: Array.from(
                      new Set([...prev.completedSteps, 'ACCOUNT_PLAN']),
                    ),
                  }
                : null,
            );
            setCurrentStep(nextStep);
          }}
        />
      )}

      {currentStep === 'BRANDING' && (
        <BrandingStep
          onSuccess={(next) => {
            const nextStep = (next as OnboardingStep) || 'CHECKOUT';
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    currentStep: nextStep,
                    completedSteps: Array.from(
                      new Set([...prev.completedSteps, 'BRANDING']),
                    ),
                    skippedSteps: prev.skippedSteps.filter((s) => s !== 'BRANDING'),
                  }
                : null,
            );
            setCurrentStep(nextStep);
          }}
          onSkip={() => {
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    currentStep: 'CHECKOUT',
                    skippedSteps: Array.from(
                      new Set([...prev.skippedSteps, 'BRANDING']),
                    ),
                    completedSteps: prev.completedSteps.filter(
                      (s) => s !== 'BRANDING',
                    ),
                  }
                : null,
            );
            setCurrentStep('CHECKOUT');
          }}
        />
      )}

      {currentStep === 'CHECKOUT' && (
        <CheckoutStep
          state={state}
          onSuccess={() => {
            setState((prev) =>
              prev
                ? {
                    ...prev,
                    currentStep: 'LAUNCH',
                    completedSteps: Array.from(
                      new Set([...prev.completedSteps, 'CHECKOUT']),
                    ),
                  }
                : null,
            );
            setCurrentStep('LAUNCH');
          }}
        />
      )}

      {currentStep === 'LAUNCH' && <LaunchStep state={state} />}
    </OnboardingLayout>
  );
};
