import { TemplateState } from '../types';

interface StateBadgeProps {
  state: TemplateState;
  hasDraft?: boolean;
}

export function StateBadge({ state, hasDraft }: StateBadgeProps) {
  switch (state) {
    case TemplateState.ENABLED:
      return (
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            Enabled
          </span>
          {hasDraft && <span className="text-xs text-slate-500 mt-0.5">Has draft</span>}
        </div>
      );
    case TemplateState.DRAFT:
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          Draft
        </span>
      );
    case TemplateState.DISABLED:
      return (
        <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">
          Disabled
        </span>
      );
    case TemplateState.ARCHIVED:
      return (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-400">
          Archived
        </span>
      );
    default:
      return null;
  }
}
