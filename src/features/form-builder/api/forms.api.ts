import api from '../../../shared/api/axios';
import type { FormSnapshot } from '../types/form-builder.types';

export interface FormsListParams {
  page: number;
  limit: number;
  search: string;
  sort: 'newest' | 'oldest';
}

import type { PaginationMeta } from '../../../shared/api/pagination';

export interface FormsListResult {
  items: FormSnapshot[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pagination?: PaginationMeta;
}

export const listForms = async (params: FormsListParams): Promise<FormsListResult> => {
  const { data } = await api.get('/form-builder/forms', { params });
  const items: FormSnapshot[] = Array.isArray(data.data) ? data.data : (data.data?.items ?? []);
  const pagination = data.pagination;
  const limit = pagination?.pageSize ?? pagination?.limit ?? (params.limit || 12);
  const total = pagination?.total ?? items.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination,
    total,
    totalPages,
    page: pagination?.page ?? (params.page || 1),
    limit,
  };
};

export const getForm = async (id: string): Promise<FormSnapshot> => {
  const { data } = await api.get(`/form-builder/forms/${id}`);
  return data.data;
};

export const deleteForm = async (id: string): Promise<void> => {
  await api.delete(`/form-builder/forms/${id}`);
};
