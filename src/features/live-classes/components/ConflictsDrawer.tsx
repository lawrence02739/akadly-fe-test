import React from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import type { LiveClassConflict } from '../types';

interface ConflictsDrawerProps {
  isOpen: boolean;
  conflicts: LiveClassConflict[];
  onClose: () => void;
  onProceedAnyway?: () => void;
  isLoading?: boolean;
}

export const ConflictsDrawer: React.FC<ConflictsDrawerProps> = ({
  isOpen,
  conflicts,
  onClose,
  onProceedAnyway,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Review Conflicts ({conflicts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Potential overlaps or unassigned resources
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {conflicts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No scheduling conflicts detected.
            </div>
          ) : (
            conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${
                  conflict.severity === 'ERROR'
                    ? 'border-rose-200 bg-rose-50/50'
                    : 'border-amber-200 bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      conflict.severity === 'ERROR'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {conflict.severity === 'ERROR' ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {conflict.type}
                  </span>
                  {conflict.sessionSequence && (
                    <span className="text-xs text-slate-500">
                      Class #{conflict.sessionSequence}
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-800">
                  {conflict.message}
                </p>
                {conflict.conflictingSessionTitle && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Conflicting session: &ldquo;{conflict.conflictingSessionTitle}&rdquo;
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Edit schedule
          </button>
          {onProceedAnyway && (
            <button
              type="button"
              onClick={onProceedAnyway}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
            >
              {isLoading ? 'Saving...' : 'Create anyway'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
