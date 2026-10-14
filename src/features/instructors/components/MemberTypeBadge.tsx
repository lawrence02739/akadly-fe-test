import { GraduationCap } from 'lucide-react';

interface MemberTypeBadgeProps {
  memberType?: 'user' | 'instructor' | string;
  className?: string;
}

export default function MemberTypeBadge({
  memberType,
  className = '',
}: MemberTypeBadgeProps) {
  if (memberType !== 'instructor') return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-[#0C5A69] ring-1 ring-inset ring-[#0C5A69]/20 ${className}`}
    >
      <GraduationCap className="h-3.5 w-3.5" />
      <span>Instructor</span>
    </span>
  );
}
