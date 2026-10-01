import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStudent,
  deleteStudent,
  getStudent,
  listStudentOptions,
  listStudents,
  markInstalmentPaid,
  resendStudentInvitation,
  updateStudent,
} from '../api/students.api';
import type {
  CreateStudentDto,
  ListStudentsParams,
  UpdateStudentDto,
} from '../types';

export const STUDENTS_KEY = 'students';

export const useListStudents = (params: ListStudentsParams = {}) =>
  useQuery({
    queryKey: [STUDENTS_KEY, params],
    queryFn: () => listStudents(params),
  });

export const useListStudentOptions = (search?: string) =>
  useQuery({
    queryKey: [STUDENTS_KEY, 'options', search],
    queryFn: () => listStudentOptions(search),
  });

export const useGetStudent = (id?: string) =>
  useQuery({
    queryKey: [STUDENTS_KEY, id],
    queryFn: () => getStudent(id!),
    enabled: !!id,
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStudentDto) => createStudent(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STUDENTS_KEY] }),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
      updateStudent(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STUDENTS_KEY] }),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STUDENTS_KEY] }),
  });
};

export const useMarkInstalmentPaid = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, instalmentNo, dto }: { studentId: string; instalmentNo: number; dto: { transactionId?: string; paidAt?: string } }) =>
      markInstalmentPaid(studentId, instalmentNo, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STUDENTS_KEY] }),
  });
};

export const useResendInvitation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) => resendStudentInvitation(studentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [STUDENTS_KEY] }),
  });
};
