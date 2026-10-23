import React from 'react';
import { Clock, ArrowRight, User } from 'lucide-react';
import type { CalendarDay, CalendarSessionItem } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDateShort, formatTimeRange } from '../utils/calendar.utils';

interface TodayAgendaPanelProps {
  todayDay?: CalendarDay;
  timezone: string;
  onSelectSession: (session: CalendarSessionItem) => void;
  onOpenFullAgenda: () => void;
}

export const TodayAgendaPanel: React.FC<TodayAgendaPanelProps> = ({
  todayDay,
  timezone,
  onSelectSession,
  onOpenFullAgenda,
}) => {
  const sessions = todayDay?.sessions ?? [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Today&apos;s Agenda</h3>
          <p className="text-xs text-slate-500">
            {todayDay ? formatDateShort(todayDay.date, timezone) : 'Today'} · {sessions.length} class{sessions.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenFullAgenda}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
        >
          <span>Open agenda</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[300px]">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-xs font-medium text-slate-600">No classes today</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Enjoy your day!</div>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition-all cursor-pointer shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500">
                  {formatTimeRange(session.startsAt, session.endsAt, timezone)}
                </span>
                <StatusBadge status={session.displayStatus} size="sm" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {session.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate">{session.batchName}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{session.instructor?.name?.split(' ')[0] || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
