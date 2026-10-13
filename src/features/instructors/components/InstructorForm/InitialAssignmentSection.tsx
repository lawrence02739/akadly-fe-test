import React, { useEffect, useState } from 'react';
import api from '../../../../shared/api/axios';
import { TeachingRole } from '../../types/instructor.types';

interface CourseOption {
  id?: string;
  _id?: string;
  title: string;
}

interface BatchOption {
  id?: string;
  _id?: string;
  name: string;
}

interface InitialAssignmentSectionProps {
  courseId: string;
  onChangeCourseId: (id: string) => void;
  batchId: string;
  onChangeBatchId: (id: string) => void;
  teachingRole: TeachingRole;
  onChangeTeachingRole: (role: TeachingRole) => void;
}

export const InitialAssignmentSection: React.FC<
  InitialAssignmentSectionProps
> = ({
  courseId,
  onChangeCourseId,
  batchId,
  onChangeBatchId,
  teachingRole,
  onChangeTeachingRole,
}) => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingCourses(true);
    api
      .get('/courses')
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data?.courses || res.data?.courses || res.data?.data || res.data || [];
        setCourses(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (isMounted) setCourses([]);
      })
      .finally(() => {
        if (isMounted) setLoadingCourses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!courseId) {
      setBatches([]);
      onChangeBatchId('');
      return;
    }

    let isMounted = true;
    setLoadingBatches(true);
    api
      .get('/batches', { params: { courseId } })
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data?.batches || res.data?.batches || res.data?.data || res.data || [];
        setBatches(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (isMounted) setBatches([]);
      })
      .finally(() => {
        if (isMounted) setLoadingBatches(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId, onChangeBatchId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Initial Cohort Assignment{' '}
            <span className="text-xs font-normal text-slate-400">
              (optional)
            </span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Assign the instructor to a course and cohort directly.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Course */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Course
          </label>
          <select
            value={courseId}
            onChange={(e) => onChangeCourseId(e.target.value)}
            disabled={loadingCourses}
            aria-label="Select course"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          >
            <option value="">None / Assign later</option>
            {courses.map((c) => {
              const cid = c.id || c._id || '';
              return (
                <option key={cid} value={cid}>
                  {c.title}
                </option>
              );
            })}
          </select>
        </div>

        {/* Batch / Cohort */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Cohort / Batch
          </label>
          <select
            value={batchId}
            onChange={(e) => onChangeBatchId(e.target.value)}
            disabled={!courseId || loadingBatches}
            aria-label="Select cohort or batch"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          >
            <option value="">
              {!courseId
                ? 'Select a course first'
                : batches.length === 0
                  ? 'No cohorts available'
                  : 'Select cohort'}
            </option>
            {batches.map((b) => {
              const bid = b.id || b._id || '';
              return (
                <option key={bid} value={bid}>
                  {b.name}
                </option>
              );
            })}
          </select>
        </div>

        {/* Teaching Role */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Teaching Role
          </label>
          <select
            value={teachingRole}
            onChange={(e) => onChangeTeachingRole(e.target.value as TeachingRole)}
            disabled={!batchId}
            aria-label="Select teaching role"
            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          >
            <option value={TeachingRole.LEAD}>Lead Instructor</option>
            <option value={TeachingRole.CO}>Co-Instructor</option>
          </select>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 italic">
        Assigned courses and cohort materials become accessible to the
        instructor after account activation.
      </p>
    </div>
  );
};
