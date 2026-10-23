import React from 'react';
import type { CalendarDay, CalendarSessionItem } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDateFull, formatTimeRange } from '../utils/calendar.utils';
import { User, Users, Clock } from 'lucide-react';

interface DayListProps {
  day?: CalendarDay;
  timezone: string;
  onSelectSession: (session: CalendarSessionItem) => void;
}

export const DayList: React.FC<DayListProps> = ({
  day,
  timezone,
  onSelectSession,
}) => {
  if (!day || day.sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-900">No live classes scheduled</h4>
        <p className="text-xs text-slate-500 mt-1">
          {day ? formatDateFull(day.date, timezone) : 'Select a date to view agenda'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {formatDateFull(day.date, timezone)}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {day.sessions.length} class{day.sessions.length > 1 ? 'es' : ''} scheduled
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {day.sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all cursor-pointer shadow-xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={session.displayStatus} size="sm" />
                <span className="text-xs font-semibold text-slate-500">
                  {formatTimeRange(session.startsAt, session.endsAt, timezone)}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {session.title}
              </h4>
              <p className="text-xs text-slate-500">
                {session.courseTitle} · {session.batchName}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.instructor?.name || 'Unassigned'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {session.joinedCount} / {session.capacity}
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
