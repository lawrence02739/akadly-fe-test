import React from 'react';
import { Users, Bell, Shield, Video } from 'lucide-react';
import type { StudentPermissions } from '../types';

interface AccessControlsSectionProps {
  capacity?: number;
  enrolled?: number;
  seatsAvailable?: number;
  reminderOffsets: number[];
  onReminderOffsetsChange: (offsets: number[]) => void;
  studentPermissions: StudentPermissions;
  onPermissionsChange: (perms: StudentPermissions) => void;
  meetingUrl?: string;
  onMeetingUrlChange: (url: string) => void;
}

const REMINDER_PRESETS = [
  { label: '15 minutes before', value: '15', offsets: [15] },
  { label: '1 hour before', value: '60', offsets: [60] },
  { label: '24 hours before', value: '1440', offsets: [1440] },
  {
    label: '24 hours + 15 minutes before',
    value: '1440,15',
    offsets: [1440, 15],
  },
];

export const AccessControlsSection: React.FC<AccessControlsSectionProps> = ({
  capacity = 0,
  enrolled = 0,
  seatsAvailable = 0,
  reminderOffsets,
  onReminderOffsetsChange,
  studentPermissions,
  onPermissionsChange,
  meetingUrl = '',
  onMeetingUrlChange,
}) => {
  const currentPresetValue = reminderOffsets.join(',');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider text-xs">
        Access & Class Controls
      </h3>

      {/* Batch Capacity Read-Only Pill */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">
            Batch Capacity
          </span>
        </div>
        <div className="text-xs font-bold text-slate-800">
          {capacity > 0 ? (
            <span>
              {capacity} Total · <span className="text-indigo-600">{enrolled} enrolled</span> · <span className="text-emerald-600">{seatsAvailable} seats left</span>
            </span>
          ) : (
            <span className="text-slate-400 font-normal">
              Select a batch to read capacity
            </span>
          )}
        </div>
      </div>

      {/* Meeting URL */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-slate-400" />
          <span>Meeting Link (Google Meet / Zoom)</span>
        </label>
        <input
          type="url"
          value={meetingUrl}
          onChange={(e) => onMeetingUrlChange(e.target.value)}
          placeholder="https://meet.google.com/abc-defg-hij"
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Reminder Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-slate-400" />
          <span>Student Notifications & Reminders</span>
        </label>
        <select
          value={currentPresetValue}
          onChange={(e) => {
            const found = REMINDER_PRESETS.find((p) => p.value === e.target.value);
            if (found) onReminderOffsetsChange(found.offsets);
          }}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          {REMINDER_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Student Controls Checkboxes */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Default Student Permissions</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={studentPermissions.camera}
              onChange={(e) =>
                onPermissionsChange({
                  ...studentPermissions,
                  camera: e.target.checked,
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Allow Camera</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={studentPermissions.microphone}
              onChange={(e) =>
                onPermissionsChange({
                  ...studentPermissions,
                  microphone: e.target.checked,
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Allow Microphone</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={studentPermissions.screenShare}
              onChange={(e) =>
                onPermissionsChange({
                  ...studentPermissions,
                  screenShare: e.target.checked,
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Allow Screen Share</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={studentPermissions.chatAndReactions}
              onChange={(e) =>
                onPermissionsChange({
                  ...studentPermissions,
                  chatAndReactions: e.target.checked,
                })
              }
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Allow Chat & Reactions</span>
          </label>
        </div>
      </div>
    </div>
  );
};
