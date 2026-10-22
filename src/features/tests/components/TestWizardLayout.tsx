import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Eye, Check } from 'lucide-react';
import type { Test } from '../types';

interface TestWizardLayoutProps {
  currentStep: 1 | 2 | 3 | 4;
  test?: Test | null;
  onSaveDraft?: () => void;
  onNext?: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  nextButtonLabel?: string;
  nextDisabled?: boolean;
  children: React.ReactNode;
}

export const TestWizardLayout: React.FC<TestWizardLayoutProps> = ({
  currentStep,
  test,
  onSaveDraft,
  onNext,
  onPreview,
  isSaving = false,
  nextButtonLabel,
  nextDisabled = false,
  children,
}) => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const effectiveTestId = test?.id || testId;

  const steps = [
    {
      number: 1,
      title: 'Details & Grading',
      path: effectiveTestId && effectiveTestId !== 'new'
        ? `/partner/test-studio/${effectiveTestId}/details`
        : '/partner/test-studio/new',
    },
    {
      number: 2,
      title: 'Questions Builder',
      path: effectiveTestId && effectiveTestId !== 'new'
        ? `/partner/test-studio/${effectiveTestId}/questions`
        : '#',
    },
    {
      number: 3,
      title: 'Settings',
      path: effectiveTestId && effectiveTestId !== 'new'
        ? `/partner/test-studio/${effectiveTestId}/settings`
        : '#',
    },
    {
      number: 4,
      title: 'Review & Publish',
      path: effectiveTestId && effectiveTestId !== 'new'
        ? `/partner/test-studio/${effectiveTestId}/review`
        : '#',
    },
  ];

  const defaultNextLabels: Record<number, string> = {
    1: 'Next : Link Questions',
    2: 'Next : Add Settings',
    3: 'Next : Review',
    4: 'Publish Assessment',
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return test?.title ? `Edit Test - ${test.title}` : 'Create New Test';
      case 2:
        return `Add Question - ${test?.title || 'Class Test'}`;
      case 3:
        return 'Test Settings';
      case 4:
        return `Review & Publish - ${test?.title || 'Class Test'}`;
    }
  };

  const getStepSubtitle = () => {
    if (currentStep === 1) {
      return 'Fill in basic properties and target specifications of the test';
    }
    return undefined;
  };

  const getNextLabel = () => nextButtonLabel || defaultNextLabels[currentStep] || 'Next';

  const handleStepClick = (stepNum: number, path: string) => {
    if (!effectiveTestId || effectiveTestId === 'new') return;
    if (stepNum <= currentStep || test) {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header Navbar matching Figma */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/partner/test-studio')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
            title="Back to Tests"
          >
            <ChevronLeft size={20} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {getStepTitle()}
              </h1>
              {test?.status && (
                <span
                  className={`px-2.5 py-0.5 text-2xs font-bold rounded-full uppercase tracking-wider border ${
                    test.status === 'PUBLISHED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {test.status}
                </span>
              )}
            </div>
            {getStepSubtitle() ? (
              <p className="text-xs text-slate-400 mt-0.5">{getStepSubtitle()}</p>
            ) : test ? (
              <p className="text-2xs text-slate-400 mt-0.5">
                {test.questionCount} {test.questionCount === 1 ? 'Question' : 'Questions'} •{' '}
                {test.grading?.totalMarks || 0} Total Marks • Revision {test.revision}
              </p>
            ) : null}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {onPreview && (
            <button
              onClick={onPreview}
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-300 shadow-2xs"
            >
              <Eye size={15} />
              <span>Preview Assessment</span>
            </button>
          )}

          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check size={15} className="text-slate-600" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          )}

          {onNext && (
            <button
              onClick={onNext}
              disabled={isSaving || nextDisabled}
              type="button"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#005963] hover:bg-[#00474f] rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{getNextLabel()}</span>
            </button>
          )}
        </div>
      </header>

      {/* Stepper Sub-header */}
      <div className="bg-white border-b border-slate-200 px-8 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <nav aria-label="Progress" className="w-full">
            <ol className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const isActive = step.number === currentStep;
                const isPassed = step.number < currentStep;
                const isClickable = (step.number <= currentStep || Boolean(test)) && Boolean(effectiveTestId && effectiveTestId !== 'new');

                return (
                  <li
                    key={step.number}
                    className={`relative flex items-center ${
                      idx !== steps.length - 1 ? 'flex-1 pr-6' : ''
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => handleStepClick(step.number, step.path)}
                      className={`group flex items-center gap-2.5 text-left focus:outline-hidden ${
                        !isClickable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-[#005963] text-white shadow-xs'
                            : isPassed
                            ? 'bg-teal-50 text-[#005963] border border-teal-200'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isPassed ? <Check size={13} /> : step.number}
                      </span>
                      <span
                        className={`text-xs font-semibold tracking-tight transition-colors ${
                          isActive
                            ? 'text-slate-900 font-bold'
                            : isPassed
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>

                    {idx !== steps.length - 1 && (
                      <div className="hidden sm:block flex-1 h-0.5 bg-slate-200 mx-4" />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Wizard Step Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
};
