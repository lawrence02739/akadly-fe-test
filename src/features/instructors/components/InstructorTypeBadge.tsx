import React from 'react';
import { InstructorType } from '../types/instructor.types';
import { INSTRUCTOR_TYPE_LABELS } from '../utils/format';

interface InstructorTypeBadgeProps {
  type: InstructorType;
  className?: string;
}

export const InstructorTypeBadge: React.FC<InstructorTypeBadgeProps> = ({
  type,
  className = '',
}) => {
  let badgeStyles = 'bg-teal-50 text-teal-700 border-teal-200';

  switch (type) {
    case InstructorType.FULL_TIME:
      badgeStyles = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case InstructorType.PART_TIME:
      badgeStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case InstructorType.CONTRACT_BASED:
      badgeStyles = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case InstructorType.GUEST:
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeStyles} ${className}`}
    >
      {INSTRUCTOR_TYPE_LABELS[type] || type}
    </span>
  );
};
