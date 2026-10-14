import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmRemoveAssignmentDialogProps {
  isOpen: boolean;
  courseTitle: string;
  batchName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isRemoving?: boolean;
}

export const ConfirmRemoveAssignmentDialog: React.FC<
  ConfirmRemoveAssignmentDialogProps
> = ({
  isOpen,
  courseTitle,
  batchName,
  onConfirm,
  onCancel,
  isRemoving = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Remove Cohort Assignment
              </h3>
              <p className="text-sm text-slate-500">
                Revoke teaching access for this cohort.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isRemoving}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
          Are you sure you want to remove the assignment for{' '}
          <span className="font-semibold text-slate-900">{courseTitle}</span> (
          <span className="font-semibold text-slate-900">{batchName}</span>)?
          <span className="mt-2 block text-xs text-slate-500">
            The instructor will immediately lose access and teaching permissions for learners within this cohort.
          </span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isRemoving}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {isRemoving ? 'Removing...' : 'Remove Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};
