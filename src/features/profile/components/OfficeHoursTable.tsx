import { useState } from 'react';
import { Weekday } from '../../instructors/types/instructor.types';
import type { OfficeHourItem } from '../types/profile.types';
import OfficeHourDialog from './OfficeHourDialog';

interface OfficeHoursTableProps {
  officeHours: OfficeHourItem[];
  onChange: (updated: OfficeHourItem[]) => void;
  disabled?: boolean;
}

const WEEKDAY_NAMES: Record<Weekday, string> = {
  [Weekday.MON]: 'Monday',
  [Weekday.TUE]: 'Tuesday',
  [Weekday.WED]: 'Wednesday',
  [Weekday.THU]: 'Thursday',
  [Weekday.FRI]: 'Friday',
  [Weekday.SAT]: 'Saturday',
  [Weekday.SUN]: 'Sunday',
};

export default function OfficeHoursTable({
  officeHours,
  onChange,
  disabled = false,
}: OfficeHoursTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OfficeHourItem | null>(null);

  const handleSave = (item: OfficeHourItem) => {
    if (editingItem) {
      onChange(
        officeHours.map((h) =>
          (h.id && h.id === editingItem.id) || h === editingItem ? item : h,
        ),
      );
    } else {
      onChange([...officeHours, { ...item, id: crypto.randomUUID() }]);
    }
  };

  const handleRemove = (index: number) => {
    onChange(officeHours.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Day</th>
              <th className="px-4 py-3">Start time</th>
              <th className="px-4 py-3">End time</th>
              <th className="px-4 py-3">Meeting format</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {officeHours.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No office hours set yet.
                </td>
              </tr>
            ) : (
              officeHours.map((slot, idx) => (
                <tr key={slot.id || idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {WEEKDAY_NAMES[slot.day] || slot.day}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {slot.startTime}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {slot.endTime}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {slot.meetingFormat === 'IN_PERSON' || slot.format === 'in_person'
                      ? 'In person · On campus'
                      : slot.meetingFormat === 'ONLINE_DROP_IN'
                      ? 'Online · Drop-in'
                      : 'Online · By appointment'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setEditingItem(slot);
                        setDialogOpen(true);
                      }}
                      className="text-[#0C5A69] hover:underline disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <span className="mx-1 text-slate-300">·</span>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemove(idx)}
                      className="text-rose-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <button
          type="button"
          disabled={disabled || officeHours.length >= 14}
          onClick={() => {
            setEditingItem(null);
            setDialogOpen(true);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          + Add office hours
        </button>
      </div>

      <OfficeHourDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        existingHours={officeHours}
        editingItem={editingItem}
      />
    </div>
  );
}
