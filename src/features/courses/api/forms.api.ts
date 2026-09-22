import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/api/axios';

interface Form {
  id: string;
  tenantId: string;
  title: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  responses: number;
  fields: any[];
  createdAt: string;
  updatedAt: string;
}

export const useForms = () => {
  return useQuery<Form[]>({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data } = await api.get('/forms');
      return data.data; // Unwrap the standardized API response envelope
    },
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; status?: string; fields?: any[] }) => {
      const { data } = await api.post('/forms', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; title?: string; status?: string; fields?: any[] }) => {
      const { data } = await api.patch(`/forms/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};
