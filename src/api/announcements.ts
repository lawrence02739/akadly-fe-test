import api from '../shared/api/axios';
import type { Announcement, AnnouncementStatus, AnnouncementAudience, LearnerStatusFilter } from '../types/announcements';

export const announcementsApi = {
  // Tenant APIs
  listTenantAnnouncements: async (page = 1, limit = 10, status?: AnnouncementStatus) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    const { data } = await api.get('/announcements', { params });
    return data.data;
  },

  getTenantAnnouncement: async (id: string) => {
    const { data } = await api.get(`/announcements/${id}`);
    return data.data;
  },

  getTenantAnnouncementStats: async (id: string) => {
    const { data } = await api.get(`/announcements/${id}/stats`);
    return data.data;
  },

  createDraft: async (payload: Partial<Announcement>) => {
    const { data } = await api.post('/announcements', payload);
    return data.data;
  },

  updateDraft: async (id: string, payload: Partial<Announcement>) => {
    const { data } = await api.patch(`/announcements/${id}`, payload);
    return data.data;
  },

  publish: async (id: string, payload: { audience: AnnouncementAudience, courseId: string, batchId?: string, learnerStatus?: LearnerStatusFilter, emailDeliveryEnabled: boolean }) => {
    const { data } = await api.post(`/announcements/${id}/publish`, payload);
    return data.data;
  },

  schedule: async (id: string, payload: { scheduledFor: string, audience: AnnouncementAudience, courseId: string, batchId?: string, learnerStatus?: LearnerStatusFilter, emailDeliveryEnabled: boolean }) => {
    const { data } = await api.post(`/announcements/${id}/schedule`, payload);
    return data.data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/announcements/${id}`);
    return data.data;
  },

  // Student APIs
  listStudentAnnouncements: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const { data } = await api.get('/student/announcements', { params });
    return data.data;
  },

  getStudentAnnouncementDetail: async (id: string) => {
    const { data } = await api.get(`/student/announcements/${id}`);
    return data.data;
  }
};
