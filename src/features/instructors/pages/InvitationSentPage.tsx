import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetInstructor,
  useSendInstructorInvitation,
} from '../hooks/useInstructors';
import { StatusBadge } from '../components/StatusBadge';
import {
  INSTRUCTOR_TYPE_LABELS,
  formatEngagementSubline,
  formatIstDate,
} from '../utils/format';

export const InvitationSentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: instructor, isLoading } = useGetInstructor(id);
  const sendInviteMutation = useSendInstructorInvitation();

  // 60-second resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (!id || cooldown > 0) return;
    try {
      await sendInviteMutation.mutateAsync(id);
      toast.success('Invitation email resent successfully.');
      setCooldown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend invitation.');
    }
  };

  if (isLoading || !instructor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#0C5A69]" />
      </div>
    );
  }

  const displayName = instructor.fullName || instructor.name || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  const typeLabel = INSTRUCTOR_TYPE_LABELS[instructor.instructorType];
  const engagementSubline = formatEngagementSubline(
    instructor.instructorType,
    instructor.engagement,
    instructor.engagementState,
  );

  const initialAssignment = instructor.assignments?.[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-[#0C5A69]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {typeLabel} Invitation Sent
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Invitation dispatched to <span className="font-semibold text-slate-800">{instructor.email}</span>. Platform access is pending email verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/partner/instructors/${instructor.id}`)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0C5A69] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#094753]"
        >
          View Instructor <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Invitation Status Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Invitation Details
            </h3>

            {instructor.invitation?.deliveryStatus === 'FAILED' && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>
                  Email could not be delivered due to mail service error. Please click Resend below.
                </span>
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-xs text-slate-400">Recipient Email</span>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {instructor.email}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400">Sent On</span>
                <p className="mt-0.5 font-medium text-slate-800">
                  {instructor.invitation?.sentAt
                    ? formatIstDate(instructor.invitation.sentAt)
                    : 'Just now'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400">Link Expiry</span>
                <p className="mt-0.5 flex items-center gap-1 font-medium text-slate-800">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  {instructor.invitation?.expiresAt
                    ? formatIstDate(instructor.invitation.expiresAt)
                    : '7 days from issuance'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400">Account Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={instructor.status} />
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Engagement Window</span>
                <p className="mt-0.5 font-medium text-slate-800">
                  {engagementSubline}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400">Access Scope</span>
                <p className="mt-0.5 font-medium text-teal-800">
                  Assigned cohorts & courses only
                </p>
              </div>
            </div>
          </div>

          {/* Assignment Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Initial Assignment Summary
            </h3>

            {initialAssignment ? (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-[#0C5A69]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {initialAssignment.courseTitle}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Cohort:{' '}
                      <span className="font-medium text-slate-700">
                        {initialAssignment.batchName}
                      </span>{' '}
                      · Role:{' '}
                      <span className="font-medium text-teal-800">
                        {initialAssignment.teachingRole}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400 italic">
                No initial cohort assigned. Cohorts can be assigned anytime from the instructor's details page.
              </p>
            )}
          </div>

          {/* Activation Next Steps Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Activation Next Steps
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Instructor opens invitation link
                  </h4>
                  <p className="text-xs text-slate-500">
                    The instructor clicks the secure verification link sent to their inbox.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Sets password & completes identity verification
                  </h4>
                  <p className="text-xs text-slate-500">
                    Account status automatically flips from Invited to Active upon successful setup.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-900">
                  3
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Enters portal with assigned scope
                  </h4>
                  <p className="text-xs text-slate-500">
                    Instructor logs in using their credentials and interacts with designated courses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Mini Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C5A69] font-bold text-white">
                {initials}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {displayName}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {instructor.instructorCode}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 text-xs space-y-1.5 text-slate-600">
              <p>
                <span className="text-slate-400">Specialty:</span>{' '}
                {instructor.specialty}
              </p>
              {instructor.phone && (
                <p>
                  <span className="text-slate-400">Phone:</span>{' '}
                  {instructor.phone}
                </p>
              )}
              {instructor.expertise && instructor.expertise.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {instructor.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Permissions Read-only Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900">
              <ShieldCheck className="h-4 w-4 text-[#0C5A69]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">
                Assigned Permissions
              </h4>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Course & Curriculum Read</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Calendar & Schedule View</span>
              </div>
              {instructor.permissionFlags?.editCourseContent && (
                <div className="flex items-center gap-2 text-teal-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Edit Curriculum Content</span>
                </div>
              )}
              {instructor.permissionFlags?.gradeAssessments && (
                <div className="flex items-center gap-2 text-teal-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Grade Assessments & Tests</span>
                </div>
              )}
              {instructor.permissionFlags?.communicateWithLearners && (
                <div className="flex items-center gap-2 text-teal-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Communicate with Learners</span>
                </div>
              )}
            </div>
          </div>

          {/* Resend Card with Cooldown */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <Mail className="h-4 w-4 text-amber-700" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">
                Resend Invitation
              </h4>
            </div>
            <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
              Generate and email a new 7-day invitation link. The previous link will be invalidated.
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={sendInviteMutation.isPending || cooldown > 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  sendInviteMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : sendInviteMutation.isPending
                  ? 'Sending...'
                  : 'Resend Invitation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvitationSentPage;
