import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateInstructor,
  useGetInstructor,
  useListSpecialties,
  useRestoreInstructor,
  useUpdateInstructor,
} from '../hooks/useInstructors';
import { IdentitySection } from '../components/InstructorForm/IdentitySection';
import { InstructorTypeSelector } from '../components/InstructorForm/InstructorTypeSelector';
import { EngagementSection } from '../components/InstructorForm/EngagementSection';
import { InitialAssignmentSection } from '../components/InstructorForm/InitialAssignmentSection';
import { DocumentsSection } from '../components/InstructorForm/DocumentsSection';
import { PermissionsCard } from '../components/InstructorForm/PermissionsCard';
import { InvitationCard } from '../components/InstructorForm/InvitationCard';
import { ReviewInvitationDrawer } from '../components/InstructorForm/ReviewInvitationDrawer';
import { validateInstructorForm } from '../schemas/instructor.schema';
import {
  InstructorType,
  TeachingRole,
  type WeeklySlot,
  type InstructorDocument,
} from '../types/instructor.types';

interface AddInstructorPageProps {
  editMode?: boolean;
}

export const AddInstructorPage: React.FC<AddInstructorPageProps> = ({
  editMode = false,
}) => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();

  // Fetch existing if editing
  const { data: existingInstructor, isLoading: isLoadingExisting } =
    useGetInstructor(editMode ? editId : undefined);
  const { data: specialtiesData } = useListSpecialties();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [instructorType, setInstructorType] = useState<InstructorType>(
    InstructorType.FULL_TIME,
  );

  // Engagement State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requiredWeeklyHours, setRequiredWeeklyHours] = useState<number | ''>('');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySlot[]>([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [renewalNote, setRenewalNote] = useState('');

  // Initial Assignment State
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [teachingRole, setTeachingRole] = useState<TeachingRole>(TeachingRole.LEAD);

  // Documents State
  const [documents, setDocuments] = useState<InstructorDocument[]>([]);

  // Permissions State
  const [editCourseContent, setEditCourseContent] = useState(false);
  const [gradeAssessments, setGradeAssessments] = useState(true);
  const [communicateWithLearners, setCommunicateWithLearners] = useState(true);

  // Invitation State
  const [sendInvitation, setSendInvitation] = useState(true);

  // UI Flow State
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [softDeletedConflictId, setSoftDeletedConflictId] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreateInstructor();
  const updateMutation = useUpdateInstructor();
  const restoreMutation = useRestoreInstructor();

  // Helper to build type-specific engagement payload
  const buildEngagementPayload = (
    type: InstructorType,
    eng: {
      startDate?: string;
      endDate?: string;
      requiredWeeklyHours?: string | number;
      weeklySchedule?: WeeklySlot[];
      timezone?: string;
      renewalNote?: string;
    },
  ) => {
    const tz = eng.timezone || 'Asia/Kolkata';
    const sDate = eng.startDate ? new Date(eng.startDate).toISOString() : undefined;

    switch (type) {
      case InstructorType.FULL_TIME:
        return {
          ...(sDate ? { startDate: sDate } : {}),
          timezone: tz,
        };

      case InstructorType.PART_TIME:
        return {
          startDate: sDate,
          requiredWeeklyHours: Number(eng.requiredWeeklyHours) || 1,
          weeklySchedule: eng.weeklySchedule || [],
          timezone: tz,
        };

      case InstructorType.CONTRACT_BASED: {
        const eDate = eng.endDate ? new Date(eng.endDate).toISOString() : undefined;
        const note = eng.renewalNote?.trim() || undefined;
        return {
          startDate: sDate,
          endDate: eDate,
          timezone: tz,
          ...(note ? { renewalNote: note } : {}),
        };
      }

      case InstructorType.GUEST: {
        const eDate = eng.endDate ? new Date(eng.endDate).toISOString() : undefined;
        return {
          startDate: sDate,
          endDate: eDate,
          timezone: tz,
        };
      }

      default:
        return {
          ...(sDate ? { startDate: sDate } : {}),
          timezone: tz,
        };
    }
  };

  // Populate data in edit mode
  useEffect(() => {
    if (editMode && existingInstructor) {
      setName(existingInstructor.fullName || existingInstructor.name || '');
      setEmail(existingInstructor.email || '');
      setPhone(existingInstructor.phone || '');
      setSpecialty(existingInstructor.specialty || '');
      setExpertise(existingInstructor.expertise || []);
      setBio(existingInstructor.bio || '');
      setInstructorType(existingInstructor.instructorType);
      setDocuments(existingInstructor.documents || []);

      const eng = existingInstructor.engagement || {};
      setStartDate(eng.startDate ? eng.startDate.split('T')[0] : '');
      setEndDate(eng.endDate ? eng.endDate.split('T')[0] : '');
      setRequiredWeeklyHours(eng.requiredWeeklyHours ?? '');
      setWeeklySchedule(eng.weeklySchedule || []);
      setTimezone(eng.timezone || 'Asia/Kolkata');
      setRenewalNote(eng.renewalNote || '');

      const perms = existingInstructor.permissionFlags || {};
      setEditCourseContent(perms.editCourseContent ?? false);
      setGradeAssessments(perms.gradeAssessments ?? true);
      setCommunicateWithLearners(perms.communicateWithLearners ?? true);
    }
  }, [editMode, existingInstructor]);

  // Clean type-specific fields on type switch (unless in edit mode with non-draft)
  const handleSelectType = (newType: InstructorType) => {
    setInstructorType(newType);
    if (newType === InstructorType.FULL_TIME) {
      setEndDate('');
      setRequiredWeeklyHours('');
      setWeeklySchedule([]);
    } else if (newType === InstructorType.PART_TIME) {
      setEndDate('');
      if (!requiredWeeklyHours) setRequiredWeeklyHours(15);
      if (weeklySchedule.length === 0) {
        setWeeklySchedule([
          { day: 'MON' as any, startTime: '09:00', endTime: '12:00' },
          { day: 'WED' as any, startTime: '09:00', endTime: '12:00' },
          { day: 'FRI' as any, startTime: '09:00', endTime: '12:00' },
        ]);
      }
    } else if (newType === InstructorType.CONTRACT_BASED || newType === InstructorType.GUEST) {
      setRequiredWeeklyHours('');
      setWeeklySchedule([]);
    }
  };

  const validate = (): boolean => {
    const validationErrors = validateInstructorForm({
      name,
      email,
      phone,
      specialty,
      instructorType,
      engagement: {
        startDate: startDate || null,
        endDate: endDate || null,
        requiredWeeklyHours:
          requiredWeeklyHours === '' ? null : Number(requiredWeeklyHours),
        weeklySchedule,
        timezone,
        renewalNote,
      },
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsReviewOpen(true);
    } else {
      toast.error('Please fix validation errors before proceeding.');
    }
  };

  const handleSaveDraft = async () => {
    if (!validate()) {
      toast.error('Please complete required fields before saving draft.');
      return;
    }

    try {
      const payload = {
        fullName: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : undefined,
        specialty: specialty.trim(),
        expertise: expertise.length > 0 ? expertise : undefined,
        bio: bio ? bio.trim() : undefined,
        instructorType,
        engagement: buildEngagementPayload(instructorType, {
          startDate,
          endDate,
          requiredWeeklyHours,
          weeklySchedule,
          timezone,
          renewalNote,
        }),
        permissions: {
          editCourseContent,
          gradeAssessments,
          communicateWithLearners,
        },
        initialAssignment:
          courseId && batchId
            ? { courseId, batchId, teachingRole }
            : undefined,
        documents: documents.length > 0 ? documents : undefined,
        sendInvitation: false,
      };

      const result = await createMutation.mutateAsync(payload);
      toast.success('Instructor profile saved as draft.');
      navigate(`/partner/instructors/${result.id}`);
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix validation errors before proceeding.');
      return;
    }
    try {
      if (editMode && editId) {
        await updateMutation.mutateAsync({
          id: editId,
          dto: {
            fullName: name.trim(),
            phone: phone ? phone.trim() : undefined,
            specialty: specialty.trim(),
            expertise: expertise.length > 0 ? expertise : undefined,
            bio: bio ? bio.trim() : undefined,
            instructorType,
            engagement: buildEngagementPayload(instructorType, {
              startDate,
              endDate,
              requiredWeeklyHours,
              weeklySchedule,
              timezone,
              renewalNote,
            }),
            permissions: {
              editCourseContent,
              gradeAssessments,
              communicateWithLearners,
            },
            documents,
          },
        });
        toast.success('Instructor updated successfully.');
        setIsReviewOpen(false);
        navigate(`/partner/instructors/${editId}`);
      } else {
        const payload = {
          fullName: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : undefined,
          specialty: specialty.trim(),
          expertise: expertise.length > 0 ? expertise : undefined,
          bio: bio ? bio.trim() : undefined,
          instructorType,
          engagement: buildEngagementPayload(instructorType, {
            startDate,
            endDate,
            requiredWeeklyHours,
            weeklySchedule,
            timezone,
            renewalNote,
          }),
          permissions: {
            editCourseContent,
            gradeAssessments,
            communicateWithLearners,
          },
          initialAssignment:
            courseId && batchId
              ? { courseId, batchId, teachingRole }
              : undefined,
          documents: documents.length > 0 ? documents : undefined,
          sendInvitation,
        };

        const result = await createMutation.mutateAsync(payload);
        setIsReviewOpen(false);

        if (sendInvitation) {
          navigate(`/partner/instructors/${result.id}/invitation-sent`);
        } else {
          toast.success('Instructor saved as draft.');
          navigate(`/partner/instructors/${result.id}`);
        }
      }
    } catch (err: any) {
      handleApiError(err);
    }
  };

  const handleApiError = (err: any) => {
    const msg = err.response?.data?.message || 'An error occurred.';
    const details = err.response?.data?.details;

    if (details && Array.isArray(details)) {
      const fieldErrors: Record<string, string> = {};
      details.forEach((d: { field?: string; message: string }) => {
        if (d.field) {
          fieldErrors[d.field] = d.message;
          if (d.field === 'fullName') {
            fieldErrors.name = d.message;
          }
        }
      });
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }

    if (
      err.response?.status === 409 &&
      (msg.toLowerCase().includes('soft-deleted') ||
        msg.toLowerCase().includes('previously removed'))
    ) {
      // Find conflict instructor id from response or hint
      setSoftDeletedConflictId(err.response?.data?.instructorId || 'conflict');
    }

    toast.error(msg);
  };

  const handleRestoreConflict = async () => {
    if (!softDeletedConflictId) return;
    try {
      const res = await restoreMutation.mutateAsync(softDeletedConflictId);
      toast.success('Instructor restored to draft successfully.');
      navigate(`/partner/instructors/${res.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore instructor.');
    }
  };

  const pageTitle = editMode
    ? `Edit ${existingInstructor?.fullName || existingInstructor?.name || 'Instructor'}`
    : instructorType === InstructorType.PART_TIME
      ? 'Add Part-time Instructor'
      : instructorType === InstructorType.GUEST
        ? 'Add Guest Instructor'
        : 'Add Instructor';

  if (editMode && isLoadingExisting) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#0C5A69]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/partner/instructors')}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {pageTitle}
            </h1>
            <p className="text-xs text-slate-500">
              {editMode
                ? 'Update instructor profile, engagement terms, and permissions.'
                : 'Step 1 of 3 — Fill in profile details, assign cohort, and configure permissions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/partner/instructors')}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          {!editMode && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Save Draft
            </button>
          )}
          <button
            type="button"
            onClick={editMode ? handleConfirmSubmit : handleOpenReview}
            disabled={updateMutation.isPending || createMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0C5A69] px-4 py-2 text-xs font-semibold text-white hover:bg-[#094753] disabled:opacity-50"
          >
            {editMode ? (
              updateMutation.isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                {sendInvitation ? 'Review & Send' : 'Save Profile'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Soft-deleted conflict alert */}
      {softDeletedConflictId && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold text-amber-950">
                Instructor previously removed with this email.
              </span>{' '}
              A soft-deleted record exists in this workspace. You can restore it
              to keep history.
            </div>
          </div>
          <button
            type="button"
            onClick={handleRestoreConflict}
            disabled={restoreMutation.isPending}
            className="rounded-lg bg-amber-700 px-3 py-1.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
          >
            Restore Instructor
          </button>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Identity & Expertise */}
          <IdentitySection
            name={name}
            onChangeName={setName}
            email={email}
            onChangeEmail={setEmail}
            emailReadOnly={editMode}
            phone={phone}
            onChangePhone={setPhone}
            specialty={specialty}
            onChangeSpecialty={setSpecialty}
            specialties={specialtiesData || []}
            expertise={expertise}
            onChangeExpertise={setExpertise}
            bio={bio}
            onChangeBio={setBio}
            errors={errors}
          />

          {/* Instructor Type selector */}
          <InstructorTypeSelector
            selectedType={instructorType}
            onSelectType={handleSelectType}
            disabled={editMode && existingInstructor?.status !== 'draft'}
          />

          {/* Engagement details block */}
          <EngagementSection
            instructorType={instructorType}
            startDate={startDate}
            onChangeStartDate={setStartDate}
            endDate={endDate}
            onChangeEndDate={setEndDate}
            requiredWeeklyHours={requiredWeeklyHours}
            onChangeRequiredWeeklyHours={setRequiredWeeklyHours}
            weeklySchedule={weeklySchedule}
            onChangeWeeklySchedule={setWeeklySchedule}
            timezone={timezone}
            onChangeTimezone={setTimezone}
            renewalNote={renewalNote}
            onChangeRenewalNote={setRenewalNote}
            errors={errors}
          />

          {/* Instructor Documents */}
          <DocumentsSection
            documents={documents}
            onChangeDocuments={setDocuments}
          />

          {/* Initial Assignment (new mode only) */}
          {!editMode && (
            <InitialAssignmentSection
              courseId={courseId}
              onChangeCourseId={setCourseId}
              batchId={batchId}
              onChangeBatchId={setBatchId}
              teachingRole={teachingRole}
              onChangeTeachingRole={setTeachingRole}
            />
          )}
        </div>

        {/* Right Sticky Column */}
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            {/* Permissions card */}
            <PermissionsCard
              editCourseContent={editCourseContent}
              onChangeEditCourseContent={setEditCourseContent}
              gradeAssessments={gradeAssessments}
              onChangeGradeAssessments={setGradeAssessments}
              communicateWithLearners={communicateWithLearners}
              onChangeCommunicateWithLearners={setCommunicateWithLearners}
            />

            {/* Invitation card (new mode only) */}
            {!editMode && (
              <InvitationCard
                instructorType={instructorType}
                sendInvitation={sendInvitation}
                onChangeSendInvitation={setSendInvitation}
              />
            )}
          </div>
        </div>
      </div>

      {/* Review Drawer / Modal */}
      <ReviewInvitationDrawer
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirmSend={handleConfirmSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        editMode={editMode}
        formData={{
          name,
          email,
          phone,
          specialty,
          expertise,
          bio,
          instructorType,
          engagement: {
            startDate,
            endDate,
            requiredWeeklyHours:
              requiredWeeklyHours === '' ? null : Number(requiredWeeklyHours),
            weeklySchedule,
            timezone,
            renewalNote,
          },
          permissions: {
            editCourseContent,
            gradeAssessments,
            communicateWithLearners,
          },
          initialAssignment:
            courseId && batchId
              ? { courseId, batchId, teachingRole }
              : undefined,
          documents,
          sendInvitation,
        }}
      />
    </div>
  );
};
export default AddInstructorPage;
