import React from 'react';
import type { OnboardingStep } from '../types/onboarding.types';
import { PhaseRail } from './PhaseRail';
import { StudentExperiencePreview } from './StudentExperiencePreview';
import { LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/authSlice';
import { useNavigate } from 'react-router-dom';

interface OnboardingLayoutProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  onSelectStep: (step: OnboardingStep) => void;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  completedSteps,
  skippedSteps,
  onSelectStep,
  children,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm shadow-indigo-500/30">
              A
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Akadly
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Partner Workspace Onboarding
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* 4-Phase Step Progress Rail */}
      <PhaseRail
        currentStep={currentStep}
        completedSteps={completedSteps}
        skippedSteps={skippedSteps}
        onSelectStep={onSelectStep}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {children}
          </div>

          {/* Right Live Preview Rail (Phases 1 & 2) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
            <StudentExperiencePreview />
          </div>
        </div>
      </main>
    </div>
  );
};
