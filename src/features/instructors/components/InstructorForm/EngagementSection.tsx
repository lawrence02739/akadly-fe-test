import React from 'react';
import { Info } from 'lucide-react';
import { InstructorType, type WeeklySlot } from '../../types/instructor.types';
import { WeeklyScheduleEditor } from './WeeklyScheduleEditor';

interface EngagementSectionProps {
  instructorType: InstructorType;
  startDate: string;
  onChangeStartDate: (date: string) => void;
  endDate: string;
  onChangeEndDate: (date: string) => void;
  requiredWeeklyHours: number | '';
  onChangeRequiredWeeklyHours: (hrs: number | '') => void;
  weeklySchedule: WeeklySlot[];
  onChangeWeeklySchedule: (slots: WeeklySlot[]) => void;
  timezone: string;
  onChangeTimezone: (tz: string) => void;
  renewalNote: string;
  onChangeRenewalNote: (note: string) => void;
  errors: Record<string, string | undefined>;
}

export const EngagementSection: React.FC<EngagementSectionProps> = ({
  instructorType,
  startDate,
  onChangeStartDate,
  endDate,
  onChangeEndDate,
  requiredWeeklyHours,
  onChangeRequiredWeeklyHours,
  weeklySchedule,
  onChangeWeeklySchedule,
  timezone,
  onChangeTimezone,
  renewalNote,
  onChangeRenewalNote,
  errors,
}) => {
  const getSectionTitle = () => {
    switch (instructorType) {
      case InstructorType.FULL_TIME:
      case InstructorType.PART_TIME:
        return 'Employment Details';
      case InstructorType.CONTRACT_BASED:
        return 'Contract Details';
      case InstructorType.GUEST:
        return 'Engagement Details';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="text-base font-semibold text-slate-900">
        {getSectionTitle()}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Configure engagement timeline and availability rules.
      </p>

      <div className="mt-5 space-y-4">
        {/* FULL-TIME */}
        {instructorType === InstructorType.FULL_TIME && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Employment Start Date{' '}
                <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onChangeStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
              />
            </div>

            <div className="flex items-center">
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-xs text-teal-800">
                <Info className="h-4 w-4 shrink-0 text-teal-600" />
                <span>
                  Ongoing — no fixed end date. Access remains active until
                  manually suspended or removed.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PART-TIME */}
        {instructorType === InstructorType.PART_TIME && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Employment Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors['engagement.startDate']
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {errors['engagement.startDate'] && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors['engagement.startDate']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Required Weekly Availability (Hours){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  step={0.5}
                  value={requiredWeeklyHours}
                  onChange={(e) =>
                    onChangeRequiredWeeklyHours(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  placeholder="e.g. 15"
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors['engagement.requiredWeeklyHours']
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {errors['engagement.requiredWeeklyHours'] && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors['engagement.requiredWeeklyHours']}
                  </p>
                )}
              </div>
            </div>

            {/* Weekly Schedule */}
            <WeeklyScheduleEditor
              slots={weeklySchedule}
              onChangeSlots={onChangeWeeklySchedule}
              requiredWeeklyHours={
                requiredWeeklyHours === '' ? null : requiredWeeklyHours
              }
              timezone={timezone}
              onChangeTimezone={onChangeTimezone}
              error={errors['engagement.weeklySchedule']}
            />
          </div>
        )}

        {/* CONTRACT-BASED */}
        {instructorType === InstructorType.CONTRACT_BASED && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Contract Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors['engagement.startDate']
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {errors['engagement.startDate'] && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors['engagement.startDate']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Contract End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onChangeEndDate(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors['engagement.endDate']
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {errors['engagement.endDate'] && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors['engagement.endDate']}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-700">
                  Renewal / Expiry Note{' '}
                  <span className="text-slate-400">(optional)</span>
                </label>
                <span className="text-xs text-slate-400">
                  {renewalNote.length} / 500 characters
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={500}
                value={renewalNote}
                onChange={(e) => onChangeRenewalNote(e.target.value)}
                placeholder="Terms for renewal, milestone expectations, or notice periods..."
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
              />
            </div>
          </div>
        )}

        {/* GUEST */}
        {instructorType === InstructorType.GUEST && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Engagement Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onChangeStartDate(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors['engagement.startDate']
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {errors['engagement.startDate'] && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors['engagement.startDate']}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Engagement End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onChangeEndDate(e.target.value)}
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${
                    errors['engagement.endDate']
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {errors['engagement.endDate'] && (
                  <p className="mt-1 text-xs text-rose-500">
                    {errors['engagement.endDate']}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
              <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                Guest instructors will only be allowed to sign in and interact
                with course materials during the defined window. Access expires
                automatically at 23:59 on the end date.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
