import React from 'react';
import type { CalendarDay, CalendarSessionItem } from '../types';
import { SessionPill } from './SessionPill';

interface WeekGridProps {
  days: CalendarDay[];
  timezone: string;
  onSelectSession: (session: CalendarSessionItem) => void;
}

export const WeekGrid: React.FC<WeekGridProps> = ({
  days,
  timezone,
  onSelectSession,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="grid grid-cols-7 divide-x divide-slate-200">
        {days.map((day) => {
          const parts = day.date.split('-');
          const dayNumber = parseInt(parts[2], 10);
          const dateObj = new Date(day.date + 'T00:00:00');
          const weekdayName = new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
          }).format(dateObj);

          return (
            <div key={day.date} className="flex flex-col min-h-[500px]">
              {/* Day column header */}
              <div
                className={`p-3 text-center border-b border-slate-200 ${
                  day.isToday ? 'bg-indigo-50/50' : 'bg-slate-50'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {weekdayName}
                </div>
                <div
                  className={`mt-1 text-base font-bold inline-flex items-center justify-center w-8 h-8 rounded-full ${
                    day.isToday ? 'bg-indigo-600 text-white' : 'text-slate-900'
                  }`}
                >
                  {dayNumber}
                </div>
              </div>

              {/* Sessions List */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {day.sessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No classes
                  </div>
                ) : (
                  day.sessions.map((session) => (
                    <SessionPill
                      key={session.id}
                      session={session}
                      timezone={timezone}
                      onClick={onSelectSession}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
