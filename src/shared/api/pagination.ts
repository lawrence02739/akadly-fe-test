export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  meta: {
    timestamp: string;
    path: string;
    requestId: string;
  };
}

export const DEFAULT_PAGE_SIZE = 20;

export function extractPaged<T>(
  envelope: ApiEnvelope<T[]>,
  fallback: { page: number; pageSize: number } = { page: 1, pageSize: DEFAULT_PAGE_SIZE },
): PagedResponse<T> {
  const items = Array.isArray(envelope.data) ? envelope.data : [];
  const pagination = envelope.pagination ?? {
    ...fallback,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / (fallback.pageSize || 1))),
    hasNext: false,
    hasPrev: false,
  };

  return {
    items,
    pagination,
  };
}
