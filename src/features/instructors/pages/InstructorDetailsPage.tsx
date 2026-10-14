import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAddInstructorAssignment,
  useDeleteInstructor,
  useGetInstructor,
  useRemoveInstructorAssignment,
  useSendInstructorInvitation,
  useSetInstructorStatus,
  useUpdateInstructorPermissions,
} from '../hooks/useInstructors';
import { ProfileHeader } from '../components/details/ProfileHeader';
import { OverviewTab } from '../components/details/OverviewTab';
import { CoursesAccessTab } from '../components/details/CoursesAccessTab';
import { EngagementTab } from '../components/details/EngagementTab';
import { PerformanceTab } from '../components/details/PerformanceTab';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import RemoveInstructorRoleDialog from '../components/RemoveInstructorRoleDialog';
import type { TeachingRole } from '../types/instructor.types';

type TabKey = 'overview' | 'courses' | 'engagement' | 'performance';

export const InstructorDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab synced to ?tab=
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';
  const handleTabChange = (tab: TabKey) => {
    setSearchParams({ tab });
  };

  const { data: instructor, isLoading } = useGetInstructor(id);

  // Mutations
  const sendInviteMutation = useSendInstructorInvitation();
  const setStatusMutation = useSetInstructorStatus();
  const deleteMutation = useDeleteInstructor();
  const addAssignmentMutation = useAddInstructorAssignment();
  const removeAssignmentMutation = useRemoveInstructorAssignment();
  const updatePermissionsMutation = useUpdateInstructorPermissions();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRemoveRoleModalOpen, setIsRemoveRoleModalOpen] = useState(false);

  if (isLoading || !instructor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-[#0C5A69]" />
      </div>
    );
  }

  const handleResendInvite = async () => {
    if (!id) return;
    try {
      await sendInviteMutation.mutateAsync(id);
      toast.success('Invitation resent successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend invitation.');
    }
  };

  const handleToggleStatus = async () => {
    if (!id) return;
    const nextStatus = instructor.status === 'active' ? 'suspended' : 'active';
    try {
      await setStatusMutation.mutateAsync({ id, status: nextStatus });
      toast.success(
        nextStatus === 'active'
          ? 'Instructor re-activated.'
          : 'Instructor account suspended.',
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Instructor has been removed.');
      setIsDeleteModalOpen(false);
      navigate('/partner/instructors');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete instructor.');
    }
  };

  const handleAddAssignment = async (dto: {
    courseId: string;
    batchId: string;
    teachingRole: TeachingRole;
  }) => {
    if (!id) return;
    await addAssignmentMutation.mutateAsync({ id, dto });
    toast.success('Cohort assigned successfully.');
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!id) return;
    try {
      await removeAssignmentMutation.mutateAsync({ id, assignmentId });
      toast.success('Assignment removed.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove assignment.');
      throw err;
    }
  };

  const handleUpdatePermissions = async (dto: any) => {
    if (!id) return;
    await updatePermissionsMutation.mutateAsync({ id, dto });
    toast.success('Permissions updated successfully.');
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'courses', label: 'Courses & Access' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'performance', label: 'Performance' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Top back navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/partner/instructors')}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Instructors
        </button>
      </div>

      {/* Header Card */}
      <ProfileHeader
        instructor={instructor}
        onEdit={() => navigate(`/partner/instructors/${id}/edit`)}
        onResendInvitation={handleResendInvite}
        onToggleStatus={handleToggleStatus}
        onDelete={() => setIsDeleteModalOpen(true)}
        onRemoveRole={() => setIsRemoveRoleModalOpen(true)}
        isActionLoading={
          sendInviteMutation.isPending || setStatusMutation.isPending
        }
      />

      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'border-[#0C5A69] text-[#0C5A69]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab
            instructor={instructor}
            onNavigateToCourses={() => handleTabChange('courses')}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesAccessTab
            instructor={instructor}
            onAddAssignment={handleAddAssignment}
            onRemoveAssignment={handleRemoveAssignment}
            onUpdatePermissions={handleUpdatePermissions}
            isUpdatingPermissions={updatePermissionsMutation.isPending}
          />
        )}

        {activeTab === 'engagement' && <EngagementTab />}

        {activeTab === 'performance' && <PerformanceTab />}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        instructorName={instructor.fullName || instructor.name || ''}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Remove Instructor Role Dialog */}
      <RemoveInstructorRoleDialog
        isOpen={isRemoveRoleModalOpen}
        onClose={() => setIsRemoveRoleModalOpen(false)}
        instructorId={instructor.id}
        instructorName={instructor.fullName || instructor.name || ''}
        assignmentsCount={instructor.assignments?.length || 0}
        onSuccess={() => {
          setIsRemoveRoleModalOpen(false);
          navigate('/partner/instructors');
        }}
      />
    </div>
  );
};
export default InstructorDetailsPage;
