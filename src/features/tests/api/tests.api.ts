import api from '../../../shared/api/axios';
import type {
  Test,
  CreateTestDto,
  UpdateTestDto,
  UpdateTestSettingsDto,
  LinkCourseDto,
  ImportQuestionsDto,
  ReorderQuestionsDto,
  UpdatePlacementDto,
  BuilderMutationResult,
  TestFilters,
} from '../types';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const fetchTests = async (
  params?: TestFilters,
): Promise<PaginatedResult<Test>> => {
  const { data } = await api.get('/tests', { params });
  const res = data.data || data;
  if (Array.isArray(res)) {
    return {
      items: res,
      total: res.length,
      page: 1,
      pageSize: res.length || 10,
      totalPages: 1,
    };
  }
  return res || { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
};

export const fetchTest = async (id: string): Promise<Test> => {
  const { data } = await api.get(`/tests/${id}`);
  return data.data || data;
};

export const createTest = async (dto: CreateTestDto): Promise<Test> => {
  const { data } = await api.post('/tests', dto);
  return data.data || data;
};

export const updateTest = async (
  id: string,
  dto: UpdateTestDto,
): Promise<Test> => {
  const { data } = await api.patch(`/tests/${id}`, dto);
  return data.data || data;
};

export const updateTestSettings = async (
  id: string,
  dto: UpdateTestSettingsDto,
): Promise<{ success: boolean; settings: any }> => {
  const { data } = await api.patch(`/tests/${id}/settings`, dto);
  return data.data || data;
};

export const publishTest = async (id: string): Promise<Test> => {
  const { data } = await api.post(`/tests/${id}/publish`);
  return data.data || data;
};

export const unpublishTest = async (id: string): Promise<Test> => {
  const { data } = await api.post(`/tests/${id}/unpublish`);
  return data.data || data;
};

export const deleteTest = async (id: string): Promise<void> => {
  await api.delete(`/tests/${id}`);
};

export const linkCourse = async (
  id: string,
  dto: LinkCourseDto,
): Promise<Test> => {
  const { data } = await api.post(`/tests/${id}/link-course`, dto);
  return data.data || data;
};

export const unlinkCourse = async (id: string): Promise<Test> => {
  const { data } = await api.post(`/tests/${id}/unlink-course`);
  return data.data || data;
};

// ────────────────────────────────────────────────────────────────────────────
// Builder Mutations
// ────────────────────────────────────────────────────────────────────────────

export const addTestQuestion = async (
  testId: string,
  dto: Record<string, any>,
): Promise<BuilderMutationResult> => {
  const { data } = await api.post(`/tests/${testId}/questions`, dto);
  return data.data || data;
};

export const importTestQuestions = async (
  testId: string,
  dto: ImportQuestionsDto,
): Promise<BuilderMutationResult> => {
  const { data } = await api.post(`/tests/${testId}/questions/import`, dto);
  return data.data || data;
};

export const reorderTestQuestions = async (
  testId: string,
  dto: ReorderQuestionsDto,
): Promise<BuilderMutationResult> => {
  const { data } = await api.put(`/tests/${testId}/questions/order`, dto);
  return data.data || data;
};

export const updateTestPlacement = async (
  testId: string,
  questionId: string,
  dto: UpdatePlacementDto,
): Promise<BuilderMutationResult> => {
  const { data } = await api.patch(
    `/tests/${testId}/questions/${questionId}/placement`,
    dto,
  );
  return data.data || data;
};

export const editTestQuestionContent = async (
  testId: string,
  questionId: string,
  dto: Record<string, any>,
  scope: 'THIS_TEST' | 'EVERYWHERE' = 'THIS_TEST',
): Promise<BuilderMutationResult> => {
  const { data } = await api.patch(
    `/tests/${testId}/questions/${questionId}?scope=${scope}`,
    dto,
  );
  return data.data || data;
};

export const removeTestQuestion = async (
  testId: string,
  questionId: string,
  deleteFromBank: boolean = false,
): Promise<BuilderMutationResult> => {
  const { data } = await api.delete(
    `/tests/${testId}/questions/${questionId}?deleteFromBank=${deleteFromBank}`,
  );
  return data.data || data;
};
