import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/questions.api';
import type { CreateQuestionDto } from '../../quizzes/types';

export const useQuestions = (filters?: api.QuestionFilters) => {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => api.fetchQuestions(filters),
  });
};

export const useQuestion = (id: string) => {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: () => api.fetchQuestion(id),
    enabled: !!id,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateQuestionDto> }) =>
      api.updateQuestion(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
};
