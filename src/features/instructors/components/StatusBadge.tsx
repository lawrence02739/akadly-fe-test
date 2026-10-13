import React from 'react';
import type { InstructorStatus } from '../types/instructor.types';
import { INSTRUCTOR_STATUS_LABELS } from '../utils/format';

interface StatusBadgeProps {
  status: InstructorStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'active':
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'invited':
      badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'suspended':
      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'disabled':
      badgeStyles = 'bg-gray-100 text-gray-500 border-gray-200';
      break;
    case 'draft':
      badgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'active'
            ? 'bg-emerald-500'
            : status === 'invited'
              ? 'bg-amber-500'
              : status === 'suspended'
                ? 'bg-rose-500'
                : 'bg-slate-400'
        }`}
      />
      {INSTRUCTOR_STATUS_LABELS[status] || status}
    </span>
  );
};
