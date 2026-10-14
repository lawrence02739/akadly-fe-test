import React from 'react';
import { Mail, Edit2, PauseCircle, PlayCircle, Trash2, RefreshCw } from 'lucide-react';
import type { InstructorView } from '../../types/instructor.types';
import { StatusBadge } from '../StatusBadge';
import {
  INSTRUCTOR_TYPE_LABELS,
  formatEngagementSubline,
} from '../../utils/format';

interface ProfileHeaderProps {
  instructor: InstructorView;
  onEdit: () => void;
  onResendInvitation: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onRemoveRole?: () => void;
  isActionLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  instructor,
  onEdit,
  onResendInvitation,
  onToggleStatus,
  onDelete,
  onRemoveRole,
  isActionLoading = false,
}) => {
  const displayName = instructor.fullName || instructor.name || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  const engagementSubline = formatEngagementSubline(
    instructor.instructorType,
    instructor.engagement,
    instructor.engagementState,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Avatar + Details */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0C5A69] text-xl font-bold text-white shadow-xs">
            {initials || 'IN'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">
                {displayName}
              </h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                {instructor.instructorCode}
              </span>
              <StatusBadge status={instructor.status} />
            </div>

            <p className="text-sm font-medium text-slate-600">
              {INSTRUCTOR_TYPE_LABELS[instructor.instructorType]} Instructor ·{' '}
              <span className="text-slate-800">{instructor.specialty}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {instructor.email}
              </span>
              <span>•</span>
              <span>{engagementSubline}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {instructor.status === 'invited' && (
            <button
              type="button"
              onClick={onResendInvitation}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
              Resend Invite
            </button>
          )}

          {instructor.status === 'active' && (
            <button
              type="button"
              onClick={onToggleStatus}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
            >
              <PauseCircle className="h-3.5 w-3.5" />
              Suspend
            </button>
          )}

          {instructor.status === 'suspended' && (
            <button
              type="button"
              onClick={onToggleStatus}
              disabled={isActionLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Re-activate
            </button>
          )}

          <button
            type="button"
            onClick={onEdit}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Profile
          </button>

          {onRemoveRole && (
            <button
              type="button"
              onClick={onRemoveRole}
              disabled={isActionLoading}
              title="Remove instructor role and convert back to standard user"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100/60 disabled:opacity-50"
            >
              Remove Role
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={isActionLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
