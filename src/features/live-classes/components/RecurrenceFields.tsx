import React from 'react';
import {
  RepeatFrequency,
  SeriesEndType,
  Weekday,
  type RecurrenceRule,
} from '../types';

interface RecurrenceFieldsProps {
  startDate: string;
  onStartDateChange: (date: string) => void;
  startTime: string;
  onStartTimeChange: (time: string) => void;
  durationMinutes: number;
  onDurationChange: (duration: number) => void;
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  recurrence: RecurrenceRule;
  onRecurrenceChange: (rule: RecurrenceRule) => void;
  isEditMode?: boolean;
}

const WEEKDAYS = [
  { key: Weekday.MON, label: 'Mon' },
  { key: Weekday.TUE, label: 'Tue' },
  { key: Weekday.WED, label: 'Wed' },
  { key: Weekday.THU, label: 'Thu' },
  { key: Weekday.FRI, label: 'Fri' },
  { key: Weekday.SAT, label: 'Sat' },
  { key: Weekday.SUN, label: 'Sun' },
];

const TIMEZONE_OPTIONS = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Singapore',
];

export const RecurrenceFields: React.FC<RecurrenceFieldsProps> = ({
  startDate,
  onStartDateChange,
  startTime,
  onStartTimeChange,
  durationMinutes,
  onDurationChange,
  timezone,
  onTimezoneChange,
  recurrence,
  onRecurrenceChange,
  isEditMode = false,
}) => {
  const toggleWeekday = (day: Weekday) => {
    const current = recurrence.daysOfWeek ?? [];
    const exists = current.includes(day);
    if (exists) {
      if (current.length === 1) return; // Keep at least one
      onRecurrenceChange({
        ...recurrence,
        daysOfWeek: current.filter((d) => d !== day),
      });
    } else {
      onRecurrenceChange({
        ...recurrence,
        daysOfWeek: [...current, day],
      });
    }
  };

  const dayOfMonth = startDate ? parseInt(startDate.split('-')[2], 10) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider text-xs">
        Date, Time & Recurrence
      </h3>

      {/* Date & Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Starts <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            disabled={isEditMode}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Start Time (24h) <span className="text-rose-500">*</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Duration <span className="text-rose-500">*</span>
          </label>
          <select
            value={durationMinutes}
            onChange={(e) => onDurationChange(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes (1 hr)</option>
            <option value={90}>90 minutes (1.5 hrs)</option>
            <option value={120}>120 minutes (2 hrs)</option>
            <option value={180}>180 minutes (3 hrs)</option>
          </select>
        </div>
      </div>

      {/* Timezone & Repeats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Timezone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Timezone <span className="text-rose-500">*</span>
          </label>
          <select
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            disabled={isEditMode}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>

        {/* Repeats select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Repeats <span className="text-rose-500">*</span>
          </label>
          <select
            value={recurrence.frequency}
            onChange={(e) =>
              onRecurrenceChange({
                ...recurrence,
                frequency: e.target.value as RepeatFrequency,
              })
            }
            disabled={isEditMode}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
          >
            <option value={RepeatFrequency.NONE}>Does not repeat</option>
            <option value={RepeatFrequency.DAILY}>Daily</option>
            <option value={RepeatFrequency.WEEKLY}>Weekly</option>
            <option value={RepeatFrequency.MONTHLY}>Monthly</option>
          </select>
        </div>
      </div>

      {/* Weekly Days of Week chips */}
      {recurrence.frequency === RepeatFrequency.WEEKLY && !isEditMode && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Repeats on Days
          </label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => {
              const isSelected = (recurrence.daysOfWeek ?? []).includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleWeekday(day.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Helper Text */}
      {recurrence.frequency === RepeatFrequency.MONTHLY && (
        <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          Repeats on day <strong>{dayOfMonth}</strong> of each month (shortened months use the last day).
        </p>
      )}

      {/* Series End Type & Occurrences / Date */}
      {recurrence.frequency !== RepeatFrequency.NONE && !isEditMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Series Ends
            </label>
            <select
              value={recurrence.endType ?? SeriesEndType.AFTER_COUNT}
              onChange={(e) =>
                onRecurrenceChange({
                  ...recurrence,
                  endType: e.target.value as SeriesEndType,
                })
              }
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={SeriesEndType.AFTER_COUNT}>
                After number of sessions
              </option>
              <option value={SeriesEndType.ON_DATE}>On specific date</option>
            </select>
          </div>

          <div>
            {recurrence.endType === SeriesEndType.ON_DATE ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date (Inclusive)
                </label>
                <input
                  type="date"
                  value={recurrence.untilDate ?? ''}
                  onChange={(e) =>
                    onRecurrenceChange({
                      ...recurrence,
                      untilDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Occurrences (1 – 100)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={recurrence.occurrences ?? 8}
                  onChange={(e) =>
                    onRecurrenceChange({
                      ...recurrence,
                      occurrences: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
