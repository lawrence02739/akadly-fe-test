import React from "react";
import type { PaginationMeta } from "../api/pagination";

export interface PaginationProps {
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  className = "",
}) => {
  if (!pagination || pagination.total === 0) {
    return null;
  }

  const from = (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-3 text-xs text-slate-500 ${className}`}
    >
      <div>
        Showing <span className="font-medium text-slate-700">{from}</span> to{" "}
        <span className="font-medium text-slate-700">{to}</span> of{" "}
        <span className="font-medium text-slate-700">{pagination.total}</span> results
      </div>

      <div className="flex items-center gap-3">
        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange?.(pagination.page - 1)}
            className="rounded border border-slate-200 px-2.5 py-1 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-medium text-slate-700">
            Page {pagination.page} of {Math.max(1, pagination.totalPages)}
          </span>
          <button
            type="button"
            disabled={!pagination.hasNext}
            onClick={() => onPageChange?.(pagination.page + 1)}
            className="rounded border border-slate-200 px-2.5 py-1 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
