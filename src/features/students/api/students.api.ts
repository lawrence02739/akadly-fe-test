import api from '../../../shared/api/axios';
import type {
  CreateStudentDto,
  ListStudentsParams,
  PaginatedStudentsResponse,
  Student,
  StudentOption,
  UpdateStudentDto,
} from '../types';

export const listStudents = async (
  params: ListStudentsParams = {},
): Promise<PaginatedStudentsResponse> => {
  const { data } = await api.get('/students', { params });
  return data.data ?? data;
};

export const listStudentOptions = async (search?: string): Promise<StudentOption[]> => {
  const { data } = await api.get('/students/options', { params: search ? { search } : {} });
  return data.data ?? data;
};

export const getStudent = async (id: string): Promise<Student> => {
  const { data } = await api.get(`/students/${id}`);
  return data.data ?? data;
};

export const createStudent = async (dto: CreateStudentDto): Promise<Student> => {
  const { data } = await api.post('/students', dto);
  return data.data ?? data;
};

export const updateStudent = async (id: string, dto: UpdateStudentDto): Promise<Student> => {
  const { data } = await api.patch(`/students/${id}`, dto);
  return data.data ?? data;
};

export const deleteStudent = async (id: string): Promise<void> => {
  await api.delete(`/students/${id}`);
};

export const markInstalmentPaid = async (
  studentId: string,
  instalmentNo: number,
  dto: { transactionId?: string; paidAt?: string },
): Promise<Student> => {
  const { data } = await api.patch(`/students/${studentId}/payments/${instalmentNo}`, dto);
  return data.data ?? data;
};

export const resendStudentInvitation = async (studentId: string): Promise<void> => {
  await api.post(`/students/${studentId}/resend-invitation`);
};
