import React from 'react';
import { X, Mail, ShieldCheck, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import {
  InstructorType,
  TeachingRole,
  type WeeklySlot,
} from '../../types/instructor.types';
import { INSTRUCTOR_TYPE_LABELS, formatShortDate, sumWeeklySlotsHours } from '../../utils/format';

interface ReviewInvitationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend: () => void;
  isSubmitting: boolean;
  editMode?: boolean;
  formData: {
    name: string;
    email: string;
    phone?: string;
    specialty: string;
    expertise?: string[];
    bio?: string;
    instructorType: InstructorType;
    engagement: {
      startDate?: string | null;
      endDate?: string | null;
      requiredWeeklyHours?: number | null;
      weeklySchedule?: WeeklySlot[];
      timezone?: string;
      renewalNote?: string;
    };
    permissions: {
      editCourseContent: boolean;
      gradeAssessments: boolean;
      communicateWithLearners: boolean;
    };
    initialAssignment?: {
      courseId: string;
      batchId: string;
      teachingRole: TeachingRole;
    };
    sendInvitation: boolean;
    documents?: { title: string; fileUrl: string }[];
  };
}

export const ReviewInvitationDrawer: React.FC<ReviewInvitationDrawerProps> = ({
  isOpen,
  onClose,
  onConfirmSend,
  isSubmitting,
  editMode = false,
  formData,
}) => {
  if (!isOpen) return null;

  const {
    name,
    email,
    phone,
    specialty,
    instructorType,
    engagement,
    permissions,
    sendInvitation,
  } = formData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {editMode ? 'Review & Save Changes' : 'Review Instructor Details'}
            </h3>
            <p className="text-xs text-slate-500">
              {editMode
                ? 'Verify updated instructor details before saving.'
                : 'Step 2 of 3 — Verify profile, scope, and invitation settings before proceeding.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Identity summary */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Identity & Type
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400">Full Name</span>
                <p className="font-semibold text-slate-900">{name}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Email</span>
                <p className="font-semibold text-slate-900">{email}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Specialty</span>
                <p className="font-medium text-slate-800">{specialty}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Instructor Model</span>
                <p className="font-medium text-teal-800">
                  {INSTRUCTOR_TYPE_LABELS[instructorType]}
                </p>
              </div>
              {phone && (
                <div>
                  <span className="text-xs text-slate-400">Phone</span>
                  <p className="text-slate-700">{phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Engagement details */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-700" />
              Engagement Terms
            </h4>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {engagement.startDate && (
                <div>
                  <span className="text-xs text-slate-400">Start Date</span>
                  <p className="font-medium text-slate-800">
                    {formatShortDate(engagement.startDate)}
                  </p>
                </div>
              )}
              {engagement.endDate && (
                <div>
                  <span className="text-xs text-slate-400">End Date</span>
                  <p className="font-medium text-slate-800">
                    {formatShortDate(engagement.endDate)}
                  </p>
                </div>
              )}
              {instructorType === InstructorType.PART_TIME && (
                <div>
                  <span className="text-xs text-slate-400">Required Hours</span>
                  <p className="font-medium text-slate-800 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {engagement.requiredWeeklyHours} hrs/week (Scheduled:{' '}
                    {sumWeeklySlotsHours(engagement.weeklySchedule || []).toFixed(1)} hrs)
                  </p>
                </div>
              )}
              {instructorType === InstructorType.FULL_TIME && !engagement.startDate && (
                <div>
                  <span className="text-xs text-slate-400">Timeline</span>
                  <p className="font-medium text-slate-800">Ongoing engagement</p>
                </div>
              )}
            </div>
          </div>

          {/* Permissions summary */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              Assigned Permissions
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Course & Curriculum Read
              </span>
              <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                Schedule & Calendar View
              </span>
              {permissions.editCourseContent && (
                <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs text-teal-800 font-medium">
                  + Edit Curriculum & Uploads
                </span>
              )}
              {permissions.gradeAssessments && (
                <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs text-teal-800 font-medium">
                  + Grade Assignments & Tests
                </span>
              )}
              {permissions.communicateWithLearners && (
                <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs text-teal-800 font-medium">
                  + Learner Discussions & Messages
                </span>
              )}
            </div>
          </div>

          {/* Attached documents */}
          {formData.documents && formData.documents.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Attached Documents ({formData.documents.length})
              </h4>
              <div className="mt-3 space-y-1.5">
                {formData.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs rounded-md bg-white border border-slate-200 px-3 py-1.5"
                  >
                    <span className="font-medium text-slate-800 truncate">
                      {doc.title}
                    </span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:underline shrink-0 ml-2"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next steps notice */}
          {!editMode && (
            <div className="flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-xs text-teal-900">
              <Mail className="h-5 w-5 shrink-0 text-teal-700" />
              <div>
                <p className="font-semibold">
                  {sendInvitation
                    ? 'An email invitation link will be sent.'
                    : 'Profile will be saved as a Draft.'}
                </p>
                <p className="mt-0.5 text-teal-800">
                  {sendInvitation
                    ? 'The invitation is valid for 7 days. The instructor will set their password and verify their account before accessing assigned courses.'
                    : 'You can review or send the invitation at any time from the Instructors table.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmSend}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0C5A69] px-5 py-2 text-sm font-medium text-white hover:bg-[#094753] disabled:opacity-50"
          >
            {isSubmitting ? (
              'Processing...'
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {editMode
                  ? 'Save Changes'
                  : sendInvitation
                    ? 'Send Invitation'
                    : 'Save Profile'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
