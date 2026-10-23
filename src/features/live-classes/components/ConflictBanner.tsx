import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface ConflictBannerProps {
  summary: string;
  totalConflicts: number;
  onReviewConflicts: () => void;
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({
  summary,
  totalConflicts,
  onReviewConflicts,
}) => {
  if (totalConflicts === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 mb-6 transition-all shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-amber-900">
            {totalConflicts} Scheduling Conflict{totalConflicts > 1 ? 's' : ''} Detected
          </div>
          <p className="text-xs text-amber-700 truncate mt-0.5">{summary}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReviewConflicts}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        <span>Review conflicts</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
