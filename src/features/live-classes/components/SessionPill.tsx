import React from 'react';
import type { CalendarSessionItem } from '../types';
import { formatTimeInTimezone, getStatusStyle } from '../utils/calendar.utils';

interface SessionPillProps {
  session: CalendarSessionItem;
  timezone?: string;
  onClick?: (session: CalendarSessionItem) => void;
}

export const SessionPill: React.FC<SessionPillProps> = ({
  session,
  timezone = 'Asia/Kolkata',
  onClick,
}) => {
  const style = getStatusStyle(session.displayStatus);
  const timeStr = formatTimeInTimezone(session.startsAt, timezone);

  const instructorName =
    session.instructor?.name?.split(' ')[0] ??
    (session.supportStaff ? 'Support host' : 'Unassigned');

  return (
    <button
      type="button"
      onClick={() => onClick?.(session)}
      className={`w-full text-left p-1.5 rounded border transition-colors shadow-sm text-xs cursor-pointer ${style.pillBg} ${style.pillBorder}`}
    >
      <div className="flex items-center gap-1.5 font-medium truncate">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotBg}`} />
        <span className={`truncate ${style.pillText}`}>{session.title}</span>
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
        {timeStr} · {instructorName}
      </div>
    </button>
  );
};
