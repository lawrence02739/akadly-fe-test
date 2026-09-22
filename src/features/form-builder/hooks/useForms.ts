import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listForms, getForm, deleteForm } from '../api/forms.api';
import type { FormsListParams } from '../api/forms.api';

export const useListForms = (params: FormsListParams) => {
  return useQuery({
    queryKey: ['forms', params],
    queryFn: () => listForms(params),
  });
};

export const useGetForm = (id?: string) => {
  return useQuery({
    queryKey: ['forms', id],
    queryFn: () => getForm(id!),
    enabled: !!id,
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
};
