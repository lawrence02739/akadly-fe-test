import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addInstructorAssignment,
  createInstructor,
  deleteInstructor,
  getInstructor,
  listInstructorOptions,
  listInstructors,
  listSpecialties,
  removeInstructorAssignment,
  restoreInstructor,
  revokeInstructorInvitation,
  sendInstructorInvitation,
  setInstructorStatus,
  updateInstructor,
  updateInstructorPermissions,
} from '../api/instructors.api';
import type {
  AddAssignmentDto,
  CreateInstructorDto,
  ListInstructorsParams,
  UpdateInstructorDto,
  UpdatePermissionsDto,
} from '../types/instructor.types';

export const INSTRUCTORS_KEY = 'instructors';

export const useListInstructors = (params: ListInstructorsParams = {}) =>
  useQuery({
    queryKey: [INSTRUCTORS_KEY, params],
    queryFn: () => listInstructors(params),
  });

export const useListInstructorOptions = (search?: string) =>
  useQuery({
    queryKey: [INSTRUCTORS_KEY, 'options', search],
    queryFn: () => listInstructorOptions(search),
  });

export const useListSpecialties = () =>
  useQuery({
    queryKey: [INSTRUCTORS_KEY, 'specialties'],
    queryFn: () => listSpecialties(),
    staleTime: 5 * 60 * 1000,
  });

export const useGetInstructor = (id?: string) =>
  useQuery({
    queryKey: [INSTRUCTORS_KEY, id],
    queryFn: () => getInstructor(id!),
    enabled: !!id,
  });

export const useCreateInstructor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInstructorDto) => createInstructor(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
    },
  });
};

export const useUpdateInstructor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInstructorDto }) =>
      updateInstructor(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useDeleteInstructor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInstructor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
    },
  });
};

export const useRestoreInstructor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreInstructor(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useSetInstructorStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: 'active' | 'suspended';
      reason?: string;
    }) => setInstructorStatus(id, status, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useSendInstructorInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sendInstructorInvitation(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useRevokeInstructorInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeInstructorInvitation(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useAddInstructorAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AddAssignmentDto }) =>
      addInstructorAssignment(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useRemoveInstructorAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      assignmentId,
    }: {
      id: string;
      assignmentId: string;
    }) => removeInstructorAssignment(id, assignmentId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};

export const useUpdateInstructorPermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePermissionsDto }) =>
      updateInstructorPermissions(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY] });
      qc.invalidateQueries({ queryKey: [INSTRUCTORS_KEY, id] });
    },
  });
};
