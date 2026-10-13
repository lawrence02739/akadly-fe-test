import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface PermissionsCardProps {
  editCourseContent: boolean;
  onChangeEditCourseContent: (val: boolean) => void;
  gradeAssessments: boolean;
  onChangeGradeAssessments: (val: boolean) => void;
  communicateWithLearners: boolean;
  onChangeCommunicateWithLearners: (val: boolean) => void;
}

export const PermissionsCard: React.FC<PermissionsCardProps> = ({
  editCourseContent,
  onChangeEditCourseContent,
  gradeAssessments,
  onChangeGradeAssessments,
  communicateWithLearners,
  onChangeCommunicateWithLearners,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 text-slate-900">
        <ShieldCheck className="h-5 w-5 text-[#0C5A69]" />
        <h4 className="text-sm font-semibold">Instructor Permissions</h4>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Granular control for pedagogical responsibilities.
      </p>

      <div className="mt-4 space-y-3">
        {/* Edit course content */}
        <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editCourseContent}
            onChange={(e) => onChangeEditCourseContent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
          />
          <div>
            <span className="block text-xs font-semibold text-slate-800">
              Edit Course Content
            </span>
            <span className="block text-[11px] text-slate-500 leading-tight">
              Allows updating curriculum materials and uploading resources.
            </span>
          </div>
        </label>

        {/* Grade assessments */}
        <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={gradeAssessments}
            onChange={(e) => onChangeGradeAssessments(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
          />
          <div>
            <span className="block text-xs font-semibold text-slate-800">
              Grade Assessments
            </span>
            <span className="block text-[11px] text-slate-500 leading-tight">
              Evaluate assignments, view student quizzes and grade submissions.
            </span>
          </div>
        </label>

        {/* Communicate with learners */}
        <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={communicateWithLearners}
            onChange={(e) => onChangeCommunicateWithLearners(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
          />
          <div>
            <span className="block text-xs font-semibold text-slate-800">
              Communicate with Learners
            </span>
            <span className="block text-[11px] text-slate-500 leading-tight">
              Participate in lesson discussions and direct student messaging.
            </span>
          </div>
        </label>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500">
        <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <span>
          No billing, payments or tenant administration access. Course publishing remains strictly admin-controlled.
        </span>
      </div>
    </div>
  );
};
