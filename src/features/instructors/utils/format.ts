import {
  EngagementState,
  type InstructorStatus,
  InstructorType,
  type WeeklySlot,
} from '../types/instructor.types';

export const INSTRUCTOR_TYPE_LABELS: Record<InstructorType, string> = {
  [InstructorType.FULL_TIME]: 'Full-time',
  [InstructorType.PART_TIME]: 'Part-time',
  [InstructorType.CONTRACT_BASED]: 'Contract-based',
  [InstructorType.GUEST]: 'Guest',
};

export const INSTRUCTOR_STATUS_LABELS: Record<InstructorStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  suspended: 'Suspended',
  disabled: 'Disabled',
  draft: 'Draft',
};

export function formatIstDate(
  dateStr?: string | Date | null,
  includeTime = true,
): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...(includeTime
        ? { hour: '2-digit', minute: '2-digit', hour12: false }
        : {}),
    };
    return new Intl.DateTimeFormat('en-GB', options).format(d);
  } catch {
    return '—';
  }
}

export function formatShortDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
    }).format(d);
  } catch {
    return '—';
  }
}

export function formatEngagementSubline(
  type: InstructorType,
  engagement: {
    startDate?: string | null;
    endDate?: string | null;
    requiredWeeklyHours?: number | null;
    renewalReviewDate?: string | null;
  },
  engagementState?: EngagementState,
): string {
  const isExpired = engagementState === EngagementState.EXPIRED;

  switch (type) {
    case InstructorType.FULL_TIME:
      return engagement.startDate
        ? `Started ${formatShortDate(engagement.startDate)}`
        : 'Ongoing';

    case InstructorType.PART_TIME: {
      const start = engagement.startDate
        ? `Started ${formatShortDate(engagement.startDate)}`
        : 'Ongoing';
      const hours = engagement.requiredWeeklyHours
        ? `${engagement.requiredWeeklyHours} hrs/wk`
        : '';
      return hours ? `${start} · ${hours}` : start;
    }

    case InstructorType.CONTRACT_BASED: {
      const start = formatShortDate(engagement.startDate);
      const end = formatShortDate(engagement.endDate);
      let text = `${start} – ${end}`;
      if (engagement.renewalReviewDate) {
        text += ` · Review ${formatShortDate(engagement.renewalReviewDate)}`;
      }
      if (isExpired) {
        text += ' · Expired';
      }
      return text;
    }

    case InstructorType.GUEST: {
      const start = formatShortDate(engagement.startDate);
      const end = formatShortDate(engagement.endDate);
      let text = `${start} – ${end}`;
      if (isExpired) {
        text += ' · Expired';
      }
      return text;
    }
  }
}

export function calculateSlotHours(slot: WeeklySlot): number {
  if (!slot.startTime || !slot.endTime) return 0;
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return endMin > startMin ? (endMin - startMin) / 60 : 0;
}

export function sumWeeklySlotsHours(slots: WeeklySlot[]): number {
  return slots.reduce((acc, slot) => acc + calculateSlotHours(slot), 0);
}
