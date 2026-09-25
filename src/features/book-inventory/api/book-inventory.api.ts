import api from '../../../shared/api/axios';
import type {
  AdjustStockDto,
  Book,
  CreateBookDto,
  ListBooksParams,
  PaginatedBooksResponse,
  UpdateBookDto,
} from '../types';

export const listBooks = async (params: ListBooksParams = {}): Promise<PaginatedBooksResponse> => {
  const { data } = await api.get('/books', { params });
  return data.data ?? data;
};

export const getBook = async (id: string): Promise<Book> => {
  const { data } = await api.get(`/books/${id}`);
  return data.data ?? data;
};

export const createBook = async (dto: CreateBookDto): Promise<Book> => {
  const { data } = await api.post('/books', dto);
  return data.data ?? data;
};

export const updateBook = async (id: string, dto: UpdateBookDto): Promise<Book> => {
  const { data } = await api.patch(`/books/${id}`, dto);
  return data.data ?? data;
};

export const adjustStock = async (id: string, dto: AdjustStockDto): Promise<Book> => {
  const { data } = await api.patch(`/books/${id}/stock`, dto);
  return data.data ?? data;
};

export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};

export const listCategories = async (): Promise<string[]> => {
  const { data } = await api.get('/books/categories');
  return data.data ?? data;
};

export const exportBooksCsv = async (): Promise<void> => {
  const response = await api.get('/books/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'books.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
