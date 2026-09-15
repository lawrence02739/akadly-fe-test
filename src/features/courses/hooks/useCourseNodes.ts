import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourseNode, deleteCourseNode, fetchCourseNodes, updateCourseNode } from '../api/course-nodes.api';
import type { CreateCourseNodeDto, UpdateCourseNodeDto } from '../types';

export const useCourseNodes = (courseId: string) => {
  return useQuery({
    queryKey: ['courseNodes', courseId],
    queryFn: () => fetchCourseNodes(courseId),
    enabled: !!courseId,
  });
};

export const useCreateCourseNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, dto }: { courseId: string; dto: CreateCourseNodeDto }) =>
      createCourseNode(courseId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseNodes', variables.courseId] });
    },
  });
};

export const useUpdateCourseNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, nodeId, dto }: { courseId: string; nodeId: string; dto: UpdateCourseNodeDto }) =>
      updateCourseNode(courseId, nodeId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseNodes', variables.courseId] });
    },
  });
};

export const useDeleteCourseNode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, nodeId }: { courseId: string; nodeId: string }) =>
      deleteCourseNode(courseId, nodeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courseNodes', variables.courseId] });
    },
  });
};
