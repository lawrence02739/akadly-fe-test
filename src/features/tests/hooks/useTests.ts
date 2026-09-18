import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTests, fetchTest, createTest, updateTest, deleteTest, 
  createQuestion, updateQuestion, deleteQuestion, linkQuestions
} from '../api/tests.api';
import type { CreateTestDto, UpdateTestDto } from '../types';
import type { CreateQuestionDto, UpdateQuestionDto } from '../../quizzes/types';

export const useTests = () => {
  return useQuery({
    queryKey: ['tests'],
    queryFn: fetchTests,
  });
};

export const useTest = (id: string) => {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => fetchTest(id),
    enabled: !!id,
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTestDto) => createTest(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTestDto }) => updateTest(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['test', variables.id] });
    },
  });
};

export const useDeleteTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, dto }: { testId: string; dto: CreateQuestionDto }) => createQuestion(testId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test', variables.testId] });
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, qId, dto }: { testId: string; qId: string; dto: UpdateQuestionDto }) => updateQuestion(testId, qId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test', variables.testId] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, qId }: { testId: string; qId: string }) => deleteQuestion(testId, qId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test', variables.testId] });
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};

export const useLinkQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ testId, questionIds }: { testId: string; questionIds: string[] }) => linkQuestions(testId, questionIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test', variables.testId] });
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};
