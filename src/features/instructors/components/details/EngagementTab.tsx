import React from 'react';
import { Clock } from 'lucide-react';

export const EngagementTab: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
        <Clock className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No Engagement Data Yet
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-xs text-slate-500">
        Live teaching activity, attendance tracking, and weekly log breakdowns will appear here once the instructor engages with live sessions.
      </p>
    </div>
  );
};
