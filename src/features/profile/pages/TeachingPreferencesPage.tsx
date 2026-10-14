import { useEffect, useState } from 'react';
import OfficeHoursTable from '../components/OfficeHoursTable';
import ProfileSettingsLayout from '../components/ProfileSettingsLayout';
import {
  useTeachingPreferencesQuery,
  useUpdateTeachingPreferencesMutation,
} from '../hooks/useProfile';
import type {
  AvailabilityStatus,
  ExpectedResponseTime,
  GradingQueueOrder,
  OfficeHourItem,
  PendingGradingReminder,
  PreferredLearnerContact,
  TeachingPreferences,
} from '../types/profile.types';

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (UTC +05:30)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UTC +04:00)' },
  { value: 'Europe/London', label: 'Europe/London (UTC +00:00 / +01:00)' },
  { value: 'America/New_York', label: 'America/New_York (UTC -05:00 / -04:00)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC -08:00 / -07:00)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC +08:00)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC +10:00 / +11:00)' },
];

export default function TeachingPreferencesPage() {
  const { data: serverPrefs } = useTeachingPreferencesQuery();
  const updateMutation = useUpdateTeachingPreferencesMutation();

  const [prefs, setPrefs] = useState<TeachingPreferences>({
    timezone: 'Asia/Kolkata',
    availabilityStatus: 'AVAILABLE_OFFICE_HOURS',
    officeHours: [],
    gradingQueueOrder: 'OLDEST_FIRST',
    pendingGradingReminder: 'AFTER_24_HOURS',
    preferredLearnerContact: 'ASSIGNED_COURSE_DISCUSSIONS',
    expectedResponseTime: 'WITHIN_1_BUSINESS_DAY',
    showOfficeHoursToLearners: true,
    followUpOnUnansweredDiscussions: true,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (serverPrefs) {
      setPrefs({
        timezone: serverPrefs.timezone || 'Asia/Kolkata',
        availabilityStatus:
          serverPrefs.availabilityStatus || 'AVAILABLE_OFFICE_HOURS',
        officeHours: (serverPrefs.officeHours || []).map((oh) => ({
          id: oh.id,
          day: oh.day,
          startTime: oh.startTime,
          endTime: oh.endTime,
          meetingFormat:
            oh.meetingFormat ||
            (oh.format === 'in_person'
              ? 'IN_PERSON'
              : 'ONLINE_BY_APPOINTMENT'),
        })),
        gradingQueueOrder: serverPrefs.gradingQueueOrder || 'OLDEST_FIRST',
        pendingGradingReminder:
          serverPrefs.pendingGradingReminder || 'AFTER_24_HOURS',
        preferredLearnerContact:
          serverPrefs.preferredLearnerContact || 'ASSIGNED_COURSE_DISCUSSIONS',
        expectedResponseTime:
          serverPrefs.expectedResponseTime || 'WITHIN_1_BUSINESS_DAY',
        showOfficeHoursToLearners: serverPrefs.showOfficeHoursToLearners ?? true,
        followUpOnUnansweredDiscussions:
          serverPrefs.followUpOnUnansweredDiscussions ??
          serverPrefs.remindUnansweredDiscussions ??
          true,
      });
      setIsDirty(false);
    }
  }, [serverPrefs]);

  const handleSave = () => {
    const payload: TeachingPreferences = {
      timezone: prefs.timezone,
      availabilityStatus: prefs.availabilityStatus,
      officeHours: prefs.officeHours.map((oh) => ({
        id: oh.id,
        day: oh.day,
        startTime: oh.startTime,
        endTime: oh.endTime,
        meetingFormat: oh.meetingFormat,
      })),
      gradingQueueOrder: prefs.gradingQueueOrder,
      pendingGradingReminder: prefs.pendingGradingReminder,
      preferredLearnerContact: prefs.preferredLearnerContact,
      expectedResponseTime: prefs.expectedResponseTime,
      showOfficeHoursToLearners: Boolean(prefs.showOfficeHoursToLearners),
      followUpOnUnansweredDiscussions: Boolean(
        prefs.followUpOnUnansweredDiscussions,
      ),
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        setIsDirty(false);
      },
    });
  };

  const handleCancel = () => {
    if (serverPrefs) {
      setPrefs({
        timezone: serverPrefs.timezone || 'Asia/Kolkata',
        availabilityStatus:
          serverPrefs.availabilityStatus || 'AVAILABLE_OFFICE_HOURS',
        officeHours: (serverPrefs.officeHours || []).map((oh) => ({
          id: oh.id,
          day: oh.day,
          startTime: oh.startTime,
          endTime: oh.endTime,
          meetingFormat:
            oh.meetingFormat ||
            (oh.format === 'in_person'
              ? 'IN_PERSON'
              : 'ONLINE_BY_APPOINTMENT'),
        })),
        gradingQueueOrder: serverPrefs.gradingQueueOrder || 'OLDEST_FIRST',
        pendingGradingReminder:
          serverPrefs.pendingGradingReminder || 'AFTER_24_HOURS',
        preferredLearnerContact:
          serverPrefs.preferredLearnerContact || 'ASSIGNED_COURSE_DISCUSSIONS',
        expectedResponseTime:
          serverPrefs.expectedResponseTime || 'WITHIN_1_BUSINESS_DAY',
        showOfficeHoursToLearners: serverPrefs.showOfficeHoursToLearners ?? true,
        followUpOnUnansweredDiscussions:
          serverPrefs.followUpOnUnansweredDiscussions ??
          serverPrefs.remindUnansweredDiscussions ??
          true,
      });
    }
    setIsDirty(false);
  };

  const handleOfficeHoursChange = (updated: OfficeHourItem[]) => {
    setPrefs((prev) => ({
      ...prev,
      officeHours: updated,
    }));
    setIsDirty(true);
  };

  return (
    <ProfileSettingsLayout
      title="Teaching Preferences"
      description="Set your personal teaching schedule and defaults within assigned courses."
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={updateMutation.isPending}
      isDirty={isDirty}
    >
      <div className="space-y-6">
        {/* Timezone & office hours */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Timezone & office hours
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Availability is displayed to assigned learners in their local time.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Personal timezone
              </label>
              <select
                value={prefs.timezone}
                onChange={(e) => {
                  setPrefs((prev) => ({ ...prev, timezone: e.target.value }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Availability status
              </label>
              <select
                value={prefs.availabilityStatus}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    availabilityStatus: e.target.value as AvailabilityStatus,
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                <option value="AVAILABLE_OFFICE_HOURS">
                  Available during office hours
                </option>
                <option value="AVAILABLE_ANYTIME">Available anytime</option>
                <option value="AWAY">Away</option>
                <option value="DO_NOT_DISTURB">Do not disturb</option>
              </select>
            </div>
          </div>

          {/* Office hours table */}
          <div className="mt-6">
            <OfficeHoursTable
              officeHours={prefs.officeHours}
              onChange={handleOfficeHoursChange}
              disabled={updateMutation.isPending}
            />
          </div>
        </div>

        {/* Grading & communication defaults */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Grading & communication defaults
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Personal workflow preferences; course deadlines and academy policies stay unchanged.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Grading queue order
              </label>
              <select
                value={prefs.gradingQueueOrder}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    gradingQueueOrder: e.target.value as GradingQueueOrder,
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                <option value="OLDEST_FIRST">Oldest submissions first</option>
                <option value="NEWEST_FIRST">Newest submissions first</option>
                <option value="BY_DUE_DATE">Due date first</option>
                <option value="BY_COURSE">By course</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Pending grading reminder
              </label>
              <select
                value={prefs.pendingGradingReminder}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    pendingGradingReminder: e.target
                      .value as PendingGradingReminder,
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                <option value="AFTER_12_HOURS">After 12 hours</option>
                <option value="AFTER_24_HOURS">After 24 hours</option>
                <option value="AFTER_48_HOURS">After 48 hours</option>
                <option value="OFF">Off</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Requires personal grading reminders to be enabled.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Preferred learner contact
              </label>
              <select
                value={prefs.preferredLearnerContact}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    preferredLearnerContact: e.target
                      .value as PreferredLearnerContact,
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                <option value="ASSIGNED_COURSE_DISCUSSIONS">
                  Assigned-course discussions
                </option>
                <option value="EMAIL">Email</option>
                <option value="OFFICE_HOURS_ONLY">Office hours only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Expected response time
              </label>
              <select
                value={prefs.expectedResponseTime}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    expectedResponseTime: e.target
                      .value as ExpectedResponseTime,
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                <option value="SAME_DAY">Same day</option>
                <option value="WITHIN_1_BUSINESS_DAY">
                  Within 1 business day
                </option>
                <option value="WITHIN_2_BUSINESS_DAYS">
                  Within 2 business days
                </option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100 pt-2">
            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">
                  Show office hours to assigned learners
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Display your availability in the instructor profile inside assigned courses.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.showOfficeHoursToLearners}
                onClick={() => {
                  setPrefs((prev) => ({
                    ...prev,
                    showOfficeHoursToLearners: !prev.showOfficeHoursToLearners,
                  }));
                  setIsDirty(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.showOfficeHoursToLearners
                    ? 'bg-[#0C5A69]'
                    : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefs.showOfficeHoursToLearners
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3.5">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">
                  Remind me to follow up on unanswered discussions
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Send a personal reminder after 24 hours in my assigned courses.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.followUpOnUnansweredDiscussions}
                onClick={() => {
                  setPrefs((prev) => ({
                    ...prev,
                    followUpOnUnansweredDiscussions:
                      !prev.followUpOnUnansweredDiscussions,
                  }));
                  setIsDirty(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.followUpOnUnansweredDiscussions
                    ? 'bg-[#0C5A69]'
                    : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefs.followUpOnUnansweredDiscussions
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProfileSettingsLayout>
  );
}
