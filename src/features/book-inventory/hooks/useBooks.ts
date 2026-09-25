import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adjustStock,
  createBook,
  deleteBook,
  exportBooksCsv,
  getBook,
  listBooks,
  listCategories,
  updateBook,
} from '../api/book-inventory.api';
import type { AdjustStockDto, CreateBookDto, ListBooksParams, UpdateBookDto } from '../types';

const BOOKS_KEY = 'books';

export const useListBooks = (params: ListBooksParams = {}) => {
  return useQuery({
    queryKey: [BOOKS_KEY, params],
    queryFn: () => listBooks(params),
  });
};

export const useGetBook = (id?: string) => {
  return useQuery({
    queryKey: [BOOKS_KEY, id],
    queryFn: () => getBook(id!),
    enabled: !!id,
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBookDto) => createBook(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_KEY] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBookDto }) => updateBook(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOOKS_KEY, id] });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AdjustStockDto }) => adjustStock(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_KEY] });
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKS_KEY] });
    },
  });
};

export const useListCategories = () => {
  return useQuery({
    queryKey: [BOOKS_KEY, 'categories'],
    queryFn: listCategories,
  });
};

export const useExportBooksCsv = () => {
  return useMutation({
    mutationFn: exportBooksCsv,
  });
};
