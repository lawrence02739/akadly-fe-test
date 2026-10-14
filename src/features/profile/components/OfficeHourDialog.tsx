import { useState } from 'react';
import toast from 'react-hot-toast';
import { Weekday } from '../../instructors/types/instructor.types';
import type { MeetingFormat, OfficeHourItem } from '../types/profile.types';

interface OfficeHourDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: OfficeHourItem) => void;
  existingHours: OfficeHourItem[];
  editingItem?: OfficeHourItem | null;
}

const WEEKDAY_LABELS: Record<Weekday, string> = {
  [Weekday.MON]: 'Monday',
  [Weekday.TUE]: 'Tuesday',
  [Weekday.WED]: 'Wednesday',
  [Weekday.THU]: 'Thursday',
  [Weekday.FRI]: 'Friday',
  [Weekday.SAT]: 'Saturday',
  [Weekday.SUN]: 'Sunday',
};

export default function OfficeHourDialog({
  isOpen,
  onClose,
  onSave,
  existingHours,
  editingItem,
}: OfficeHourDialogProps) {
  const [day, setDay] = useState<Weekday>(editingItem?.day || Weekday.TUE);
  const [startTime, setStartTime] = useState(editingItem?.startTime || '16:00');
  const [endTime, setEndTime] = useState(editingItem?.endTime || '17:00');
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>(
    editingItem?.meetingFormat ||
      (editingItem?.format === 'in_person'
        ? 'IN_PERSON'
        : 'ONLINE_BY_APPOINTMENT'),
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startTime || !endTime) {
      toast.error('Start time and end time are required');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    // Overlap validation
    const hasOverlap = existingHours.some((h) => {
      if (editingItem && h.id === editingItem.id) return false;
      if (h.day !== day) return false;
      return startTime < h.endTime && endTime > h.startTime;
    });

    if (hasOverlap) {
      toast.error(`There is already an overlapping office hour on ${WEEKDAY_LABELS[day]}`);
      return;
    }

    onSave({
      id: editingItem?.id,
      day,
      startTime,
      endTime,
      meetingFormat,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">
          {editingItem ? 'Edit office hours' : 'Add office hours'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Set regular availability for student discussions and appointments.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as Weekday)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            >
              {Object.entries(WEEKDAY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                End time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Meeting format
            </label>
            <select
              value={meetingFormat}
              onChange={(e) =>
                setMeetingFormat(e.target.value as MeetingFormat)
              }
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            >
              <option value="ONLINE_BY_APPOINTMENT">
                Online · By appointment
              </option>
              <option value="ONLINE_DROP_IN">Online · Drop-in</option>
              <option value="IN_PERSON">In person · On campus</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a4854]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
