import React from 'react';
import { Lock } from 'lucide-react';
import {
  CertificationIssuance,
  FeedbackMechanism,
  type Money,
} from '../types';

export interface GradingMetricsFormData {
  passingPercentage?: number;
  retakeFee?: Money;
  maxAttempts?: number | null;
  certificationIssuance?: CertificationIssuance;
  timeLimitMinutes?: number;
  validityPeriodDays?: number;
  feedbackMechanism?: FeedbackMechanism;
  derivedTotalMarks?: number;
  derivedQuestionCount?: number;
}

interface GradingMetricsCardProps {
  formData: GradingMetricsFormData;
  onChange: (updates: Partial<GradingMetricsFormData>) => void;
  errors?: Record<string, string>;
}

export const GradingMetricsCard: React.FC<GradingMetricsCardProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">
          Grading & Evaluation Metrics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure evaluation, certification, retakes, and time specifications
        </p>
      </div>

      {/* 1. Total Marks (Read-only derived from questions) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Total Marks
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Lock size={11} />
            <span>Auto-calculated</span>
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            readOnly
            disabled
            value={
              formData.derivedTotalMarks !== undefined && formData.derivedTotalMarks > 0
                ? `${formData.derivedTotalMarks} marks`
                : ''
            }
            placeholder="e.g. 100"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-not-allowed outline-none"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Sum of points assigned to questions in Step 2.
        </p>
      </div>

      {/* 2. Passing Percentage (%) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Passing Percentage (%)
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 40"
            value={formData.passingPercentage ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              onChange({ passingPercentage: val });
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all pr-8"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">%</span>
        </div>
      </div>

      {/* 3. Retake Fee (if applicable) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Retake Fee (if applicable)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            placeholder="e.g. $20"
            value={formData.retakeFee?.amount ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseFloat(e.target.value) : undefined;
              onChange({
                retakeFee:
                  val !== undefined
                    ? { amount: val, currency: formData.retakeFee?.currency || 'USD' }
                    : undefined,
              });
            }}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
          />
          <select
            value={formData.retakeFee?.currency || 'USD'}
            onChange={(e) =>
              onChange({
                retakeFee: {
                  amount: formData.retakeFee?.amount || 0,
                  currency: e.target.value,
                },
              })
            }
            className="w-24 px-2 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* 4. Max Attempts Allowed */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Max Attempts Allowed
        </label>
        <input
          type="number"
          min="1"
          placeholder="e.g. 2"
          value={formData.maxAttempts ?? ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : null;
            onChange({ maxAttempts: val });
          }}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
        />
        <p className="text-[11px] text-slate-400 mt-1">Leave empty for unlimited attempts</p>
      </div>

      {/* 5. Certification Issuance */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Certification Issuance
        </label>
        <select
          value={formData.certificationIssuance || CertificationIssuance.NONE}
          onChange={(e) =>
            onChange({
              certificationIssuance: e.target.value as CertificationIssuance,
            })
          }
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
        >
          <option value={CertificationIssuance.IMMEDIATE}>e.g. Immediate</option>
          <option value={CertificationIssuance.ON_PASS}>On Pass</option>
          <option value={CertificationIssuance.AFTER_REVIEW}>After Review</option>
          <option value={CertificationIssuance.NONE}>No Certification</option>
        </select>
      </div>

      {/* 6. Duration (Minutes) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Duration (Minutes)
        </label>
        <input
          type="number"
          min="1"
          max="1440"
          placeholder="e.g. 45"
          value={formData.timeLimitMinutes ?? ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onChange({ timeLimitMinutes: val });
          }}
          className={`w-full px-3 py-2 text-sm rounded-lg border ${
            errors.timeLimitMinutes
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:ring-teal-200 focus:border-[#005963]'
          } outline-none transition-all`}
        />
        {errors.timeLimitMinutes && (
          <p className="text-xs text-red-500 mt-1">{errors.timeLimitMinutes}</p>
        )}
      </div>

      {/* 7. Validity Period (Optional) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Validity Period (Optional)
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            placeholder="e.g. 30 days"
            value={formData.validityPeriodDays ?? ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
              onChange({ validityPeriodDays: val });
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all pr-12"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400">days</span>
        </div>
      </div>

      {/* 8. Feedback Mechanism */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Feedback Mechanism
        </label>
        <select
          value={formData.feedbackMechanism || FeedbackMechanism.NONE}
          onChange={(e) =>
            onChange({
              feedbackMechanism: e.target.value as FeedbackMechanism,
            })
          }
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
        >
          <option value={FeedbackMechanism.SURVEY}>e.g. Survey</option>
          <option value={FeedbackMechanism.INSTANT_RESULT}>Instant Result</option>
          <option value={FeedbackMechanism.MANUAL_REVIEW}>Manual Review</option>
          <option value={FeedbackMechanism.NONE}>None</option>
        </select>
      </div>

      {/* 9. Number of Questions (Read-only derived from questions) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Number of Questions
          </label>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Lock size={11} />
            <span>Auto-calculated</span>
          </span>
        </div>
        <input
          type="text"
          readOnly
          disabled
          value={
            formData.derivedQuestionCount !== undefined && formData.derivedQuestionCount > 0
              ? `${formData.derivedQuestionCount}`
              : ''
          }
          placeholder="25"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-semibold cursor-not-allowed outline-none"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Total count of questions linked to this test.
        </p>
      </div>
    </div>
  );
};
