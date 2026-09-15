import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMasterData, createMasterData } from '../api/master-data.api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchMasterData('CATEGORY'),
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => fetchMasterData('TAG'),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createMasterData('CATEGORY', name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createMasterData('TAG', name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
