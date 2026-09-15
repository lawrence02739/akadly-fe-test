import type { CourseNode, CreateCourseNodeDto, UpdateCourseNodeDto } from '../types';
import api from '../../../shared/api/axios';

// Since auth interceptors usually exist, we assume they are configured globally.

export const fetchCourseNodes = async (courseId: string): Promise<CourseNode[]> => {
  const { data } = await api.get(`/courses/${courseId}/nodes`);
  return data;
};

export const createCourseNode = async (courseId: string, dto: CreateCourseNodeDto): Promise<CourseNode> => {
  const { data } = await api.post(`/courses/${courseId}/nodes`, dto);
  return data;
};

export const updateCourseNode = async (courseId: string, nodeId: string, dto: UpdateCourseNodeDto): Promise<CourseNode> => {
  const { data } = await api.patch(`/courses/${courseId}/nodes/${nodeId}`, dto);
  return data;
};

export const deleteCourseNode = async (courseId: string, nodeId: string): Promise<void> => {
  await api.delete(`/courses/${courseId}/nodes/${nodeId}`);
};
