import { Lock } from 'lucide-react';
import type { InstructorSelfProfile } from '../types/profile.types';

interface ManagedAccessCardProps {
  profile: InstructorSelfProfile;
}

export default function ManagedAccessCard({ profile }: ManagedAccessCardProps) {
  const managed = profile.managed;
  const academyName = managed?.academyName || 'Akadly Academy';
  const roleName = managed?.roleName || 'Instructor';
  const totalAssigned =
    (managed?.assignedCoursesCount || 0) + (managed?.assignedCohortsCount || 0);
  const scopeText = `${totalAssigned} assigned courses / cohorts`;

  // Permission summary from flags
  const flags = managed?.permissionFlags;
  const permissionParts: string[] = [];
  if (flags?.gradeAssessments) {
    permissionParts.push('Grade assessments');
  }
  if (flags?.communicateWithLearners) {
    permissionParts.push('communicate with assigned learners');
  }
  if (flags?.editCourseContent) {
    permissionParts.push('edit course content');
  }

  const permissionSummary =
    permissionParts.length > 0
      ? `${permissionParts.join(' and ')}. No billing, tenant administration, staff management or publishing rights.`
      : 'Standard teaching permissions. Contact academy administrator for modifications.';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Academy-managed access
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Read-only. Contact your academy admin to change role or course access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Academy */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Academy
          </label>
          <div className="relative mt-1.5 flex items-center">
            <input
              type="text"
              readOnly
              value={academyName}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-sm text-slate-700 select-none cursor-default"
            />
            <Lock className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Role
          </label>
          <div className="relative mt-1.5 flex items-center">
            <input
              type="text"
              readOnly
              value={roleName}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-sm text-slate-700 select-none cursor-default"
            />
            <Lock className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Access scope */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Access scope
          </label>
          <div className="relative mt-1.5 flex items-center">
            <input
              type="text"
              readOnly
              value={scopeText}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 pr-9 text-sm text-slate-700 select-none cursor-default"
            />
            <Lock className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        {permissionSummary}
      </p>
    </div>
  );
}
