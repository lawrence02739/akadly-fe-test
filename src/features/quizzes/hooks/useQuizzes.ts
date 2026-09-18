import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchQuizzes, fetchQuiz, createQuiz, updateQuiz, deleteQuiz, 
  createQuestion, updateQuestion, deleteQuestion, linkQuestions
} from '../api/quizzes.api';
import type { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto } from '../types';

export const useQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: fetchQuizzes,
  });
};

export const useQuiz = (id: string) => {
  return useQuery({
    queryKey: ['quiz', id],
    queryFn: () => fetchQuiz(id),
    enabled: !!id,
  });
};

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuizDto) => createQuiz(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateQuizDto }) => updateQuiz(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.id] });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, dto }: { quizId: string; dto: CreateQuestionDto }) => createQuestion(quizId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, qId, dto }: { quizId: string; qId: string; dto: UpdateQuestionDto }) => updateQuestion(quizId, qId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, qId }: { quizId: string; qId: string }) => deleteQuestion(quizId, qId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useLinkQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, questionIds }: { quizId: string; questionIds: string[] }) => linkQuestions(quizId, questionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

