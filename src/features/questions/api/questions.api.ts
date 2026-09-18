import api from '../../../shared/api/axios';
import type { Question, CreateQuestionDto } from '../../quizzes/types';

export interface QuestionFilters {
  search?: string;
  subject?: string;
  topic?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  page?: number;
  pageSize?: number;
}

export interface QuestionsResponse {
  items: Question[];
  total: number;
  page: number;
  pageSize: number;
}

export const fetchQuestions = async (filters: QuestionFilters = {}): Promise<QuestionsResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.subject) params.append('subject', filters.subject);
  if (filters.topic) params.append('topic', filters.topic);
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

  const response = await api.get(`/questions?${params.toString()}`);
  return response.data?.data || response.data;
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
