import api from '../../../shared/api/axios';
import type { FormSnapshot } from '../types/form-builder.types';

export interface FormsListParams {
  page: number;
  limit: number;
  search: string;
  sort: 'newest' | 'oldest';
}

export interface FormsListResult {
  items: FormSnapshot[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const listForms = async (params: FormsListParams): Promise<FormsListResult> => {
  const { data } = await api.get('/form-builder/forms', { params });
  return data.data;
};

export const getForm = async (id: string): Promise<FormSnapshot> => {
  const { data } = await api.get(`/form-builder/forms/${id}`);
  return data.data;
};

export const deleteForm = async (id: string): Promise<void> => {
  await api.delete(`/form-builder/forms/${id}`);
};
