import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { Test } from '../types';

interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTest: Test;
  selectedCount: number;
  sourceName?: string;
  onConfirm: (options: { marksOverride?: number; shuffleQuestions?: boolean }) => Promise<void>;
  isSubmitting?: boolean;
}

export const ImportConfirmModal: React.FC<ImportConfirmModalProps> = ({
  isOpen,
  onClose,
  targetTest,
  selectedCount,
  sourceName = 'Question Bank - Assessment Repository',
  onConfirm,
  isSubmitting = false,
}) => {
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(Boolean(targetTest.shuffleQuestions ?? true));
  const [pointsOverride, setPointsOverride] = useState<string>('2');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const marks = pointsOverride ? parseFloat(pointsOverride) : undefined;
    await onConfirm({
      marksOverride: marks && marks > 0 ? marks : undefined,
      shuffleQuestions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-7 space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Import Questions to {targetTest.title || 'Class Tests'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You are about to import {selectedCount} questions to:
            </p>
          </div>

          {/* Target Assessment Card */}
          <div className="flex items-center gap-4 p-4 border border-[#005963]/30 bg-teal-50/15 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[#005963] text-white flex items-center justify-center shrink-0">
              <HelpCircle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {targetTest.title || 'Introduction to HTML/CSS'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {targetTest.questionCount || 0} Questions • {targetTest.grading?.totalMarks || 0} Points
              </p>
            </div>
          </div>

          {/* IMPORT SOURCE */}
          <div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              IMPORT SOURCE
            </div>
            <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl bg-white">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="w-4 h-4 rounded text-[#005963] focus:ring-[#005963]"
                />
                <span className="text-xs font-semibold text-slate-800">
                  {sourceName}
                </span>
              </label>
              <span className="text-xs text-slate-500 font-medium">
                {selectedCount} Questions
              </span>
            </div>
          </div>

          {/* IMPORT SETTINGS */}
          <div>
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              IMPORT SETTINGS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Left Column: Shuffle Questions */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Shuffle Questions
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005963]" />
                </label>
              </div>

              {/* Right Column: Point Value(Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  Point Value(Optional)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={pointsOverride}
                    onChange={(e) => setPointsOverride(e.target.value)}
                    placeholder="2"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#005963] outline-none pr-24"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                    per question
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#005963] hover:bg-[#004a52] rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Importing...</span>
              ) : (
                <span>Confirm & Import</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
