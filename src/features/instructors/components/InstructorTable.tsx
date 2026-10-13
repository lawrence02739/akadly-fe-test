import React, { useState } from 'react';
import { Eye, Mail, MoreVertical, RefreshCw, XCircle, PlayCircle, Edit2, PauseCircle, Trash2 } from 'lucide-react';
import type { InstructorListItem, PaginationMeta } from '../types/instructor.types';
import { StatusBadge } from './StatusBadge';
import { InstructorTypeBadge } from './InstructorTypeBadge';
import { formatEngagementSubline, formatIstDate } from '../utils/format';

interface InstructorTableProps {
  instructors: InstructorListItem[];
  isLoading: boolean;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onSendInvitation: (id: string) => void;
  onResendInvitation: (id: string) => void;
  onRevokeInvitation: (id: string) => void;
  onSetStatus: (id: string, status: 'active' | 'suspended') => void;
  onDelete: (instructor: InstructorListItem) => void;
}

export const InstructorTable: React.FC<InstructorTableProps> = ({
  instructors,
  isLoading,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onSendInvitation,
  onResendInvitation,
  onRevokeInvitation,
  onSetStatus,
  onDelete,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="animate-pulse divide-y divide-slate-100">
          <div className="h-12 bg-slate-50" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex h-16 items-center px-6">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="ml-8 h-4 w-24 rounded bg-slate-200" />
              <div className="ml-8 h-4 w-16 rounded bg-slate-200" />
              <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (instructors.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-12 text-center">
        <p className="text-base font-medium text-slate-900">No instructors found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search or filters, or add a new instructor.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-3.5">Instructor</th>
              <th className="px-4 py-3.5">Specialty</th>
              <th className="px-4 py-3.5">Courses</th>
              <th className="px-4 py-3.5">Learners</th>
              <th className="px-4 py-3.5">Last Active</th>
              <th className="px-4 py-3.5">Instructor Type</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instructors.map((item) => {
              const coursesText =
                item.status !== 'active' && item.coursesCount > 0
                  ? `${item.coursesCount} planned`
                  : item.coursesCount.toString();

              const learnersText =
                item.learnersCount > 0 ? item.learnersCount.toString() : '—';

              const lastActiveText = item.lastActiveAt
                ? formatIstDate(item.lastActiveAt)
                : 'Not activated';

              const subline = formatEngagementSubline(
                item.instructorType,
                item.engagement,
                item.engagementState,
              );

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Instructor name & code / email */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 hover:text-[#0C5A69] cursor-pointer" onClick={() => onView(item.id)}>
                          {item.fullName || item.name}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 font-mono">
                          {item.instructorCode}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{item.email}</span>
                    </div>
                  </td>

                  {/* Specialty */}
                  <td className="px-4 py-4 text-slate-800 font-medium">
                    {item.specialty}
                  </td>

                  {/* Courses */}
                  <td className="px-4 py-4 font-medium text-slate-700">
                    {coursesText}
                  </td>

                  {/* Learners */}
                  <td className="px-4 py-4 text-slate-600">
                    {learnersText}
                  </td>

                  {/* Last Active */}
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {lastActiveText}
                  </td>

                  {/* Type + Engagement subline */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      <div>
                        <InstructorTypeBadge type={item.instructorType} />
                      </div>
                      <span className="text-xs text-slate-500">
                        {subline}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View button */}
                      <button
                        type="button"
                        onClick={() => onView(item.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Send invitation (draft) */}
                      {item.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => onSendInvitation(item.id)}
                          className="rounded p-1.5 text-teal-600 hover:bg-teal-50"
                          title="Send invitation email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      )}

                      {/* Resend invitation (invited + expired) */}
                      {item.status === 'invited' && item.invitationState === 'EXPIRED' && (
                        <button
                          type="button"
                          onClick={() => onResendInvitation(item.id)}
                          className="rounded p-1.5 text-amber-600 hover:bg-amber-50"
                          title="Resend expired invitation"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}

                      {/* Revoke invitation (invited) */}
                      {item.status === 'invited' && (
                        <button
                          type="button"
                          onClick={() => onRevokeInvitation(item.id)}
                          className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                          title="Revoke invitation"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}

                      {/* Re-activate (suspended) */}
                      {item.status === 'suspended' && (
                        <button
                          type="button"
                          onClick={() => onSetStatus(item.id, 'active')}
                          className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                          title="Re-activate account"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </button>
                      )}

                      {/* Overflow menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(activeMenuId === item.id ? null : item.id)
                          }
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                            onMouseLeave={() => setActiveMenuId(null)}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEdit(item.id);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit Profile
                            </button>

                            {item.status === 'active' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onSetStatus(item.id, 'suspended');
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                              >
                                <PauseCircle className="h-3.5 w-3.5" />
                                Suspend Account
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDelete(item);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove Instructor
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
          <div>
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="rounded border border-slate-200 px-2.5 py-1 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="rounded border border-slate-200 px-2.5 py-1 font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
