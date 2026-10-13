import React from 'react';
import {
  BookOpen,
  Users,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
} from 'lucide-react';
import type { InstructorView } from '../../types/instructor.types';
import {
  INSTRUCTOR_TYPE_LABELS,
  formatIstDate,
  formatShortDate,
} from '../../utils/format';

interface OverviewTabProps {
  instructor: InstructorView;
  onNavigateToCourses: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  instructor,
  onNavigateToCourses,
}) => {
  const uniqueLearners = instructor.learnersCount || 0;
  const assignmentsCount = instructor.assignments?.length || 0;

  return (
    <div className="space-y-6">
      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Assigned Courses
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-[#0C5A69]">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {instructor.coursesCount}
            </span>
            <span className="text-xs text-slate-500">
              ({assignmentsCount} {assignmentsCount === 1 ? 'cohort' : 'cohorts'})
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Assigned Learners
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {uniqueLearners}
            </span>
            <span className="text-xs text-slate-500">unique students</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Instructor Rating
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-400">—</span>
            <span className="text-xs text-slate-400">No evaluations yet</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Contact & Expertise card (2 cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Contact & Expertise Details
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-xs text-slate-400">Email Verification</span>
              <p className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-800">
                {instructor.emailVerifiedAt ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Verified ({formatShortDate(instructor.emailVerifiedAt)})
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-amber-500" />
                    Unverified
                  </>
                )}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Phone Number</span>
              <p className="mt-0.5 font-medium text-slate-800">
                {instructor.phone || '—'}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Specialty</span>
              <p className="mt-0.5 font-medium text-slate-800">
                {instructor.specialty}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Employment Model</span>
              <p className="mt-0.5 font-medium text-slate-800">
                {INSTRUCTOR_TYPE_LABELS[instructor.instructorType]}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Profile Created</span>
              <p className="mt-0.5 font-medium text-slate-800">
                {formatIstDate(instructor.createdAt, false)}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Last Active</span>
              <p className="mt-0.5 font-medium text-slate-800">
                {instructor.lastActiveAt
                  ? formatIstDate(instructor.lastActiveAt)
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Expertise chips */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-400">Expertise Tags</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {instructor.expertise && instructor.expertise.length > 0 ? (
                instructor.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 border border-teal-100"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  No tags specified
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          {instructor.bio && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">Short Bio</span>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {instructor.bio}
              </p>
            </div>
          )}
        </div>

        {/* Right column: Assigned courses quick view */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Active Cohorts
            </h3>
            <button
              type="button"
              onClick={onNavigateToCourses}
              className="flex items-center gap-1 text-xs font-medium text-[#0C5A69] hover:underline"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {instructor.assignments && instructor.assignments.length > 0 ? (
              instructor.assignments.slice(0, 4).map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs"
                >
                  <p className="font-semibold text-slate-900 truncate">
                    {assignment.courseTitle}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-slate-500">
                    <span>{assignment.batchName}</span>
                    <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-800">
                      {assignment.teachingRole}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-center text-slate-400">
                <BookOpen className="h-6 w-6 stroke-1 text-slate-300 mb-1" />
                <p className="text-xs">No cohorts assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          Recent Activity
        </h3>
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center text-slate-400">
          <p className="text-sm font-medium text-slate-600">
            No recorded activity yet
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Activity logs such as grading, discussions, and submissions will appear here once active.
          </p>
        </div>
      </div>
    </div>
  );
};
