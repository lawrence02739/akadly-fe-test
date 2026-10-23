import React, { useState } from 'react';
import { UpdateScope } from '../types';

interface ScopeDialogProps {
  isOpen: boolean;
  actionType: 'update' | 'delete';
  title?: string;
  onClose: () => void;
  onConfirm: (scope: UpdateScope) => void;
  isLoading?: boolean;
}

export const ScopeDialog: React.FC<ScopeDialogProps> = ({
  isOpen,
  actionType,
  title = 'this live class',
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedScope, setSelectedScope] = useState<UpdateScope>(UpdateScope.THIS);

  if (!isOpen) return null;

  const actionVerb = actionType === 'delete' ? 'Delete' : 'Update';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-slate-900">
          {actionVerb} recurring class
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          &ldquo;{title}&rdquo; is part of a recurring series. How would you like to apply this change?
        </p>

        <div className="mt-5 space-y-3">
          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedScope === UpdateScope.THIS ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
            <input
              type="radio"
              name="scope"
              checked={selectedScope === UpdateScope.THIS}
              onChange={() => setSelectedScope(UpdateScope.THIS)}
              className="mt-1 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">This class only</div>
              <div className="text-xs text-slate-500">Only modify this specific occurrence. Other sessions remain unchanged.</div>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedScope === UpdateScope.THIS_AND_FOLLOWING ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
            <input
              type="radio"
              name="scope"
              checked={selectedScope === UpdateScope.THIS_AND_FOLLOWING}
              onChange={() => setSelectedScope(UpdateScope.THIS_AND_FOLLOWING)}
              className="mt-1 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">This and following classes</div>
              <div className="text-xs text-slate-500">Apply to this session and all upcoming sessions in this series.</div>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedScope === UpdateScope.ALL ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
            <input
              type="radio"
              name="scope"
              checked={selectedScope === UpdateScope.ALL}
              onChange={() => setSelectedScope(UpdateScope.ALL)}
              className="mt-1 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">All classes in series</div>
              <div className="text-xs text-slate-500">Apply to all active sessions across this series (completed sessions are preserved).</div>
            </div>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedScope)}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${actionType === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isLoading ? 'Processing...' : `${actionVerb} classes`}
          </button>
        </div>
      </div>
    </div>
  );
};
