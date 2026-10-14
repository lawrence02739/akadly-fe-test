import { useEffect, useState } from 'react';
import ProfileSettingsLayout from '../components/ProfileSettingsLayout';
import {
  useInstructorSelfProfileQuery,
  useMyAuth,
  useNotificationPreferencesQuery,
  useTeachingPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../hooks/useProfile';
import type { NotificationPreferences } from '../types/profile.types';

export default function NotificationPreferencesPage() {
  const { data: authData } = useMyAuth();
  const { data: instructorProfile } = useInstructorSelfProfileQuery();
  const { data: teachingPrefs } = useTeachingPreferencesQuery();
  const { data: serverPrefs } = useNotificationPreferencesQuery();
  const updateMutation = useUpdateNotificationPreferencesMutation();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    assignedCourseDiscussions: true,
    liveSessionReminders: true,
    courseActivitySummaries: false,
    channels: {
      email: true,
      inApp: true,
    },
    digestFrequency: 'DAILY',
    digestTime: '18:00',
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (serverPrefs) {
      setPrefs({
        assignedCourseDiscussions:
          serverPrefs.assignedCourseDiscussions ?? true,
        liveSessionReminders: serverPrefs.liveSessionReminders ?? true,
        courseActivitySummaries:
          serverPrefs.courseActivitySummaries ?? false,
        channels: {
          email: serverPrefs.channels?.email ?? true,
          inApp: serverPrefs.channels?.inApp ?? true,
        },
        digestFrequency: serverPrefs.digestFrequency ?? 'DAILY',
        digestTime:
          serverPrefs.digestTime ||
          serverPrefs.digestDeliveryTime ||
          '18:00',
      });
      setIsDirty(false);
    }
  }, [serverPrefs]);

  const emailDisplay =
    instructorProfile?.email || authData?.email || 'your email';
  const timezoneDisplay = teachingPrefs?.timezone || 'Asia/Kolkata';

  const handleSave = () => {
    const payload: NotificationPreferences = {
      assignedCourseDiscussions: Boolean(prefs.assignedCourseDiscussions),
      liveSessionReminders: Boolean(prefs.liveSessionReminders),
      courseActivitySummaries: Boolean(prefs.courseActivitySummaries),
      channels: {
        email: Boolean(prefs.channels?.email),
        inApp: Boolean(prefs.channels?.inApp),
      },
      digestFrequency: prefs.digestFrequency,
      digestTime: prefs.digestTime || '18:00',
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
        assignedCourseDiscussions:
          serverPrefs.assignedCourseDiscussions ?? true,
        liveSessionReminders: serverPrefs.liveSessionReminders ?? true,
        courseActivitySummaries:
          serverPrefs.courseActivitySummaries ?? false,
        channels: {
          email: serverPrefs.channels?.email ?? true,
          inApp: serverPrefs.channels?.inApp ?? true,
        },
        digestFrequency: serverPrefs.digestFrequency ?? 'DAILY',
        digestTime:
          serverPrefs.digestTime ||
          serverPrefs.digestDeliveryTime ||
          '18:00',
      });
    }
    setIsDirty(false);
  };

  return (
    <ProfileSettingsLayout
      title="Notification Preferences"
      description="Choose the teaching reminders and updates you receive personally."
      onSave={handleSave}
      onCancel={handleCancel}
      isSaving={updateMutation.isPending}
      isDirty={isDirty}
    >
      <div className="space-y-6">
        {/* Teaching notifications card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Teaching notifications
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Only activity from your assigned courses and cohorts.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Assigned-course discussions */}
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Assigned-course discussions
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Notify me about new learner questions and replies in my courses.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.assignedCourseDiscussions}
                onClick={() => {
                  setPrefs((prev) => ({
                    ...prev,
                    assignedCourseDiscussions: !prev.assignedCourseDiscussions,
                  }));
                  setIsDirty(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.assignedCourseDiscussions
                    ? 'bg-[#0C5A69]'
                    : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefs.assignedCourseDiscussions
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Live-session reminders */}
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Live-session reminders
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Notify me 30 minutes before a scheduled teaching session.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.liveSessionReminders}
                onClick={() => {
                  setPrefs((prev) => ({
                    ...prev,
                    liveSessionReminders: !prev.liveSessionReminders,
                  }));
                  setIsDirty(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.liveSessionReminders
                    ? 'bg-[#0C5A69]'
                    : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefs.liveSessionReminders
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Course activity summaries */}
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Course activity summaries
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Include learning activity in my personal digest.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.courseActivitySummaries}
                onClick={() => {
                  setPrefs((prev) => ({
                    ...prev,
                    courseActivitySummaries: !prev.courseActivitySummaries,
                  }));
                  setIsDirty(true);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  prefs.courseActivitySummaries
                    ? 'bg-[#0C5A69]'
                    : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    prefs.courseActivitySummaries
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Channels & digest card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">
              Channels & digest
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Delivery preferences for optional teaching notifications.
            </p>
          </div>

          {/* Delivery Channels */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
              <input
                id="channelEmail"
                type="checkbox"
                checked={prefs.channels.email}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    channels: { ...prev.channels, email: e.target.checked },
                  }));
                  setIsDirty(true);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
              />
              <label htmlFor="channelEmail" className="cursor-pointer select-none">
                <span className="block text-xs font-semibold text-slate-800">
                  Email
                </span>
                <span className="block text-xs text-slate-500">
                  {emailDisplay}
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3.5">
              <input
                id="channelInApp"
                type="checkbox"
                checked={prefs.channels.inApp}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    channels: { ...prev.channels, inApp: e.target.checked },
                  }));
                  setIsDirty(true);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
              />
              <label htmlFor="channelInApp" className="cursor-pointer select-none">
                <span className="block text-xs font-semibold text-slate-800">
                  In-app
                </span>
                <span className="block text-xs text-slate-500">
                  Notification center in your teaching workspace
                </span>
              </label>
            </div>
          </div>

          {/* Digest settings */}
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Digest frequency
              </label>
              <select
                value={prefs.digestFrequency}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    digestFrequency: e.target.value as 'OFF' | 'DAILY' | 'WEEKLY',
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              >
                <option value="OFF">Off</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Immediate reminders are not delayed by the digest.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Digest delivery time
              </label>
              <select
                value={prefs.digestTime}
                disabled={prefs.digestFrequency === 'OFF'}
                onChange={(e) => {
                  setPrefs((prev) => ({
                    ...prev,
                    digestTime: e.target.value,
                  }));
                  setIsDirty(true);
                }}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="09:00">09:00 · {timezoneDisplay}</option>
                <option value="12:00">12:00 · {timezoneDisplay}</option>
                <option value="18:00">18:00 · {timezoneDisplay}</option>
                <option value="21:00">21:00 · {timezoneDisplay}</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Uses your personal teaching timezone.
              </p>
            </div>
          </div>
        </div>

        {/* Essential account notices */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Essential account notices
              </h2>
              <h3 className="mt-2 text-sm font-semibold text-slate-800">
                Security & account messages
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Sign-in alerts, password changes and essential account notices are always sent to your email.
              </p>
            </div>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Always on
            </span>
          </div>
        </div>
      </div>
    </ProfileSettingsLayout>
  );
}
