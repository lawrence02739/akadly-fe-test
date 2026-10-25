import React from 'react';
import type { OnboardingStep } from '../types/onboarding.types';
import { Check, ShieldCheck, Palette, CreditCard, Rocket } from 'lucide-react';

interface PhaseRailProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  onSelectStep: (step: OnboardingStep) => void;
}

interface StepMeta {
  key: OnboardingStep;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PHASES: StepMeta[] = [
  {
    key: 'ACCOUNT_PLAN',
    title: 'Create Workspace',
    subtitle: 'Account & Plan Selection',
    icon: ShieldCheck,
  },
  {
    key: 'BRANDING',
    title: 'Set Up Academy',
    subtitle: 'Brand, Colors & Typography',
    icon: Palette,
  },
  {
    key: 'CHECKOUT',
    title: 'Checkout & Provision',
    subtitle: 'Billing & Gateway Payment',
    icon: CreditCard,
  },
  {
    key: 'LAUNCH',
    title: 'Launch Academy',
    subtitle: 'Automated Deployment',
    icon: Rocket,
  },
];

export const PhaseRail: React.FC<PhaseRailProps> = ({
  currentStep,
  completedSteps,
  skippedSteps,
  onSelectStep,
}) => {
  const currentIndex = PHASES.findIndex((p) => p.key === currentStep);

  return (
    <div className="w-full bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
        {PHASES.map((phase, idx) => {
          const isCurrent = phase.key === currentStep;
          const isDone =
            completedSteps.includes(phase.key) ||
            skippedSteps.includes(phase.key);
          const isAccessible = idx <= currentIndex || isDone;

          const IconComponent = phase.icon;

          return (
            <React.Fragment key={phase.key}>
              <button
                type="button"
                disabled={!isAccessible}
                onClick={() => onSelectStep(phase.key)}
                className={`flex items-center gap-3 text-left transition-all group shrink-0 ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                }`}
              >
                {/* Step Circle Indicator */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50'
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>

                {/* Step Title & Subtitle */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        isCurrent
                          ? 'text-indigo-600'
                          : isDone
                            ? 'text-slate-900'
                            : 'text-slate-500'
                      }`}
                    >
                      {phase.title}
                    </span>
                    {skippedSteps.includes(phase.key) && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold">
                        Skipped
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
                    {phase.subtitle}
                  </span>
                </div>
              </button>

              {/* Connecting line */}
              {idx < PHASES.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 shrink-0 rounded-full transition-colors ${
                    idx < currentIndex || isDone
                      ? 'bg-emerald-400'
                      : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
