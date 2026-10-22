import { useMutation, useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import {
  fetchTests,
  fetchTest,
  createTest,
  updateTest,
  updateTestSettings,
  publishTest,
  unpublishTest,
  deleteTest,
  linkCourse,
  unlinkCourse,
  addTestQuestion,
  importTestQuestions,
  reorderTestQuestions,
  updateTestPlacement,
  editTestQuestionContent,
  removeTestQuestion,
} from '../api/tests.api';
import type {
  CreateTestDto,
  UpdateTestDto,
  UpdateTestSettingsDto,
  LinkCourseDto,
  ImportQuestionsDto,
  ReorderQuestionsDto,
  UpdatePlacementDto,
  MutationEffect,
  TestFilters,
} from '../types';

export const applyMutationEffects = (
  queryClient: QueryClient,
  testId: string,
  effects?: MutationEffect[],
) => {
  queryClient.invalidateQueries({ queryKey: ['test', testId] });
  queryClient.invalidateQueries({ queryKey: ['tests'] });
  if (!effects) return;
  for (const e of effects) {
    if (e.collection === 'tenant_questions') {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    } else if (e.collection === 'tenant_course_nodes') {
      queryClient.invalidateQueries({ queryKey: ['course-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['course-structure'] });
    }
  }
};

export const useTests = (params?: TestFilters) => {
  return useQuery({
    queryKey: ['tests', params],
    queryFn: () => fetchTests(params),
  });
};

export const useTest = (id?: string) => {
  return useQuery({
    queryKey: ['test', id],
    queryFn: () => fetchTest(id!),
    enabled: Boolean(id && id !== 'new'),
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTestDto) => createTest(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.setQueryData(['test', data.id], data);
    },
  });
};

export const useUpdateTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTestDto }) =>
      updateTest(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.setQueryData(['test', variables.id], data);
    },
  });
};

export const useUpdateTestSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTestSettingsDto }) =>
      updateTestSettings(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['test', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });
};

export const usePublishTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishTest(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.setQueryData(['test', id], data);
    },
  });
};

export const useUnpublishTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unpublishTest(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.setQueryData(['test', id], data);
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

export const useLinkCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: LinkCourseDto }) =>
      linkCourse(id, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.setQueryData(['test', variables.id], data);
      queryClient.invalidateQueries({ queryKey: ['course-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['course-structure'] });
    },
  });
};

export const useUnlinkCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unlinkCourse(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.setQueryData(['test', id], data);
      queryClient.invalidateQueries({ queryKey: ['course-nodes'] });
      queryClient.invalidateQueries({ queryKey: ['course-structure'] });
    },
  });
};

// ────────────────────────────────────────────────────────────────────────────
// Builder Mutations Hooks
// ────────────────────────────────────────────────────────────────────────────

export const useAddTestQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      dto,
    }: {
      testId: string;
      dto: Record<string, any>;
    }) => addTestQuestion(testId, dto),
    onSuccess: (result, variables) => {
      applyMutationEffects(queryClient, variables.testId, result.effects);
    },
  });
};

export const useImportTestQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      dto,
    }: {
      testId: string;
      dto: ImportQuestionsDto;
    }) => importTestQuestions(testId, dto),
    onSuccess: (result, variables) => {
      applyMutationEffects(queryClient, variables.testId, result.effects);
    },
  });
};

export const useReorderTestQuestions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      dto,
    }: {
      testId: string;
      dto: ReorderQuestionsDto;
    }) => reorderTestQuestions(testId, dto),
    onSuccess: (result, variables) => {
      applyMutationEffects(queryClient, variables.testId, result.effects);
    },
  });
};

export const useUpdateTestPlacement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      questionId,
      dto,
    }: {
      testId: string;
      questionId: string;
      dto: UpdatePlacementDto;
    }) => updateTestPlacement(testId, questionId, dto),
    onSuccess: (result, variables) => {
      applyMutationEffects(queryClient, variables.testId, result.effects);
    },
  });
};

export const useEditTestQuestionContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      questionId,
      dto,
      scope,
    }: {
      testId: string;
      questionId: string;
      dto: Record<string, any>;
      scope?: 'THIS_TEST' | 'EVERYWHERE';
    }) => editTestQuestionContent(testId, questionId, dto, scope),
    onSuccess: (result, variables) => {
      applyMutationEffects(queryClient, variables.testId, result.effects);
    },
  });
};

export const useRemoveTestQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      questionId,
      deleteFromBank,
    }: {
      testId: string;
      questionId: string;
      deleteFromBank?: boolean;
    }) => removeTestQuestion(testId, questionId, deleteFromBank),
    onSuccess: (result, variables) => {
      applyMutationEffects(queryClient, variables.testId, result.effects);
    },
  });
};
