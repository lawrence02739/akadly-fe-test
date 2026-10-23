import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Video,
  Edit2,
  Trash2,
  Ban,
  ExternalLink,
  Shield,
} from 'lucide-react';
import type { LiveClassDetails } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDateFull, formatTimeRange } from '../utils/calendar.utils';

interface LiveClassDetailsDrawerProps {
  isOpen: boolean;
  liveClass?: LiveClassDetails | null;
  onClose: () => void;
  onEdit?: (liveClass: LiveClassDetails) => void;
  onCancel?: (liveClass: LiveClassDetails) => void;
  onDelete?: (liveClass: LiveClassDetails) => void;
}

export const LiveClassDetailsDrawer: React.FC<LiveClassDetailsDrawerProps> = ({
  isOpen,
  liveClass,
  onClose,
  onEdit,
  onCancel,
  onDelete,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen || !liveClass) return null;

  const handleCopyLink = () => {
    if (liveClass.meetingUrl) {
      void navigator.clipboard.writeText(liveClass.meetingUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status={liveClass.displayStatus} />
              <span className="text-xs text-slate-500 font-medium">
                Session #{liveClass.sequence}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {liveClass.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {liveClass.courseTitle} · {liveClass.batchName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Schedule details */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{formatDateFull(liveClass.startsAt, liveClass.timezone)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                {formatTimeRange(
                  liveClass.startsAt,
                  liveClass.endsAt,
                  liveClass.timezone,
                )}{' '}
                ({liveClass.durationMinutes} min · {liveClass.timezone})
              </span>
            </div>
          </div>

          {/* Instructor & Team */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Teaching Team
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-900">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>
                  Primary Instructor:{' '}
                  <strong>{liveClass.instructor?.name || 'Unassigned'}</strong>
                </span>
              </div>

              {liveClass.coInstructors.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-slate-700 pl-8">
                  <span className="text-xs text-slate-500 font-medium">Co-instructors:</span>
                  <div className="flex flex-wrap gap-1">
                    {liveClass.coInstructors.map((ci) => (
                      <span
                        key={ci.id}
                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                      >
                        {ci.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {liveClass.supportStaff && (
                <div className="flex items-center gap-2 text-sm text-slate-700 pl-8">
                  <span className="text-xs text-slate-500 font-medium">Support host:</span>
                  <span className="text-xs font-medium text-slate-800">
                    {liveClass.supportStaff.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Agenda */}
          {liveClass.agenda && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Agenda
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                {liveClass.agenda}
              </p>
            </div>
          )}

          {/* Attendance & Capacity */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Attendance & Capacity
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="text-xs text-slate-500">Capacity</div>
                <div className="text-base font-bold text-slate-900">
                  {liveClass.capacity}
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="text-xs text-slate-500">Enrolled</div>
                <div className="text-base font-bold text-slate-900">
                  {liveClass.enrolled}
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
                <div className="text-xs text-slate-500">Joined</div>
                <div className="text-base font-bold text-emerald-600">
                  {liveClass.joinedCount}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Student Controls</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className={`px-2 py-1 rounded-md border ${liveClass.studentPermissions.camera ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                Camera: {liveClass.studentPermissions.camera ? 'Enabled' : 'Disabled'}
              </span>
              <span className={`px-2 py-1 rounded-md border ${liveClass.studentPermissions.microphone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                Mic: {liveClass.studentPermissions.microphone ? 'Enabled' : 'Disabled'}
              </span>
              <span className={`px-2 py-1 rounded-md border ${liveClass.studentPermissions.screenShare ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                Screen Share: {liveClass.studentPermissions.screenShare ? 'Enabled' : 'Disabled'}
              </span>
              <span className={`px-2 py-1 rounded-md border ${liveClass.studentPermissions.chatAndReactions ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                Chat & Reactions: {liveClass.studentPermissions.chatAndReactions ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Meeting URL */}
          {liveClass.meetingUrl && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-indigo-900 truncate">
                  {liveClass.meetingUrl}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedUrl ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={liveClass.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-indigo-700 hover:text-indigo-900 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onCancel && liveClass.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => onCancel(liveClass)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(liveClass)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(liveClass)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit class</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
