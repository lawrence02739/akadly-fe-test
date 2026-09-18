import api from '../../../shared/api/axios';
import type { Quiz, Question, CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto } from '../types';

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  const { data } = await api.get('/quizzes');
  return data.data || data;
};

export const fetchQuiz = async (id: string): Promise<Quiz> => {
  const { data } = await api.get(`/quizzes/${id}`);
  return data.data || data;
};

export const createQuiz = async (dto: CreateQuizDto): Promise<Quiz> => {
  const { data } = await api.post('/quizzes', dto);
  return data.data || data;
};

export const updateQuiz = async (id: string, dto: UpdateQuizDto): Promise<Quiz> => {
  const { data } = await api.patch(`/quizzes/${id}`, dto);
  return data.data || data;
};

export const deleteQuiz = async (id: string): Promise<void> => {
  await api.delete(`/quizzes/${id}`);
};

export const createQuestion = async (quizId: string, dto: CreateQuestionDto): Promise<Question> => {
  const { data } = await api.post(`/quizzes/${quizId}/questions`, dto);
  return data.data || data;
};

export const updateQuestion = async (quizId: string, qId: string, dto: UpdateQuestionDto): Promise<Question> => {
  const { data } = await api.patch(`/quizzes/${quizId}/questions/${qId}`, dto);
  return data.data || data;
};

export const deleteQuestion = async (quizId: string, qId: string): Promise<void> => {
  await api.delete(`/quizzes/${quizId}/questions/${qId}`);
};

export const linkQuestions = async (quizId: string, questionIds: string[]): Promise<void> => {
  await api.post(`/quizzes/${quizId}/questions/link`, { questionIds });
};
