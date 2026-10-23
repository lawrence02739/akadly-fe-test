import React from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import type { LiveClassPreviewResponse } from '../types';
import { formatDateShort, formatTimeRange } from '../utils/calendar.utils';

interface GeneratedSeriesPanelProps {
  preview?: LiveClassPreviewResponse | null;
  isLoading?: boolean;
  courseTitle?: string;
  batchName?: string;
  sessionTitle?: string;
  timezone?: string;
  onReviewConflicts?: () => void;
}

export const GeneratedSeriesPanel: React.FC<GeneratedSeriesPanelProps> = ({
  preview,
  isLoading,
  courseTitle = 'Course',
  batchName = 'Batch',
  sessionTitle = 'Live Class Title',
  timezone = 'Asia/Kolkata',
  onReviewConflicts,
}) => {
  if (isLoading && !preview) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-6 bg-slate-200 rounded w-2/3" />
        <div className="h-24 bg-slate-100 rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!preview || preview.occurrences.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-xs font-semibold text-slate-700">Schedule preview</h4>
        <p className="text-[11px] text-slate-400 mt-1">
          Complete course, batch, date, and time to generate live class sessions
        </p>
      </div>
    );
  }

  const conflictsCount = preview.conflicts?.length ?? 0;
  const hoursTeaching = (preview.totalTeachingMinutes / 60).toFixed(1).replace('.0', '');

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 transition-opacity ${
        isLoading ? 'opacity-70' : 'opacity-100'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {preview.totalOccurrences} Live Class{preview.totalOccurrences > 1 ? 'es' : ''}
        </div>
        {conflictsCount === 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>NO CONFLICTS</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={onReviewConflicts}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{conflictsCount} CONFLICT{conflictsCount > 1 ? 'S' : ''}</span>
          </button>
        )}
      </div>

      {/* Meta & Title */}
      <div>
        <div className="text-[11px] text-slate-400 font-medium">
          {courseTitle} · {batchName}
        </div>
        <h3 className="text-sm font-bold text-slate-900 mt-0.5">
          {sessionTitle || 'Live Class Series'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {preview.range.from} to {preview.range.to} · {timezone}
        </p>
      </div>

      {/* Summary stats pills */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>Teaching time</span>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {hoursTeaching} hrs
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px]">
            <Users className="w-3 h-3" />
            <span>Capacity</span>
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {preview.capacity} ({preview.enrolled} enrolled)
          </div>
        </div>
      </div>

      {/* Occurrences List */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Generated Occurrences ({preview.occurrences.length})
        </div>
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {preview.occurrences.map((occ) => (
            <div
              key={occ.sequence}
              className="flex items-center justify-between p-2 rounded-lg border border-slate-200/80 bg-white text-xs hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                  {occ.sequence}
                </span>
                <span className="font-medium text-slate-800">
                  {formatDateShort(occ.localDate, timezone)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {formatTimeRange(occ.startsAt, occ.endsAt, timezone)}
                </span>
              </div>

              {occ.isToday ? (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                  TODAY
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                  SCHEDULED
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
