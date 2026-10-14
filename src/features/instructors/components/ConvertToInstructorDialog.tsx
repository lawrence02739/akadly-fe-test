import { useState } from 'react';
import toast from 'react-hot-toast';
import { convertToInstructor } from '../api/instructors.api';
import { useListSpecialties } from '../hooks/useInstructors';
import {
  InstructorType,
  type WeeklySlot,
} from '../types/instructor.types';
import { EngagementSection } from './InstructorForm/EngagementSection';
import { InstructorTypeSelector } from './InstructorForm/InstructorTypeSelector';

const DEFAULT_SPECIALTIES = [
  'Backend development',
  'Frontend development',
  'Full stack development',
  'Mobile development',
  'UI/UX design',
  'Data science',
  'DevOps',
  'QA & testing',
  'Cloud computing',
  'Cybersecurity',
  'Artificial intelligence',
  'Product management',
];

interface ConvertToInstructorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  memberEmail: string;
  onSuccess: () => void;
}

export default function ConvertToInstructorDialog({
  isOpen,
  onClose,
  memberId,
  memberName,
  memberEmail,
  onSuccess,
}: ConvertToInstructorDialogProps) {
  const { data: serverSpecialties } = useListSpecialties();
  const availableSpecialties = Array.from(
    new Set([...(serverSpecialties || []), ...DEFAULT_SPECIALTIES]),
  ).sort();

  const [specialty, setSpecialty] = useState('Backend development');
  const [isCustomSpecialty, setIsCustomSpecialty] = useState(false);
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [instructorType, setInstructorType] = useState<InstructorType>(
    InstructorType.FULL_TIME,
  );
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState('');
  const [requiredWeeklyHours, setRequiredWeeklyHours] = useState<number | ''>(
    '',
  );
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySlot[]>([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [renewalNote, setRenewalNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!specialty.trim()) {
      toast.error('Specialty is required');
      return;
    }

    if (!startDate && instructorType !== InstructorType.GUEST) {
      toast.error('Start date is required');
      return;
    }

    if (
      (instructorType === InstructorType.CONTRACT_BASED ||
        instructorType === InstructorType.GUEST) &&
      !endDate
    ) {
      toast.error('End date is required for contract and guest instructors');
      return;
    }

    try {
      setLoading(true);
      await convertToInstructor({
        memberId,
        specialty: specialty.trim(),
        instructorType,
        engagement: {
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          requiredWeeklyHours:
            requiredWeeklyHours === '' ? null : Number(requiredWeeklyHours),
          weeklySchedule,
          timezone,
          renewalNote,
        },
      });

      toast.success(`${memberName} converted to instructor successfully`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to convert user to instructor';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Convert user to Instructor
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Converting <span className="font-semibold text-slate-700">{memberName}</span> ({memberEmail}). This will assign the Instructor role and enable teaching capabilities.
          </p>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Specialty Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Specialty <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={isCustomSpecialty ? '__custom__' : specialty}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomSpecialty(true);
                  setSpecialty(customSpecialty);
                } else {
                  setIsCustomSpecialty(false);
                  setSpecialty(e.target.value);
                }
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            >
              <option value="" disabled>
                Select a specialty
              </option>
              {availableSpecialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="__custom__">+ Other (type custom specialty)</option>
            </select>

            {isCustomSpecialty && (
              <input
                type="text"
                required
                value={customSpecialty}
                onChange={(e) => {
                  setCustomSpecialty(e.target.value);
                  setSpecialty(e.target.value);
                }}
                placeholder="Enter custom specialty (e.g. Machine Learning)"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
              />
            )}
          </div>

          {/* Instructor Type */}
          <InstructorTypeSelector
            selectedType={instructorType}
            onSelectType={setInstructorType}
            disabled={loading}
          />

          {/* Engagement */}
          <EngagementSection
            instructorType={instructorType}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            requiredWeeklyHours={requiredWeeklyHours}
            onChangeRequiredWeeklyHours={setRequiredWeeklyHours}
            weeklySchedule={weeklySchedule}
            onChangeWeeklySchedule={setWeeklySchedule}
            timezone={timezone}
            onChangeTimezone={setTimezone}
            renewalNote={renewalNote}
            onChangeRenewalNote={setRenewalNote}
            errors={{}}
          />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#0C5A69] px-5 py-2 text-sm font-medium text-white hover:bg-[#0a4854] disabled:opacity-50"
            >
              {loading ? 'Converting...' : 'Convert to Instructor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
