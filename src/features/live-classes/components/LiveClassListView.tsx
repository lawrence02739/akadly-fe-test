import React from 'react';
import { Search, Eye, Edit2, Trash2 } from 'lucide-react';
import type { LiveClassListItem } from '../types';
import type { PaginationMeta } from '../../../shared/api/pagination';
import { Pagination } from '../../../shared/components/Pagination';
import { StatusBadge } from './StatusBadge';
import { formatDateShort, formatTimeRange } from '../utils/calendar.utils';

interface LiveClassListViewProps {
  items: LiveClassListItem[];
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  timezone: string;
  onSelectSession: (session: LiveClassListItem) => void;
  onEditSession?: (session: LiveClassListItem) => void;
  onDeleteSession?: (session: LiveClassListItem) => void;
  isLoading?: boolean;
}

export const LiveClassListView: React.FC<LiveClassListViewProps> = ({
  items,
  pagination,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  timezone,
  onSelectSession,
  onEditSession,
  onDeleteSession,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Search Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search classes by title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            <tr>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Class Title</th>
              <th className="px-4 py-3">Course · Batch</th>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3 text-center">Joined / Cap</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  Loading live classes...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No live classes found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => onSelectSession(item)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {formatDateShort(item.startsAt, timezone)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatTimeRange(item.startsAt, item.endsAt, timezone)}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium text-slate-900">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    <span className="font-medium text-slate-800">
                      {item.courseTitle}
                    </span>
                    <span className="text-slate-400"> · {item.batchName}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-slate-800">
                      {item.instructor?.name || 'Unassigned'}
                    </span>
                    {item.coInstructors.length > 0 && (
                      <span className="text-[10px] text-slate-400 block">
                        +{item.coInstructors.length} co-instructor{item.coInstructors.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center font-medium">
                    <span className="text-emerald-600">{item.joinedCount}</span>
                    <span className="text-slate-400"> / {item.capacity}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={item.displayStatus} size="sm" />
                  </td>
                  <td
                    className="px-4 py-3 whitespace-nowrap text-right space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSession(item)}
                      title="View Details"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {onEditSession && (
                      <button
                        type="button"
                        onClick={() => onEditSession(item)}
                        title="Edit Session"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteSession && (
                      <button
                        type="button"
                        onClick={() => onDeleteSession(item)}
                        title="Delete Session"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
};
