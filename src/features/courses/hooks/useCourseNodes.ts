import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourseNode, deleteCourseNode, fetchCourseNodes, updateCourseNode } from '../api/course-nodes.api';
import { fetchCourseStructure } from '../api/courses.api';
import type { CreateCourseNodeDto, UpdateCourseNodeDto } from '../types';

export interface FlatCourseNode {
  id: string;
  title: string;
  type: string;
  indent: number;
}

export const flattenCourseStructure = (tree: any): FlatCourseNode[] => {
  let list = tree;
  if (!Array.isArray(list) && Array.isArray(list?.data)) {
    list = list.data;
  }
  if (!Array.isArray(list)) list = [];

  const flat: FlatCourseNode[] = [];
  const flatten = (nodes: any[], depth: number = 0) => {
    nodes.forEach((n) => {
      flat.push({
        id: String(n.id || n._id),
        title: n.title,
        type: n.type,
        indent: depth,
      });
      if (n.children && Array.isArray(n.children)) {
        flatten(n.children, depth + 1);
      }
    });
  };
  flatten(list);
  return flat;
};

export const useCourseStructure = (courseId?: string) => {
  return useQuery({
    queryKey: ['courseStructure', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const tree = await fetchCourseStructure(courseId);
      return flattenCourseStructure(tree);
    },
    enabled: !!courseId,
  });
};

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
      queryClient.invalidateQueries({ queryKey: ['courseStructure', variables.courseId] });
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
      queryClient.invalidateQueries({ queryKey: ['courseStructure', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
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
      queryClient.invalidateQueries({ queryKey: ['courseStructure', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
    },
  });
};
