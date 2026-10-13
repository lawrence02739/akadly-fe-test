import React from 'react';
import { Weekday, type WeeklySlot } from '../../types/instructor.types';
import { calculateSlotHours, sumWeeklySlotsHours } from '../../utils/format';

interface WeeklyScheduleEditorProps {
  slots: WeeklySlot[];
  onChangeSlots: (slots: WeeklySlot[]) => void;
  requiredWeeklyHours: number | null;
  timezone: string;
  onChangeTimezone: (tz: string) => void;
  error?: string;
}

const ALL_DAYS: { day: Weekday; label: string }[] = [
  { day: Weekday.MON, label: 'Monday' },
  { day: Weekday.TUE, label: 'Tuesday' },
  { day: Weekday.WED, label: 'Wednesday' },
  { day: Weekday.THU, label: 'Thursday' },
  { day: Weekday.FRI, label: 'Friday' },
  { day: Weekday.SAT, label: 'Saturday' },
  { day: Weekday.SUN, label: 'Sunday' },
];

export const WeeklyScheduleEditor: React.FC<WeeklyScheduleEditorProps> = ({
  slots,
  onChangeSlots,
  requiredWeeklyHours,
  timezone,
  onChangeTimezone,
  error,
}) => {
  const totalHours = sumWeeklySlotsHours(slots);

  const getSlotForDay = (day: Weekday): WeeklySlot | undefined =>
    slots.find((s) => s.day === day);

  const handleToggleDay = (day: Weekday, enabled: boolean) => {
    if (enabled) {
      // Default 09:00 to 12:00
      onChangeSlots([...slots, { day, startTime: '09:00', endTime: '12:00' }]);
    } else {
      onChangeSlots(slots.filter((s) => s.day !== day));
    }
  };

  const handleTimeChange = (
    day: Weekday,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    onChangeSlots(
      slots.map((s) => (s.day === day ? { ...s, [field]: value } : s)),
    );
  };

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Weekly Availability Slots
          </span>
          <p className="text-xs text-slate-500">
            Configure working hours per weekday.
          </p>
        </div>

        {/* Timezone picker */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Timezone:</label>
          <select
            value={timezone}
            onChange={(e) => onChangeTimezone(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          </select>
        </div>
      </div>

      {/* 7 Days Table */}
      <div className="space-y-2">
        {ALL_DAYS.map(({ day, label }) => {
          const slot = getSlotForDay(day);
          const isEnabled = !!slot;
          const slotHours = slot ? calculateSlotHours(slot) : 0;

          return (
            <div
              key={day}
              className={`flex flex-wrap items-center justify-between rounded-lg border px-3 py-2 transition-colors ${
                isEnabled
                  ? 'border-teal-200 bg-white'
                  : 'border-slate-200 bg-slate-100/60 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={isEnabled}
                  onChange={(e) => handleToggleDay(day, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
                />
                <label
                  htmlFor={`day-${day}`}
                  className="w-24 text-xs font-medium text-slate-800 cursor-pointer"
                >
                  {label}
                </label>
              </div>

              {isEnabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot?.startTime || '09:00'}
                    onChange={(e) =>
                      handleTimeChange(day, 'startTime', e.target.value)
                    }
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-[#0C5A69] focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="time"
                    value={slot?.endTime || '12:00'}
                    onChange={(e) =>
                      handleTimeChange(day, 'endTime', e.target.value)
                    }
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:border-[#0C5A69] focus:outline-none"
                  />
                  <span className="w-14 text-right text-xs font-medium text-teal-700">
                    {slotHours.toFixed(1)} h
                  </span>
                </div>
              ) : (
                <span className="text-xs italic text-slate-400">
                  Unavailable
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Total and Required Comparison */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
        <span className="text-slate-600">
          Required:{' '}
          <span className="font-semibold text-slate-900">
            {requiredWeeklyHours || 0} hrs/week
          </span>
        </span>
        <span
          className={`font-semibold ${
            requiredWeeklyHours &&
            Math.abs(totalHours - requiredWeeklyHours) <= 0.01
              ? 'text-emerald-600'
              : 'text-amber-600'
          }`}
        >
          Scheduled Total: {totalHours.toFixed(1)} hrs/week
        </span>
      </div>

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
