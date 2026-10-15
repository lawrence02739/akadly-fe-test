import type { MediaStatus } from '../types';

interface Props {
  status: MediaStatus;
  className?: string;
}

export function MediaStatusBadge({ status, className = '' }: Props) {
  if (status === 'ACTIVE') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 ${className}`}
      >
        Active
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
    >
      Archived
    </span>
  );
}
