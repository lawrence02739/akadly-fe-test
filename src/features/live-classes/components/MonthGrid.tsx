import React from 'react';
import type { CalendarDay, CalendarSessionItem } from '../types';
import { SessionPill } from './SessionPill';

interface MonthGridProps {
  days: CalendarDay[];
  timezone: string;
  onSelectSession: (session: CalendarSessionItem) => void;
  onSelectDay?: (date: string) => void;
}

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const MonthGrid: React.FC<MonthGridProps> = ({
  days,
  timezone,
  onSelectSession,
  onSelectDay,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* 7 Column Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2 text-xs font-semibold text-slate-600">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
        {days.map((day) => {
          const dayNumber = parseInt(day.date.split('-')[2], 10);
          const visibleSessions = day.sessions.slice(0, 3);
          const extraCount = day.sessions.length - visibleSessions.length;

          return (
            <div
              key={day.date}
              className={`min-h-28 p-1.5 sm:p-2 transition-colors flex flex-col ${
                day.inCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
              } ${day.isToday ? 'bg-indigo-50/20' : ''}`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                    day.isToday
                      ? 'bg-indigo-600 text-white font-bold'
                      : day.inCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {dayNumber}
                </span>

                {day.isToday && (
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              {/* Session pills */}
              <div className="space-y-1 flex-1">
                {visibleSessions.map((session) => (
                  <SessionPill
                    key={session.id}
                    session={session}
                    timezone={timezone}
                    onClick={onSelectSession}
                  />
                ))}

                {extraCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onSelectDay?.(day.date)}
                    className="w-full text-left text-[11px] font-medium text-indigo-600 hover:text-indigo-800 p-0.5 rounded cursor-pointer"
                  >
                    +{extraCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Row */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Live class</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Cancelled</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400">
          Times displayed in {timezone}
        </div>
      </div>
    </div>
  );
};
