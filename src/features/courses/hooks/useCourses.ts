import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCourse, getCourse, listCourses, updateCourse, deleteCourse } from '../api/courses.api';

export const useListCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: listCourses,
  });
};

export const useGetCourse = (id?: string) => {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => getCourse(id!),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => updateCourse(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
