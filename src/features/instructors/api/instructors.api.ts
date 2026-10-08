import axios from 'axios';
import api from '../../../shared/api/axios';
import type { PaginationMeta } from '../../team/api/team.api';
export type InstructorTypeCode = 'full_time' | 'part_time' | 'contract' | 'guest';
export interface InstructorProfile {
  specialty: string; expertise?: string;
  employment: { type: InstructorTypeCode; startDate?: string; endDate?: string; renewalNote?: string };
  availability?: { timezone: string; requiredMinutesPerWeek: number; slots: Array<{ day: number; startMinute: number; endMinute: number }> };
  initialAssignment?: { courseId: string; batchId?: string; teachingRole: 'instructor' | 'co_instructor' };
}
export interface Instructor {
  rating?: { average: number; reviewCount: number } | null;
  recentActivity?: Array<{ type: string; title: string; occurredAt: string; courseTitle: string; cohort: string }>;
  assignments?: Array<{ id: string; courseId: string; courseTitle: string; cohort: string; teachingRole: 'instructor' | 'co_instructor'; learnerCount: number; startsAt: string; endsAt: string; status: string }>;
  archivedAt: string | null; teachingRole?: 'instructor' | 'co_instructor';
  id: string; userId: string; name: string; email: string; phone: string; bio: string;
  status: 'active' | 'invited' | 'suspended' | 'disabled' | 'draft';
  deliveryStatus: 'not_sent' | 'sent' | 'failed';
  lastActiveAt: string | null; instructorProfile: InstructorProfile;
  courseCount: number; plannedCourseCount: number; learnerCount: number; createdAt: string;
}
export interface InstructorOptions {
  roles: Array<{ id: string; key: 'instructor' | 'co_instructor'; name: string; permissions: string[] }>;
  specialties: string[];
  permissions: Array<{ key: string; label: string; description: string }>;
}
export interface CreateInstructor {
  name: string; email: string; phone?: string; bio?: string;
  instructorProfile: InstructorProfile;
  teachingRole: 'instructor' | 'co_instructor';
  sendInvitation: boolean;
}
export const instructorsApi = {
  get: async (id: string): Promise<Instructor> => (await api.get(`/instructors/${id}`)).data.data,
  update: async (id: string, body: Omit<CreateInstructor, 'sendInvitation'>): Promise<Instructor> => (await api.patch(`/instructors/${id}`, body)).data.data,
  archive: async (id: string) => (await api.delete(`/instructors/${id}`)).data.data,
  restore: async (id: string) => (await api.post(`/instructors/${id}/restore`)).data.data,
  deleteArchived: async (id: string) => (await api.delete(`/instructors/${id}/permanent`)).data.data,

  options: async (): Promise<InstructorOptions> => (await api.get('/instructors/options')).data.data,
  create: async (body: CreateInstructor): Promise<{ id: string; status: Instructor['status']; deliveryStatus: Instructor['deliveryStatus'] }> => (await api.post('/instructors', body)).data.data,
  list: async (params: { page: number; pageSize: number; search?: string; status?: string; type?: string; specialty?: string; view?: 'active' | 'archived' }): Promise<{ data: Instructor[]; meta: PaginationMeta }> => {
    const response = await api.get<{ data: Instructor[]; meta: { pagination: PaginationMeta } }>('/instructors', { params });
    return { data: response.data.data, meta: response.data.meta.pagination };
  },
};
export function instructorError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }
  return 'Could not complete the request. Please try again.';
}
export const instructorTypeLabels: Record<InstructorTypeCode, string> = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract-based', guest: 'Guest' };
