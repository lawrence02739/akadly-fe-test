import React from 'react';
import { Briefcase, Clock, Calendar, UserCheck } from 'lucide-react';
import { InstructorType } from '../../types/instructor.types';

interface InstructorTypeSelectorProps {
  selectedType: InstructorType;
  onSelectType: (type: InstructorType) => void;
  disabled?: boolean;
}

const TYPE_CONFIG = [
  {
    type: InstructorType.FULL_TIME,
    title: 'Full-time',
    hint: 'Start date only',
    description: 'Permanent instructor with ongoing teaching responsibilities.',
    icon: Briefcase,
  },
  {
    type: InstructorType.PART_TIME,
    title: 'Part-time',
    hint: 'Start + weekly availability',
    description: 'Scheduled weekly hours and recurring availability slots.',
    icon: Clock,
  },
  {
    type: InstructorType.CONTRACT_BASED,
    title: 'Contract-based',
    hint: 'Start + end date',
    description: 'Fixed term contract with renewal review milestones.',
    icon: Calendar,
  },
  {
    type: InstructorType.GUEST,
    title: 'Guest',
    hint: 'Time-limited engagement',
    description: 'Temporary access for visiting lectures, workshops or bootcamps.',
    icon: UserCheck,
  },
];

export const InstructorTypeSelector: React.FC<InstructorTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  disabled = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Instructor Type <span className="text-rose-500">*</span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select the employment model for scheduling and system access.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TYPE_CONFIG.map(({ type, title, hint, description, icon: Icon }) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              disabled={disabled}
              onClick={() => onSelectType(type)}
              className={`relative flex flex-col rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-[#0C5A69] bg-teal-50/40 ring-1 ring-[#0C5A69]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isSelected
                      ? 'bg-[#0C5A69] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                    isSelected
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {hint}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
