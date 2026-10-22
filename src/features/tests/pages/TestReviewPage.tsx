import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  FileQuestion,
  RotateCcw,
} from 'lucide-react';
import { TestWizardLayout } from '../components/TestWizardLayout';
import { CourseLinkCard } from '../components/CourseLinkCard';
import { PreviewAssessmentModal } from '../components/PreviewAssessmentModal';
import {
  useTest,
  useUpdateTest,
  usePublishTest,
  useUnpublishTest,
} from '../hooks/useTests';
import type { UpdateTestDto, PublishValidationError } from '../types';

export const TestReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const { data: test, isLoading } = useTest(testId);
  const updateMutation = useUpdateTest();
  const publishMutation = usePublishTest();
  const unpublishMutation = useUnpublishTest();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [publishErrors, setPublishErrors] = useState<PublishValidationError[]>([]);

  // Schedule & Delivery Form State
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTill, setAvailableTill] = useState('');
  const [languageSupport, setLanguageSupport] = useState(false);
  const [language, setLanguage] = useState('');
  const [autoSubmitOnExpiry, setAutoSubmitOnExpiry] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  useEffect(() => {
    if (test) {
      const formatForInput = (isoStr?: string) => {
        if (!isoStr) return '';
        const d = new Date(isoStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      };

      setAvailableFrom(formatForInput(test.availableFrom));
      setAvailableTill(formatForInput(test.availableTill));
      setLanguageSupport(test.languageSupport || false);
      setLanguage(test.language || '');
      setAutoSubmitOnExpiry(test.autoSubmitOnExpiry ?? true);
      setShuffleQuestions(test.shuffleQuestions ?? false);
    }
  }, [test]);

  const handleSaveSchedule = async () => {
    if (!testId) return;
    try {
      const dto: UpdateTestDto = {
        availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,
        availableTill: availableTill ? new Date(availableTill).toISOString() : undefined,
        languageSupport,
        language: languageSupport ? language : undefined,
        autoSubmitOnExpiry,
        shuffleQuestions,
      };

      await updateMutation.mutateAsync({ id: testId, dto });
      toast.success('Schedule & delivery settings saved');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to update schedule',
      );
    }
  };

  const handlePublish = async () => {
    if (!testId) return;
    setPublishErrors([]);
    try {
      // First save schedule
      await handleSaveSchedule();
      await publishMutation.mutateAsync(testId);
      toast.success('Assessment published successfully!');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        setPublishErrors(data.errors);
        toast.error('Please fix validation errors before publishing.');
      } else {
        toast.error(data?.message || err.message || 'Failed to publish test');
      }
    }
  };

  const handleUnpublish = async () => {
    if (!testId) return;
    try {
      await unpublishMutation.mutateAsync(testId);
      toast.success('Test reverted to Draft');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to unpublish test',
      );
    }
  };

  if (isLoading || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPublished = test.status === 'PUBLISHED';

  return (
    <TestWizardLayout
      currentStep={4}
      test={test}
      onPreview={() => setPreviewOpen(true)}
      onNext={isPublished ? undefined : handlePublish}
      nextButtonLabel={isPublished ? 'Published' : 'Publish Assessment'}
      nextDisabled={isPublished || publishMutation.isPending}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Publish Errors Banner if any */}
        {publishErrors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle size={18} className="text-rose-600" />
              <span>Assessment Cannot Be Published Yet</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 pl-2">
              {publishErrors.map((err, idx) => (
                <li key={idx}>
                  <strong className="capitalize">{err.field}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Status Callout Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isPublished
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {isPublished ? (
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={24} className="text-amber-600 shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-bold">
                Assessment Status: {isPublished ? 'LIVE & PUBLISHED' : 'DRAFT MODE'}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                {isPublished
                  ? 'This assessment is locked and live for candidates. Unpublish to make structural or question edits.'
                  : 'Review all specifications, questions, proctoring settings, and schedule before publishing.'}
              </p>
            </div>
          </div>

          <div>
            {isPublished ? (
              <button
                type="button"
                disabled={unpublishMutation.isPending}
                onClick={handleUnpublish}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <RotateCcw size={14} />
                <span>{unpublishMutation.isPending ? 'Unpublishing...' : 'Unpublish to Edit'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={publishMutation.isPending}
                onClick={handlePublish}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 size={15} />
                <span>{publishMutation.isPending ? 'Publishing...' : 'Publish Assessment'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Course Link Section */}
        <CourseLinkCard test={test} />

        {/* Schedule & Delivery Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Calendar size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Schedule & Delivery Windows</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set candidate testing windows, randomization, and language options
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveSchedule}
              disabled={updateMutation.isPending}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available From (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Till (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={availableTill}
                  onChange={(e) => setAvailableTill(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSubmitOnExpiry}
                  onChange={(e) => setAutoSubmitOnExpiry(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">
                  Auto-submit on timer expiry
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">
                  Shuffle questions per candidate
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={languageSupport}
                  onChange={(e) => setLanguageSupport(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">
                  Multi-language Support
                </span>
              </label>
            </div>

            {languageSupport && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Delivery Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g. English, Spanish, French"
                  className="w-full sm:w-64 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Read-only Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details & Grading Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Details & Grading
                </h4>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/partner/test-studio/${test.id}/details`)}
                className="text-2xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Edit Step 1
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Test Name</span>
                <span className="font-semibold text-slate-800">{test.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Difficulty</span>
                <span className="font-semibold text-slate-800 uppercase">{test.difficulty || 'Medium'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Duration</span>
                <span className="font-semibold text-slate-800">{test.timeLimitMinutes || 60} mins</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Pass Percentage</span>
                <span className="font-semibold text-slate-800">
                  {test.grading?.passingPercentage ?? 50}% ({test.grading?.passMarks ?? 0} pts)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Max Attempts</span>
                <span className="font-semibold text-slate-800">
                  {test.grading?.maxAttempts ? `${test.grading.maxAttempts} attempts` : 'Unlimited'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Certification</span>
                <span className="font-semibold text-slate-800">{test.grading?.certificationIssuance || 'NONE'}</span>
              </div>
            </div>
          </div>

          {/* Questions & Proctoring Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileQuestion size={16} className="text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Questions & Settings
                </h4>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/partner/test-studio/${test.id}/questions`)}
                className="text-2xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Edit Questions
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Total Questions</span>
                <span className="font-semibold text-slate-800">{test.questionCount || 0} questions</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Total Marks</span>
                <span className="font-semibold text-slate-800">{test.grading?.totalMarks || 0} points</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Proctoring</span>
                <span className="font-semibold text-slate-800">{test.settings?.proctoring?.type || 'NONE'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Lockdown Browser</span>
                <span className="font-semibold text-slate-800">
                  {test.settings?.lockdown?.requireLockdownBrowser ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Violations Monitored</span>
                <span className="font-semibold text-slate-800">
                  {test.settings?.violations?.monitoredTypes?.length || 0} rules
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-2xs uppercase">Revision</span>
                <span className="font-semibold text-slate-800">v{test.revision || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewOpen && (
        <PreviewAssessmentModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          test={test}
        />
      )}
    </TestWizardLayout>
  );
};
