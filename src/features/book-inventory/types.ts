export type BookStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface Book {
  id: string;
  tenantId: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverImageUrl?: string;
  price: number;
  totalStock: number;
  reservedStock: number;
  /** Computed by the backend — read-only on the FE */
  availableStock: number;
  lowStockThreshold: number;
  /** Computed by the backend — read-only on the FE */
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  category: string;
  coverImageUrl?: string;
  price: number;
  totalStock: number;
  lowStockThreshold?: number;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  coverImageUrl?: string;
  price?: number;
  lowStockThreshold?: number;
}

export interface AdjustStockDto {
  delta: number;
}

export interface ListBooksParams {
  search?: string;
  category?: string;
  status?: BookStatus;
  createdAfter?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBooksResponse {
  items: Book[];
  total: number;
  page: number;
  limit: number;
}
