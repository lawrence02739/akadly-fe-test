import api from '../../../shared/api/axios';
import type { Test, CreateTestDto, UpdateTestDto } from '../types';
import type { Question, CreateQuestionDto, UpdateQuestionDto } from '../../quizzes/types';

export const fetchTests = async (): Promise<Test[]> => {
  const { data } = await api.get('/tests');
  return data.data || data;
};

export const fetchTest = async (id: string): Promise<Test> => {
  const { data } = await api.get(`/tests/${id}`);
  return data.data || data;
};

export const createTest = async (dto: CreateTestDto): Promise<Test> => {
  const { data } = await api.post('/tests', dto);
  return data.data || data;
};

export const updateTest = async (id: string, dto: UpdateTestDto): Promise<Test> => {
  const { data } = await api.patch(`/tests/${id}`, dto);
  return data.data || data;
};

export const deleteTest = async (id: string): Promise<void> => {
  await api.delete(`/tests/${id}`);
};

export const createQuestion = async (testId: string, dto: CreateQuestionDto): Promise<Question> => {
  const { data } = await api.post(`/tests/${testId}/questions`, dto);
  return data.data || data;
};

export const updateQuestion = async (testId: string, qId: string, dto: UpdateQuestionDto): Promise<Question> => {
  const { data } = await api.patch(`/tests/${testId}/questions/${qId}`, dto);
  return data.data || data;
};

export const deleteQuestion = async (testId: string, qId: string): Promise<void> => {
  await api.delete(`/tests/${testId}/questions/${qId}`);
};

export const linkQuestions = async (testId: string, questionIds: string[]): Promise<void> => {
  await api.post(`/tests/${testId}/questions/link`, { questionIds });
};
