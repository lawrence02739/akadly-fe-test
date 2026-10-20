import { useState, useCallback } from "react";
import { DEFAULT_PAGE_SIZE } from "../api/pagination";

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState<number>(options.initialPage ?? 1);
  const [pageSize, setPageSize] = useState<number>(
    options.initialPageSize ?? DEFAULT_PAGE_SIZE,
  );

  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setPage(options.initialPage ?? 1);
    setPageSize(options.initialPageSize ?? DEFAULT_PAGE_SIZE);
  }, [options.initialPage, options.initialPageSize]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    onPageChange,
    onPageSizeChange,
    reset,
  };
}
