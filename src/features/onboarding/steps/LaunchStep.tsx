import React, { useState } from 'react';
import type { OnboardingStateResponse } from '../types/onboarding.types';
import { onboardingApi } from '../api/onboarding.api';
import { useDispatch } from 'react-redux';
import { logout } from '../../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Layers,
  ArrowRight,
  Loader2,
  BookOpen,
  Users,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LaunchStepProps {
  state: OnboardingStateResponse;
}

export const LaunchStep: React.FC<LaunchStepProps> = ({ state }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLaunching, setIsLaunching] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const plannedCommand = `npm run tenant:provision-site -- --slug=${state.slug} --tenant=${state.tenantId}`;
  const siteUrl = `https://${state.slug}.akadly.com`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(plannedCommand);
    setHasCopied(true);
    toast.success('Command copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleCompleteAndLogin = async () => {
    setIsLaunching(true);
    try {
      await onboardingApi.launchWorkspace();
      toast.success('🎉 Onboarding completed! Redirecting to login...');
      // Clear session so the user logs in with their newly configured credentials
      dispatch(logout());
      navigate('/login?onboarding=complete');
    } catch (err) {
      console.error('Launch failed:', err);
      toast.error('Failed to finalize launch. Please try again.');
      setIsLaunching(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Step Header */}
      <div className="flex flex-col gap-1.5 border-b border-slate-200/80 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-fit mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>All Setup Phases Complete</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Launch Academy
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your workspace and brand configurations are complete. Review the planned automated site provisioning pipeline and proceed to your partner login.
        </p>
      </div>

      {/* Academy Subdomain & Target */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-3">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Academy Live URL
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            SSL Provisioned
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-mono text-white">
            {siteUrl}
          </span>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Open preview"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Scaffold Architecture & CLI Pipeline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            Automated Site Provisioning Pipeline (Scaffold)
          </h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your custom website is scaffolded using our high-performance edge static builder. The following CLI pipeline is scheduled to generate your edge storefront:
        </p>

        {/* Code Snippet Box */}
        <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs flex items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-indigo-400 select-none">$</span>
            <span className="text-slate-200">{plannedCommand}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCommand}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
            title="Copy command"
          >
            {hasCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>1. Theme Tokens</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Brand colors & fonts compiled into CSS variables.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>2. Edge Storefront</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Static site pre-rendered with custom welcome banners.
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>3. Global CDN</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Distributed across global edge edge caches with SSL.
            </span>
          </div>
        </div>
      </div>

      {/* Next Steps Checklist */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            What Happens Next?
          </h2>
        </div>

        <div className="flex flex-col gap-3 text-xs text-slate-700">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Create Your First Course & Modules
              </strong>
              <span>
                Use our modular Course Builder to add video lessons, quizzes, assignments, and coding sandboxes.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <Users className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Invite Instructors & Staff
              </strong>
              <span>
                Add your teaching staff and assign granular permissions for batch and grading management.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Official Invoicing & Receipts
              </strong>
              <span>
                All invoices and subscription receipts have been sent to{' '}
                <span className="font-semibold text-slate-900">
                  {state.billingProfile?.billingEmail || state.account.email}
                </span>
                .
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button: Complete & Proceed to Login */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={handleCompleteAndLogin}
          disabled={isLaunching}
          className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Finalizing Academy Setup...</span>
            </>
          ) : (
            <>
              <span>Complete Setup & Proceed to Login</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
