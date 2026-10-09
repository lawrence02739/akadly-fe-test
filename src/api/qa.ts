import api from '../shared/api/axios';
import type { QuestionStatus, QuestionPriority } from '../types/qa';

export const qaApi = {
  // Tenant APIs
  listTenantQuestions: async (page = 1, limit = 10, status?: QuestionStatus, assigneeUserId?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (assigneeUserId) params.append('assigneeUserId', assigneeUserId);
    const { data } = await api.get('/questions', { params });
    return data.data;
  },

  getTenantQuestionDetail: async (id: string) => {
    const { data } = await api.get(`/questions/${id}`);
    return data.data;
  },

  replyToQuestion: async (id: string, body: string, attachments: any[] = []) => {
    const { data } = await api.post(`/questions/${id}/reply`, { body, attachments });
    return data.data;
  },

  addInternalNote: async (id: string, body: string, attachments: any[] = []) => {
    const { data } = await api.post(`/questions/${id}/internal-note`, { body, attachments });
    return data.data;
  },

  resolveQuestion: async (id: string) => {
    const { data } = await api.post(`/questions/${id}/resolve`);
    return data.data;
  },

  assignQuestion: async (id: string, assigneeUserId: string, assigneeName: string) => {
    const { data } = await api.post(`/questions/${id}/assign`, { assigneeUserId, assigneeName });
    return data.data;
  },

  changePriority: async (id: string, priority: QuestionPriority) => {
    const { data } = await api.post(`/questions/${id}/priority`, { priority });
    return data.data;
  },

  // Student APIs
  listStudentQuestions: async (page = 1, limit = 10, status?: QuestionStatus) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    const { data } = await api.get('/student/questions', { params });
    return data.data;
  },

  getStudentQuestionDetail: async (id: string) => {
    const { data } = await api.get(`/student/questions/${id}`);
    return data.data;
  },

  askQuestion: async (courseId: string, lessonId: string, title: string, body: string, attachments: any[] = []) => {
    const { data } = await api.post('/student/questions', { courseId, lessonId, title, body, attachments });
    return data.data;
  },

  studentReplyToQuestion: async (id: string, body: string, attachments: any[] = []) => {
    const { data } = await api.post(`/student/questions/${id}/reply`, { body, attachments });
    return data.data;
  },

  studentResolveQuestion: async (id: string) => {
    const { data } = await api.post(`/student/questions/${id}/resolve`);
    return data.data;
  }
};
