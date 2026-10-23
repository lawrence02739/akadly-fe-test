import {
  LiveClassDisplayStatus,
  RepeatFrequency,
  SeriesEndType,
  Weekday,
  type RecurrenceRule,
  type LiveClassPreviewResponse,
} from '../types';

export function formatTimeInTimezone(
  isoDate: string,
  timezone = 'Asia/Kolkata',
): string {
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return '';
  }
}

export function formatTimeRange(
  startsAtIso: string,
  endsAtIso: string,
  timezone = 'Asia/Kolkata',
): string {
  try {
    const startStr = formatTimeInTimezone(startsAtIso, timezone);
    const endStr = formatTimeInTimezone(endsAtIso, timezone);
    return `${startStr} – ${endStr}`;
  } catch {
    return '';
  }
}

export function formatDateShort(
  isoDateOrDay: string,
  timezone = 'Asia/Kolkata',
): string {
  try {
    const d = new Date(isoDateOrDay.includes('T') ? isoDateOrDay : `${isoDateOrDay}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return isoDateOrDay;
  }
}

export function formatDateFull(
  isoDateOrDay: string,
  timezone = 'Asia/Kolkata',
): string {
  try {
    const d = new Date(isoDateOrDay.includes('T') ? isoDateOrDay : `${isoDateOrDay}T00:00:00`);
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoDateOrDay;
  }
}

export function getStatusStyle(status: LiveClassDisplayStatus): {
  badgeBg: string;
  badgeText: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  dotBg: string;
} {
  switch (status) {
    case LiveClassDisplayStatus.LIVE:
      return {
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeText: 'text-emerald-700',
        pillBg: 'bg-emerald-50 hover:bg-emerald-100',
        pillText: 'text-emerald-900',
        pillBorder: 'border-emerald-300',
        dotBg: 'bg-emerald-500 animate-pulse',
      };
    case LiveClassDisplayStatus.UPCOMING:
    case LiveClassDisplayStatus.SCHEDULED:
      return {
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        badgeText: 'text-indigo-700',
        pillBg: 'bg-indigo-50 hover:bg-indigo-100',
        pillText: 'text-indigo-900',
        pillBorder: 'border-indigo-200',
        dotBg: 'bg-indigo-500',
      };
    case LiveClassDisplayStatus.COMPLETED:
      return {
        badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
        badgeText: 'text-teal-700',
        pillBg: 'bg-teal-50 hover:bg-teal-100',
        pillText: 'text-teal-900',
        pillBorder: 'border-teal-200',
        dotBg: 'bg-teal-500',
      };
    case LiveClassDisplayStatus.CANCELLED:
      return {
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeText: 'text-rose-700',
        pillBg: 'bg-rose-50 hover:bg-rose-100',
        pillText: 'text-rose-900',
        pillBorder: 'border-rose-200',
        dotBg: 'bg-rose-500',
      };
    case LiveClassDisplayStatus.DRAFT:
    default:
      return {
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        badgeText: 'text-slate-700',
        pillBg: 'bg-slate-100 hover:bg-slate-200',
        pillText: 'text-slate-800',
        pillBorder: 'border-slate-200',
        dotBg: 'bg-slate-400',
      };
  }
}

const WEEKDAY_TO_JS_DAY: Record<Weekday, number> = {
  [Weekday.SUN]: 0,
  [Weekday.MON]: 1,
  [Weekday.TUE]: 2,
  [Weekday.WED]: 3,
  [Weekday.THU]: 4,
  [Weekday.FRI]: 5,
  [Weekday.SAT]: 6,
};

export function generateLocalPreview(input: {
  startDate: string;
  startTime: string;
  durationMinutes: number;
  timezone?: string;
  recurrence: RecurrenceRule;
  capacity?: number;
  enrolled?: number;
}): LiveClassPreviewResponse {
  const {
    startDate,
    startTime,
    durationMinutes,
    recurrence,
    capacity = 0,
    enrolled = 0,
  } = input;

  if (!startDate || !startTime) {
    return {
      occurrences: [],
      totalOccurrences: 0,
      totalTeachingMinutes: 0,
      capacity,
      enrolled,
      seatsAvailable: Math.max(0, capacity - enrolled),
      range: { from: startDate || '', to: startDate || '' },
      conflicts: [],
      instructorAvailable: true,
    };
  }

  const [sYear, sMonth, sDay] = startDate.split('-').map(Number);
  const [sHour, sMin] = startTime.split(':').map(Number);

  const frequency = recurrence.frequency || RepeatFrequency.NONE;
  const interval = Math.max(1, recurrence.interval || 1);
  const endType = recurrence.endType || SeriesEndType.AFTER_COUNT;
  const occurrencesLimit = Math.min(100, Math.max(1, recurrence.occurrences || 8));

  const occurrences: Array<{
    sequence: number;
    startsAt: string;
    endsAt: string;
    localDate: string;
    displayStatus: LiveClassDisplayStatus;
    isToday: boolean;
  }> = [];

  const todayStr = new Date().toISOString().split('T')[0];

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const createOccurrence = (currDate: Date, seq: number) => {
    const startObj = new Date(currDate);
    const endObj = new Date(startObj.getTime() + durationMinutes * 60000);
    const dateStr = formatLocalDate(startObj);
    return {
      sequence: seq,
      startsAt: startObj.toISOString(),
      endsAt: endObj.toISOString(),
      localDate: dateStr,
      displayStatus: LiveClassDisplayStatus.UPCOMING,
      isToday: dateStr === todayStr,
    };
  };

  if (frequency === RepeatFrequency.NONE) {
    const d = new Date(sYear, sMonth - 1, sDay, sHour, sMin, 0);
    occurrences.push(createOccurrence(d, 1));
  } else if (frequency === RepeatFrequency.DAILY) {
    let curr = new Date(sYear, sMonth - 1, sDay, sHour, sMin, 0);
    let seq = 1;
    while (seq <= occurrencesLimit) {
      const dateStr = formatLocalDate(curr);
      if (endType === SeriesEndType.ON_DATE && recurrence.untilDate && dateStr > recurrence.untilDate) {
        break;
      }
      occurrences.push(createOccurrence(curr, seq));
      seq++;
      curr = new Date(curr.getTime() + interval * 24 * 60 * 60 * 1000);
    }
  } else if (frequency === RepeatFrequency.WEEKLY) {
    const targetWeekdays = new Set(
      (recurrence.daysOfWeek ?? [Weekday.MON]).map((w) => WEEKDAY_TO_JS_DAY[w]),
    );
    let curr = new Date(sYear, sMonth - 1, sDay, sHour, sMin, 0);
    let seq = 1;
    let safetyCounter = 0;
    while (seq <= occurrencesLimit && safetyCounter < 730) {
      safetyCounter++;
      const dateStr = formatLocalDate(curr);
      if (endType === SeriesEndType.ON_DATE && recurrence.untilDate && dateStr > recurrence.untilDate) {
        break;
      }
      if (targetWeekdays.has(curr.getDay())) {
        occurrences.push(createOccurrence(curr, seq));
        seq++;
      }
      curr = new Date(curr.getTime() + 24 * 60 * 60 * 1000);
    }
  } else if (frequency === RepeatFrequency.MONTHLY) {
    let currYear = sYear;
    let currMonth = sMonth - 1;
    const targetDay = sDay;
    let seq = 1;
    while (seq <= occurrencesLimit) {
      const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
      const actualDay = Math.min(targetDay, daysInMonth);
      const curr = new Date(currYear, currMonth, actualDay, sHour, sMin, 0);
      const dateStr = formatLocalDate(curr);
      if (endType === SeriesEndType.ON_DATE && recurrence.untilDate && dateStr > recurrence.untilDate) {
        break;
      }
      occurrences.push(createOccurrence(curr, seq));
      seq++;
      currMonth += interval;
      while (currMonth >= 12) {
        currMonth -= 12;
        currYear += 1;
      }
    }
  }

  const fromDate = occurrences[0]?.localDate || startDate;
  const toDate = occurrences[occurrences.length - 1]?.localDate || startDate;

  return {
    occurrences,
    totalOccurrences: occurrences.length,
    totalTeachingMinutes: occurrences.length * durationMinutes,
    capacity,
    enrolled,
    seatsAvailable: Math.max(0, capacity - enrolled),
    range: {
      from: fromDate,
      to: toDate,
    },
    conflicts: [],
    instructorAvailable: true,
  };
}
