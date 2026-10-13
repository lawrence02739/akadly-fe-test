import React, { useState } from 'react';
import { Plus, Trash2, ShieldCheck, BookOpen, Users, Save, X } from 'lucide-react';
import type {
  InstructorPermissionFlags,
  InstructorView,
} from '../../types/instructor.types';
import { TeachingRole } from '../../types/instructor.types';
import api from '../../../../shared/api/axios';

interface CoursesAccessTabProps {
  instructor: InstructorView;
  onAddAssignment: (dto: {
    courseId: string;
    batchId: string;
    teachingRole: TeachingRole;
  }) => Promise<void>;
  onRemoveAssignment: (assignmentId: string) => Promise<void>;
  onUpdatePermissions: (dto: InstructorPermissionFlags) => Promise<void>;
  isUpdatingPermissions?: boolean;
}

export const CoursesAccessTab: React.FC<CoursesAccessTabProps> = ({
  instructor,
  onAddAssignment,
  onRemoveAssignment,
  onUpdatePermissions,
  isUpdatingPermissions = false,
}) => {
  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [batches, setBatches] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeachingRole>(TeachingRole.LEAD);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Permission Flags State
  const [flags, setFlags] = useState<InstructorPermissionFlags>({
    editCourseContent: instructor.permissionFlags.editCourseContent,
    gradeAssessments: instructor.permissionFlags.gradeAssessments,
    communicateWithLearners: instructor.permissionFlags.communicateWithLearners,
  });
  const [permissionSuccess, setPermissionSuccess] = useState(false);

  // Load courses when modal opens
  const handleOpenAssignModal = () => {
    setIsAssignModalOpen(true);
    setAssignError(null);
    setSelectedCourseId('');
    setSelectedBatchId('');
    api.get('/courses').then((res) => {
      const list = res.data?.data?.courses || res.data?.courses || res.data?.data || res.data || [];
      const formatted = Array.isArray(list)
        ? list.map((c: any) => ({ id: c.id || c._id, title: c.title }))
        : [];
      setCourses(formatted);
    });
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedBatchId('');
    if (!courseId) {
      setBatches([]);
      return;
    }
    api.get('/batches', { params: { courseId } }).then((res) => {
      const list = res.data?.data?.batches || res.data?.batches || res.data?.data || res.data || [];
      const formatted = Array.isArray(list)
        ? list.map((b: any) => ({ id: b.id || b._id, name: b.name }))
        : [];
      setBatches(formatted);
    });
  };

  const handleConfirmAssignment = async () => {
    if (!selectedCourseId || !selectedBatchId) {
      setAssignError('Please select both a course and a cohort.');
      return;
    }
    try {
      setIsAssigning(true);
      setAssignError(null);
      await onAddAssignment({
        courseId: selectedCourseId,
        batchId: selectedBatchId,
        teachingRole: selectedRole,
      });
      setIsAssignModalOpen(false);
    } catch (err: any) {
      setAssignError(err.response?.data?.message || 'Failed to assign cohort.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await onUpdatePermissions(flags);
      setPermissionSuccess(true);
      setTimeout(() => setPermissionSuccess(false), 3000);
    } catch {
      // Handled by toast in page
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Assigned Cohorts Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Assigned Courses & Cohorts
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Instructors only receive teaching permissions for students within these assigned cohorts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAssignModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C5A69] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#094753]"
          >
            <Plus className="h-4 w-4" />
            Assign Cohort
          </button>
        </div>

        {/* Assignments Table */}
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Course Title</th>
                <th className="px-4 py-3">Cohort / Batch</th>
                <th className="px-4 py-3">Teaching Role</th>
                <th className="px-4 py-3">Enrolled Learners</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instructor.assignments && instructor.assignments.length > 0 ? (
                instructor.assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#0C5A69]" />
                        {assignment.courseTitle}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {assignment.batchName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 border border-teal-100">
                        {assignment.teachingRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {assignment.learnersCount ?? '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveAssignment(assignment.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Remove cohort assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No courses or cohorts assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0C5A69]" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Functional Access & Permissions
              </h3>
              <p className="text-xs text-slate-500">
                Configure what this instructor can do across assigned cohorts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissionSuccess && (
              <span className="text-xs font-medium text-emerald-600">
                Permissions saved!
              </span>
            )}
            <button
              type="button"
              onClick={handleSavePermissions}
              disabled={isUpdatingPermissions}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C5A69] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#094753] disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {isUpdatingPermissions ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Edit course content */}
          <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Edit Course Content
              </span>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Add, organize and edit curriculum lessons, sections and resources.
              </p>
            </div>
            <input
              type="checkbox"
              checked={flags.editCourseContent}
              onChange={(e) =>
                setFlags({ ...flags, editCourseContent: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69] mt-1"
            />
          </div>

          {/* Grade assessments */}
          <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Grade Assessments
              </span>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Review submitted assignments, grade tests and leave feedback.
              </p>
            </div>
            <input
              type="checkbox"
              checked={flags.gradeAssessments}
              onChange={(e) =>
                setFlags({ ...flags, gradeAssessments: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69] mt-1"
            />
          </div>

          {/* Communicate with learners */}
          <div className="flex items-start justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Communicate with Learners
              </span>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Answer lesson Q&A discussions and send course announcements.
              </p>
            </div>
            <input
              type="checkbox"
              checked={flags.communicateWithLearners}
              onChange={(e) =>
                setFlags({ ...flags, communicateWithLearners: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69] mt-1"
            />
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Assign Course & Cohort
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700">Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700">Cohort / Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  disabled={!selectedCourseId}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
                >
                  <option value="">
                    {!selectedCourseId
                      ? 'Select course first'
                      : batches.length === 0
                        ? 'No cohorts available'
                        : 'Select cohort'}
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700">Teaching Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as TeachingRole)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
                >
                  <option value={TeachingRole.LEAD}>Lead Instructor</option>
                  <option value={TeachingRole.CO}>Co-Instructor</option>
                </select>
              </div>

              {assignError && (
                <p className="text-xs text-rose-500">{assignError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isAssigning}
                className="rounded-lg bg-[#0C5A69] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#094753] disabled:opacity-50"
              >
                {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
