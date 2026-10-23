import React from 'react';
import { User, Users, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import type { PersonRef } from '../types';

interface InstructorAssignmentCardProps {
  instructor?: PersonRef | null;
  coInstructors?: PersonRef[];
  supportStaff?: PersonRef | null;
  instructorAvailable?: boolean;
  hasConflicts?: boolean;
}

export const InstructorAssignmentCard: React.FC<InstructorAssignmentCardProps> = ({
  instructor,
  coInstructors = [],
  supportStaff,
  instructorAvailable = true,
  hasConflicts = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Teaching Team
        </h4>
        {instructor ? (
          instructorAvailable && !hasConflicts ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              <span>Available</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <AlertCircle className="w-3 h-3" />
              <span>Has Conflicts</span>
            </span>
          )
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            Can be completed after creation
          </span>
        )}
      </div>

      <div className="space-y-2">
        {/* Primary Instructor */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-400">Primary Instructor</div>
            <div className="text-xs font-semibold text-slate-800 truncate">
              {instructor?.name || 'Unassigned (Draft mode)'}
            </div>
          </div>
        </div>

        {/* Co-instructors */}
        {coInstructors.length > 0 && (
          <div className="flex items-start gap-2.5 pl-0.5">
            <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs shrink-0">
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400">Co-instructors ({coInstructors.length})</div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {coInstructors.map((ci) => (
                  <span
                    key={ci.id}
                    className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    {ci.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Staff */}
        {supportStaff && (
          <div className="flex items-center gap-2.5 pl-0.5">
            <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-slate-400">Support Staff Host</div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {supportStaff.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
