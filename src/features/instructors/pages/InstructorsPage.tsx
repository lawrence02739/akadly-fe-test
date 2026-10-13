import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useDeleteInstructor,
  useListInstructors,
  useListSpecialties,
  useRevokeInstructorInvitation,
  useSendInstructorInvitation,
  useSetInstructorStatus,
} from '../hooks/useInstructors';
import { InstructorFilters } from '../components/InstructorFilters';
import { InstructorTable } from '../components/InstructorTable';
import { InvitationBanner } from '../components/InvitationBanner';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import type { InstructorListItem } from '../types/instructor.types';

export const InstructorsPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [status, setStatus] = useState('');
  const [instructorType, setInstructorType] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [deletingInstructor, setDeletingInstructor] =
    useState<InstructorListItem | null>(null);

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Queries
  const { data: specialtiesData } = useListSpecialties();
  const { data: instructorsResponse, isLoading } = useListInstructors({
    search: debouncedSearch || undefined,
    specialty: specialty || undefined,
    status: status || undefined,
    instructorType: instructorType || undefined,
    page,
    limit: 15,
  });

  // Mutations
  const sendInviteMutation = useSendInstructorInvitation();
  const revokeInviteMutation = useRevokeInstructorInvitation();
  const setStatusMutation = useSetInstructorStatus();
  const deleteMutation = useDeleteInstructor();

  const handleSendInvitation = async (id: string) => {
    try {
      await sendInviteMutation.mutateAsync(id);
      toast.success('Invitation email sent successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitation.');
    }
  };

  const handleResendInvitation = async (id: string) => {
    try {
      await sendInviteMutation.mutateAsync(id);
      toast.success('New invitation email resent.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend invitation.');
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    if (
      !window.confirm(
        'Revoke this invitation? The instructor will return to Draft state and the current link will expire.',
      )
    ) {
      return;
    }
    try {
      await revokeInviteMutation.mutateAsync(id);
      toast.success('Invitation revoked.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke invitation.');
    }
  };

  const handleSetStatus = async (id: string, newStatus: 'active' | 'suspended') => {
    try {
      await setStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success(
        newStatus === 'active'
          ? 'Instructor re-activated.'
          : 'Instructor account suspended.',
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingInstructor) return;
    try {
      await deleteMutation.mutateAsync(deletingInstructor.id);
      toast.success(
        `${deletingInstructor.fullName || deletingInstructor.name} has been removed.`,
      );
      setDeletingInstructor(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove instructor.');
    }
  };

  const instructorsList = instructorsResponse?.data || [];
  const paginationMeta = instructorsResponse?.meta;

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Instructors Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your teaching staff, cohort allocations, schedules, and platform access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/partner/instructors/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0C5A69] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#094753] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Instructor
        </button>
      </div>

      {/* Filter Bar with Tabs and Dropdowns */}
      <InstructorFilters
        search={searchTerm}
        onSearchChange={setSearchTerm}
        specialty={specialty}
        onSpecialtyChange={(val) => {
          setSpecialty(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        instructorType={instructorType}
        onInstructorTypeChange={(val) => {
          setInstructorType(val);
          setPage(1);
        }}
        specialties={specialtiesData || []}
      />

      {/* Main Table */}
      <InstructorTable
        instructors={instructorsList}
        isLoading={isLoading}
        pagination={paginationMeta}
        onPageChange={setPage}
        onView={(id) => navigate(`/partner/instructors/${id}`)}
        onEdit={(id) => navigate(`/partner/instructors/${id}/edit`)}
        onSendInvitation={handleSendInvitation}
        onResendInvitation={handleResendInvitation}
        onRevokeInvitation={handleRevokeInvitation}
        onSetStatus={handleSetStatus}
        onDelete={(item) => setDeletingInstructor(item)}
      />

      {/* Footer Info Banner */}
      <InvitationBanner instructors={instructorsList} />

      {/* Soft Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={!!deletingInstructor}
        instructorName={
          deletingInstructor?.fullName || deletingInstructor?.name || ''
        }
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingInstructor(null)}
      />
    </div>
  );
};
export default InstructorsPage;
