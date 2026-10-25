import React from 'react';
import type { SaveStatus } from '../store/brandingDraft.store';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface SavedIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: Date | null;
}

export const SavedIndicator: React.FC<SavedIndicatorProps> = ({
  status,
  lastSavedAt,
}) => {
  if (status === 'saving') {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Saving draft...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-medium">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Failed to save draft</span>
      </div>
    );
  }

  if (status === 'saved' || lastSavedAt) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>All changes saved</span>
      </div>
    );
  }

  return null;
};
