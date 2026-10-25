import React, { useEffect, useRef } from 'react';
import { useBrandingDraftStore } from '../store/brandingDraft.store';
import { ColorPickerField } from '../components/ColorPickerField';
import { FontSelect } from '../components/FontSelect';
import { AssetUploader } from '../components/AssetUploader';
import { SavedIndicator } from '../components/SavedIndicator';
import { onboardingApi } from '../api/onboarding.api';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BrandingStepProps {
  onSuccess: (nextStep: string) => void;
  onSkip: () => void;
}

export const BrandingStep: React.FC<BrandingStepProps> = ({
  onSuccess,
  onSkip,
}) => {
  const {
    displayName,
    primaryColor,
    accentColor,
    fontFamily,
    loginHeadline,
    loginMessage,
    logoUrl,
    faviconUrl,
    logoKey,
    faviconKey,
    saveStatus,
    lastSavedAt,
    updateField,
    setSaveStatus,
  } = useBrandingDraftStore();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSkipping, setIsSkipping] = React.useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Autosave (800ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSaveStatus('saving');

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await onboardingApi.saveBrandingDraft({
          displayName: displayName || undefined,
          primaryColor,
          accentColor,
          fontFamily,
          loginHeadline,
          loginMessage,
          logoKey: logoKey || undefined,
          faviconKey: faviconKey || undefined,
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error('Draft autosave failed:', err);
        setSaveStatus('error');
      }
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    displayName,
    primaryColor,
    accentColor,
    fontFamily,
    loginHeadline,
    loginMessage,
    logoKey,
    faviconKey,
    setSaveStatus,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Please enter a display name for your academy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onboardingApi.completeBranding({
        displayName: displayName.trim(),
        primaryColor,
        accentColor,
        fontFamily,
        loginHeadline,
        loginMessage,
        logoKey: logoKey || undefined,
        faviconKey: faviconKey || undefined,
      });

      toast.success('Academy branding saved successfully!');
      onSuccess(res.currentStep || 'CHECKOUT');
    } catch (err) {
      console.error('Failed to complete branding:', err);
      toast.error('Failed to finalize branding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await onboardingApi.skipBranding();
      toast.success('Branding skipped. You can configure it later in Settings.');
      onSkip();
    } catch (err) {
      console.error('Failed to skip branding:', err);
      toast.error('Failed to skip branding.');
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Step Header */}
      <div className="flex items-start justify-between border-b border-slate-200/80 pb-5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Set Up Academy Branding
            </h1>
            <SavedIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Customize your academy name, upload your logo and favicon, pick your brand colors, and craft your student portal welcome message.
          </p>
        </div>
      </div>

      {/* Academy Display Name */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Academy Public Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            placeholder="Apex Coding Academy"
            maxLength={100}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
          <span className="text-[11px] text-slate-400">
            This name will be displayed to your students, certificates, and student portal.
          </span>
        </div>
      </div>

      {/* Brand Assets: Logo & Favicon */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
        <h2 className="text-base font-bold text-slate-900">
          Brand Assets & Icons
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <AssetUploader
            assetType="LOGO"
            label="Academy Logo"
            helperText="PNG, SVG, JPEG up to 2MB"
            currentUrl={logoUrl}
            onUploaded={(key, previewUrl) => {
              updateField('logoKey', key);
              updateField('logoUrl', previewUrl);
            }}
            onRemoved={() => {
              updateField('logoKey', null);
              updateField('logoUrl', null);
            }}
          />

          <AssetUploader
            assetType="FAVICON"
            label="Browser Favicon"
            helperText="ICO, PNG up to 512KB"
            currentUrl={faviconUrl}
            onUploaded={(key, previewUrl) => {
              updateField('faviconKey', key);
              updateField('faviconUrl', previewUrl);
            }}
            onRemoved={() => {
              updateField('faviconKey', null);
              updateField('faviconUrl', null);
            }}
          />
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
        <h2 className="text-base font-bold text-slate-900">
          Brand Colors
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ColorPickerField
            label="Primary Brand Color"
            value={primaryColor}
            onChange={(hex) => updateField('primaryColor', hex)}
            helperText="Buttons, active tabs, highlights"
          />

          <ColorPickerField
            label="Accent / Tag Color"
            value={accentColor}
            onChange={(hex) => updateField('accentColor', hex)}
            helperText="Badges, callouts, success pills"
          />
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
        <FontSelect
          value={fontFamily}
          onChange={(font) => updateField('fontFamily', font)}
        />
      </div>

      {/* Portal Hero Messaging */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
        <h2 className="text-base font-bold text-slate-900">
          Student Portal Welcome Content
        </h2>

        {/* Headline */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800">
              Welcome Headline
            </label>
            <span className="text-xs text-slate-400">
              {loginHeadline.length}/60 characters
            </span>
          </div>
          <input
            type="text"
            value={loginHeadline}
            onChange={(e) => updateField('loginHeadline', e.target.value)}
            maxLength={60}
            placeholder="Welcome to your academy"
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800">
              Welcome Message & Subtitle
            </label>
            <span className="text-xs text-slate-400">
              {loginMessage.length}/140 characters
            </span>
          </div>
          <textarea
            value={loginMessage}
            onChange={(e) => updateField('loginMessage', e.target.value)}
            maxLength={140}
            rows={3}
            placeholder="A little progress. A world of possibilities."
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSkipping || isSubmitting}
          className="px-5 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSkipping ? 'Skipping...' : 'Skip for now'}
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isSkipping}
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
