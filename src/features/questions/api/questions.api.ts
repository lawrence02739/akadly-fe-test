import api from '../../../shared/api/axios';
import type { Question, CreateQuestionDto } from '../../quizzes/types';

export interface QuestionFilters {
  search?: string;
  subject?: string;
  topic?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  courseId?: string;
  nodeId?: string;
  type?: string;
  tags?: string[];
  bloomsLevel?: string;
  categoryId?: string;
  testId?: string;
  page?: number;
  pageSize?: number;
}

import type { PaginationMeta } from '../../../shared/api/pagination';

export interface QuestionsResponse {
  items: Question[];
  total: number;
  page: number;
  pageSize: number;
  pagination?: PaginationMeta;
}

export const fetchQuestions = async (filters: QuestionFilters = {}): Promise<QuestionsResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.subject) params.append('subject', filters.subject);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.courseId) params.append('courseId', filters.courseId);
  if (filters.nodeId) params.append('nodeId', filters.nodeId);
  if (filters.type) params.append('type', filters.type);
  if (filters.bloomsLevel) params.append('bloomsLevel', filters.bloomsLevel);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.testId) params.append('testId', filters.testId);
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((t) => params.append('tags', t));
  }
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

  const response = await api.get(`/questions?${params.toString()}`);
  const data = response.data;
  const items: Question[] = Array.isArray(data.data) ? data.data : (data.data?.items ?? []);
  const pagination = data.pagination;
  return {
    items,
    pagination,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? (filters.page || 1),
    pageSize: pagination?.pageSize ?? (filters.pageSize || 20),
  };
};

export const fetchQuestion = async (id: string): Promise<Question> => {
  const response = await api.get(`/questions/${id}`);
  return response.data?.data || response.data;
};

export const createQuestion = async (dto: CreateQuestionDto): Promise<Question> => {
  const response = await api.post('/questions', dto);
  return response.data?.data || response.data;
};

export const updateQuestion = async (id: string, dto: Partial<CreateQuestionDto>): Promise<Question> => {
  const response = await api.patch(`/questions/${id}`, dto);
  return response.data?.data || response.data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await api.delete(`/questions/${id}`);
};

export const linkQuestionCourse = async (
  id: string,
  dto: { courseId: string; nodeId?: string },
): Promise<Question> => {
  const response = await api.post(`/questions/${id}/link-course`, dto);
  return response.data?.data || response.data;
};

export const unlinkQuestionCourse = async (id: string): Promise<Question> => {
  const response = await api.post(`/questions/${id}/unlink-course`);
  return response.data?.data || response.data;
};

