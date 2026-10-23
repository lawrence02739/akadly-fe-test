import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  RepeatFrequency,
  SeriesEndType,
  Weekday,
  type RecurrenceRule,
  type StudentPermissions,
  type PersonRef,
  type LiveClassConflict,
  type CreateLiveClassPayload,
  type UpdateLiveClassPayload,
  UpdateScope,
} from '../types';
import {
  useCreateLiveClass,
  useUpdateLiveClass,
  usePreviewLiveClass,
  useLiveClassDetails,
} from '../hooks/useLiveClasses';
import { listCourses, getCourse, fetchCourseStructure } from '../../courses/api/courses.api';
import { listBatches, type BatchListItem } from '../../batches/api/batches.api';
import { useInstructors, useSupportStaff } from '../../courses/hooks/useMasterData';

import { ClassDetailsSection, type OptionItem, type NodeItem } from '../components/ClassDetailsSection';
import { RecurrenceFields } from '../components/RecurrenceFields';
import { AccessControlsSection } from '../components/AccessControlsSection';
import { InstructorAssignmentCard } from '../components/InstructorAssignmentCard';
import { GeneratedSeriesPanel } from '../components/GeneratedSeriesPanel';
import { ConflictsDrawer } from '../components/ConflictsDrawer';
import { ScopeDialog } from '../components/ScopeDialog';
import { generateLocalPreview } from '../utils/calendar.utils';

interface CourseStructureNode {
  id: string;
  title: string;
  type: string;
}

export const CreateLiveClass: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Form state
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [title, setTitle] = useState('');
  const [courseNodeId, setCourseNodeId] = useState<string | undefined>();
  const [agenda, setAgenda] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [coInstructorIds, setCoInstructorIds] = useState<string[]>([]);
  const [supportStaffId, setSupportStaffId] = useState('');

  // Date, time, recurrence
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [recurrence, setRecurrence] = useState<RecurrenceRule>(() => {
    const today = new Date();
    const dayMap: Record<number, Weekday> = {
      0: Weekday.SUN,
      1: Weekday.MON,
      2: Weekday.TUE,
      3: Weekday.WED,
      4: Weekday.THU,
      5: Weekday.FRI,
      6: Weekday.SAT,
    };
    return {
      frequency: RepeatFrequency.WEEKLY,
      interval: 1,
      daysOfWeek: [dayMap[today.getDay()]],
      endType: SeriesEndType.AFTER_COUNT,
      occurrences: 8,
    };
  });

  // Access controls
  const [reminderOffsets, setReminderOffsets] = useState<number[]>([1440, 15]);
  const [studentPermissions, setStudentPermissions] = useState<StudentPermissions>({
    camera: true,
    screenShare: false,
    microphone: true,
    chatAndReactions: true,
  });
  const [meetingUrl, setMeetingUrl] = useState('');

  // Track touched flags for pre-filling course people
  const touchedRef = useRef({
    instructor: false,
    coInstructors: false,
    supportStaff: false,
  });

  // Conflicts drawer & Scope dialog
  const [conflictsDrawerOpen, setConflictsDrawerOpen] = useState(false);
  const [blockingConflicts, setBlockingConflicts] = useState<LiveClassConflict[]>([]);
  const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    course?: string;
    batch?: string;
    title?: string;
    instructor?: string;
  }>({});

  // Queries
  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  });

  const { data: batchesData } = useQuery({
    queryKey: ['batches', { courseId }],
    queryFn: () => listBatches({ courseId, pageSize: 100 }),
    enabled: Boolean(courseId),
  });

  const { data: structureData } = useQuery({
    queryKey: ['course-structure', courseId],
    queryFn: () => fetchCourseStructure(courseId),
    enabled: Boolean(courseId),
  });

  const { data: instructorsList = [] } = useInstructors();
  const { data: supportStaffList = [] } = useSupportStaff();
  const { data: existingClassDetails, isLoading: isLoadingDetails } = useLiveClassDetails(id);

  // Mutations
  const createMutation = useCreateLiveClass();
  const updateMutation = useUpdateLiveClass();
  const previewMutation = usePreviewLiveClass();
  const mutatePreviewRef = useRef(previewMutation.mutate);
  useEffect(() => {
    mutatePreviewRef.current = previewMutation.mutate;
  }, [previewMutation.mutate]);

  // Populate data in edit mode
  useEffect(() => {
    if (isEditMode && existingClassDetails) {
      setCourseId(existingClassDetails.courseId);
      setBatchId(existingClassDetails.batchId);
      setTitle(existingClassDetails.title);
      setCourseNodeId(existingClassDetails.courseNodeId ?? undefined);
      setAgenda(existingClassDetails.agenda ?? '');
      setInstructorId(existingClassDetails.instructor?.id ?? '');
      setCoInstructorIds(existingClassDetails.coInstructors?.map((ci) => ci.id) ?? []);
      setSupportStaffId(existingClassDetails.supportStaff?.id ?? '');
      setMeetingUrl(existingClassDetails.meetingUrl ?? '');
      setDurationMinutes(existingClassDetails.durationMinutes);
      setTimezone(existingClassDetails.timezone);
      setReminderOffsets(existingClassDetails.reminderOffsetsMinutes ?? [1440, 15]);
      if (existingClassDetails.studentPermissions) {
        setStudentPermissions({
          camera: Boolean(existingClassDetails.studentPermissions.camera),
          screenShare: Boolean(existingClassDetails.studentPermissions.screenShare),
          microphone: Boolean(existingClassDetails.studentPermissions.microphone),
          chatAndReactions: Boolean(existingClassDetails.studentPermissions.chatAndReactions),
        });
      }
      if (existingClassDetails.startsAt) {
        const d = new Date(existingClassDetails.startsAt);
        setStartDate(existingClassDetails.localDate || d.toISOString().split('T')[0]);
        try {
          const timeParts = new Intl.DateTimeFormat('en-GB', {
            timeZone: existingClassDetails.timezone || 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(d);
          setStartTime(timeParts);
        } catch {
          const hh = String(d.getUTCHours()).padStart(2, '0');
          const mm = String(d.getUTCMinutes()).padStart(2, '0');
          setStartTime(`${hh}:${mm}`);
        }
      }
    }
  }, [isEditMode, existingClassDetails]);

  // Transform courses for dropdown
  const courseOptions: OptionItem[] = useMemo(() => {
    if (!Array.isArray(coursesData)) return [];
    return coursesData.map((c: { id: string; title: string }) => ({
      id: c.id,
      name: c.title,
    }));
  }, [coursesData]);

  // Transform batches for dropdown
  const batchOptions: OptionItem[] = useMemo(() => {
    const rawBatches = batchesData?.items ?? batchesData?.batches ?? [];
    return rawBatches.map((b: BatchListItem) => ({
      id: b.id,
      name: b.name,
      capacity: b.capacity,
      enrolledCount: b.enrolledCount,
    }));
  }, [batchesData]);

  // Find selected batch details
  const selectedBatch = useMemo(() => {
    return batchOptions.find((b) => b.id === batchId);
  }, [batchOptions, batchId]);

  // Transform live-class syllabus nodes
  const liveClassNodes: NodeItem[] = useMemo(() => {
    if (!structureData) return [];
    const nodes: CourseStructureNode[] = Array.isArray(structureData)
      ? structureData
      : structureData.nodes ?? [];
    return nodes
      .filter((n) => n.type === 'LIVE_CLASS')
      .map((n) => ({ id: n.id, title: n.title }));
  }, [structureData]);

  // When course changes, pre-fill teaching staff from course defaults
  const handleCourseChange = async (newCourseId: string) => {
    setCourseId(newCourseId);
    setBatchId(''); // clear batch
    setCourseNodeId(undefined);
    setFieldErrors((prev) => ({ ...prev, course: undefined, batch: undefined }));

    if (!newCourseId) return;

    try {
      const course = await getCourse(newCourseId);
      if (course) {
        if (!touchedRef.current.instructor && course.primaryInstructorId) {
          setInstructorId(course.primaryInstructorId);
          setFieldErrors((prev) => ({ ...prev, instructor: undefined }));
        }
        if (!touchedRef.current.coInstructors && Array.isArray(course.coInstructors)) {
          setCoInstructorIds(course.coInstructors.map((ci: PersonRef) => ci.id));
        }
        if (!touchedRef.current.supportStaff && course.supportStaff?.id) {
          setSupportStaffId(course.supportStaff.id);
        }
      }
    } catch {
      // Ignore prefill errors
    }
  };

  const handleBatchChange = (newBatchId: string) => {
    setBatchId(newBatchId);
    setFieldErrors((prev) => ({ ...prev, batch: undefined }));
  };

  const handleTitleChange = (newTitle: string, nodeId?: string) => {
    setTitle(newTitle);
    if (nodeId !== undefined) {
      setCourseNodeId(nodeId);
    }
    setFieldErrors((prev) => ({ ...prev, title: undefined }));
  };

  const handleInstructorChange = (newId: string) => {
    touchedRef.current.instructor = true;
    setInstructorId(newId);
    setFieldErrors((prev) => ({ ...prev, instructor: undefined }));
  };

  const handleCoInstructorsChange = (newIds: string[]) => {
    touchedRef.current.coInstructors = true;
    setCoInstructorIds(newIds);
  };

  const handleSupportStaffChange = (newId: string) => {
    touchedRef.current.supportStaff = true;
    setSupportStaffId(newId);
  };

  // Resolved Person objects for cards
  const selectedInstructorObj: PersonRef | null = useMemo(() => {
    const inst = instructorsList.find((i) => i.id === instructorId);
    return inst ? { id: inst.id, name: inst.name } : null;
  }, [instructorsList, instructorId]);

  const selectedCoInstructorsObj: PersonRef[] = useMemo(() => {
    return coInstructorIds
      .map((cid) => {
        const inst = instructorsList.find((i) => i.id === cid);
        return inst ? { id: inst.id, name: inst.name } : null;
      })
      .filter((ci): ci is PersonRef => ci !== null);
  }, [instructorsList, coInstructorIds]);

  const selectedSupportStaffObj: PersonRef | null = useMemo(() => {
    const st = supportStaffList.find((s) => s.id === supportStaffId);
    return st ? { id: st.id, name: st.name } : null;
  }, [supportStaffList, supportStaffId]);

  // Stable preview payload key to prevent infinite re-fetching
  const previewPayloadKey = useMemo(() => {
    if (isEditMode) return null;
    if (!courseId || !batchId || !title.trim() || !startDate || !startTime) return null;
    return JSON.stringify({
      courseId,
      batchId,
      title: title.trim(),
      courseNodeId,
      agenda: agenda.trim() || undefined,
      instructorId: instructorId || undefined,
      coInstructorIds,
      supportStaffId: supportStaffId || undefined,
      startDate,
      startTime,
      durationMinutes,
      timezone,
      repeat: recurrence,
      reminderOffsetsMinutes: reminderOffsets,
      studentPermissions,
      meetingUrl: meetingUrl.trim() || undefined,
    });
  }, [
    isEditMode,
    courseId,
    batchId,
    title,
    courseNodeId,
    agenda,
    instructorId,
    coInstructorIds,
    supportStaffId,
    startDate,
    startTime,
    durationMinutes,
    timezone,
    recurrence,
    reminderOffsets,
    studentPermissions,
    meetingUrl,
  ]);

  // Debounced preview generator
  useEffect(() => {
    if (!previewPayloadKey) return;
    const payload = JSON.parse(previewPayloadKey) as CreateLiveClassPayload;
    const timer = setTimeout(() => {
      mutatePreviewRef.current(payload);
    }, 400);

    return () => clearTimeout(timer);
  }, [previewPayloadKey]);

  // Generate instant client-side preview based on entered date/time/recurrence
  const localPreview = useMemo(() => {
    return generateLocalPreview({
      startDate,
      startTime,
      durationMinutes,
      timezone,
      recurrence,
      capacity: selectedBatch?.capacity,
      enrolled: selectedBatch?.enrolledCount,
    });
  }, [startDate, startTime, durationMinutes, timezone, recurrence, selectedBatch]);

  const effectivePreview = previewMutation.data ?? localPreview;

  // Submission handler
  const handleSubmit = async (saveAsDraft: boolean, ignoreConflicts = false) => {
    setFormError(null);

    const errors: {
      course?: string;
      batch?: string;
      title?: string;
      instructor?: string;
    } = {};

    if (!courseId) {
      errors.course = 'Please select a course.';
    }
    if (!batchId) {
      errors.batch = 'Please select a batch.';
    }
    if (!title.trim()) {
      errors.title = 'Please provide a session title.';
    }
    if (!saveAsDraft && !instructorId) {
      errors.instructor = 'An instructor must be assigned to schedule this class. Or you can save as draft.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstMsg = Object.values(errors)[0];
      setFormError(firstMsg);
      toast.error(firstMsg);
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFieldErrors({});

    if (isEditMode && id) {
      // Check if session has recurring siblings
      const hasSiblings = (existingClassDetails?.siblings?.total ?? 1) > 1;
      if (hasSiblings) {
        setScopeDialogOpen(true);
      } else {
        await executeUpdate(UpdateScope.THIS, ignoreConflicts);
      }
      return;
    }

    const sanitizedStudentPermissions: StudentPermissions = {
      camera: Boolean(studentPermissions?.camera),
      screenShare: Boolean(studentPermissions?.screenShare),
      microphone: Boolean(studentPermissions?.microphone),
      chatAndReactions: Boolean(studentPermissions?.chatAndReactions),
    };

    const payload: CreateLiveClassPayload = {
      courseId,
      batchId,
      title: title.trim(),
      courseNodeId,
      agenda: agenda.trim() || undefined,
      instructorId: instructorId || undefined,
      coInstructorIds: coInstructorIds.length > 0 ? coInstructorIds : undefined,
      supportStaffId: supportStaffId || undefined,
      startDate,
      startTime,
      durationMinutes,
      timezone,
      repeat: recurrence,
      reminderOffsetsMinutes: reminderOffsets,
      studentPermissions: sanitizedStudentPermissions,
      meetingUrl: meetingUrl.trim() || undefined,
      saveAsDraft,
      ignoreConflicts,
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success(saveAsDraft ? 'Live class draft saved' : 'Live class created successfully');
      navigate('/partner/live-classes');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          status: number;
          data?: { conflicts?: LiveClassConflict[]; message?: string };
        };
      };

      if (axiosErr.response?.status === 409 && axiosErr.response.data?.conflicts) {
        setBlockingConflicts(axiosErr.response.data.conflicts);
        setConflictsDrawerOpen(true);
      } else {
        const msg = axiosErr.response?.data?.message ?? 'Failed to create live class.';
        setFormError(msg);
        toast.error(msg);
      }
    }
  };

  const executeUpdate = async (scope: UpdateScope, ignoreConflicts = false) => {
    if (!id) return;
    setScopeDialogOpen(false);

    const sanitizedStudentPermissions: StudentPermissions = {
      camera: Boolean(studentPermissions?.camera),
      screenShare: Boolean(studentPermissions?.screenShare),
      microphone: Boolean(studentPermissions?.microphone),
      chatAndReactions: Boolean(studentPermissions?.chatAndReactions),
    };

    const payload: UpdateLiveClassPayload = {
      title: title.trim(),
      courseNodeId,
      agenda: agenda.trim() || undefined,
      instructorId: instructorId || null,
      coInstructorIds,
      supportStaffId: supportStaffId || null,
      startTime,
      durationMinutes,
      reminderOffsetsMinutes: reminderOffsets,
      studentPermissions: sanitizedStudentPermissions,
      meetingUrl: meetingUrl.trim() || undefined,
      scope,
      ignoreConflicts,
    };

    try {
      await updateMutation.mutateAsync({ id, payload });
      toast.success('Live class updated successfully');
      navigate('/partner/live-classes');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          status: number;
          data?: { conflicts?: LiveClassConflict[]; message?: string };
        };
      };

      if (axiosErr.response?.status === 409 && axiosErr.response.data?.conflicts) {
        setBlockingConflicts(axiosErr.response.data.conflicts);
        setConflictsDrawerOpen(true);
      } else {
        const msg = axiosErr.response?.data?.message ?? 'Failed to update live class.';
        setFormError(msg);
        toast.error(msg);
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading live class details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/partner/live-classes"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Live Classes</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs text-slate-900 font-semibold">
                  {isEditMode ? 'Edit' : 'Create'}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900">
                {isEditMode ? 'Edit Live Class' : 'Create Live Class'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditMode && (
              <button
                type="button"
                onClick={() => void handleSubmit(true)}
                disabled={isSubmitting}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Save draft
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleSubmit(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Save changes'
                  : 'Create'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {formError && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium text-rose-800">{formError}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            <ClassDetailsSection
              courseId={courseId}
              onCourseChange={handleCourseChange}
              batchId={batchId}
              onBatchChange={handleBatchChange}
              title={title}
              onTitleChange={handleTitleChange}
              instructorId={instructorId}
              onInstructorChange={handleInstructorChange}
              coInstructorIds={coInstructorIds}
              onCoInstructorsChange={handleCoInstructorsChange}
              supportStaffId={supportStaffId}
              onSupportStaffChange={handleSupportStaffChange}
              agenda={agenda}
              onAgendaChange={setAgenda}
              courses={courseOptions}
              batches={batchOptions}
              instructors={instructorsList}
              supportStaffList={supportStaffList}
              liveClassNodes={liveClassNodes}
              isEditMode={isEditMode}
              fieldErrors={fieldErrors}
            />

            <RecurrenceFields
              startDate={startDate}
              onStartDateChange={setStartDate}
              startTime={startTime}
              onStartTimeChange={setStartTime}
              durationMinutes={durationMinutes}
              onDurationChange={setDurationMinutes}
              timezone={timezone}
              onTimezoneChange={setTimezone}
              recurrence={recurrence}
              onRecurrenceChange={setRecurrence}
              isEditMode={isEditMode}
            />

            <AccessControlsSection
              capacity={selectedBatch?.capacity}
              enrolled={selectedBatch?.enrolledCount}
              seatsAvailable={
                selectedBatch && selectedBatch.capacity !== undefined && selectedBatch.enrolledCount !== undefined
                  ? Math.max(0, selectedBatch.capacity - selectedBatch.enrolledCount)
                  : undefined
              }
              reminderOffsets={reminderOffsets}
              onReminderOffsetsChange={setReminderOffsets}
              studentPermissions={studentPermissions}
              onPermissionsChange={setStudentPermissions}
              meetingUrl={meetingUrl}
              onMeetingUrlChange={setMeetingUrl}
            />

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link
                to="/partner/live-classes"
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </Link>
              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => void handleSubmit(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save draft
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleSubmit(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : isEditMode
                    ? 'Save changes'
                    : 'Create Live Class'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Cards & Live Preview */}
          <div className="lg:col-span-4 space-y-6">
            <InstructorAssignmentCard
              instructor={selectedInstructorObj}
              coInstructors={selectedCoInstructorsObj}
              supportStaff={selectedSupportStaffObj}
              instructorAvailable={previewMutation.data?.instructorAvailable ?? true}
              hasConflicts={
                (previewMutation.data?.conflicts?.length ?? 0) > 0 ||
                blockingConflicts.length > 0
              }
            />

            <GeneratedSeriesPanel
              preview={effectivePreview}
              isLoading={previewMutation.isPending && !previewMutation.data && !localPreview}
              courseTitle={courseOptions.find((c) => c.id === courseId)?.name}
              batchName={selectedBatch?.name}
              sessionTitle={title}
              timezone={timezone}
              onReviewConflicts={() => {
                if (previewMutation.data?.conflicts) {
                  setBlockingConflicts(previewMutation.data.conflicts);
                  setConflictsDrawerOpen(true);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Conflicts Review Drawer */}
      <ConflictsDrawer
        isOpen={conflictsDrawerOpen}
        conflicts={blockingConflicts}
        onClose={() => setConflictsDrawerOpen(false)}
        onProceedAnyway={() => {
          setConflictsDrawerOpen(false);
          void handleSubmit(false, true);
        }}
        isLoading={isSubmitting}
      />

      {/* Scope Dialog for Recurring Edit */}
      <ScopeDialog
        isOpen={scopeDialogOpen}
        actionType="update"
        title={title}
        onClose={() => setScopeDialogOpen(false)}
        onConfirm={(scope) => void executeUpdate(scope)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CreateLiveClass;
