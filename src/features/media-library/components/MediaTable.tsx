import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Link as LinkIcon,
  Download,
  Trash2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MediaAsset } from '../types';
import { MediaThumb } from './MediaThumb';
import { MediaTypeBadge } from './MediaTypeBadge';
import { formatBytes, formatDate, formatDuration } from '../utils/format';

interface Props {
  items: Array<{ asset: MediaAsset; usageCount: number } | MediaAsset>;
  selectedIds: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onLinkCourse?: (asset: MediaAsset) => void;
  onDownload?: (asset: MediaAsset) => void;
  onDelete?: (asset: MediaAsset) => void;
  isPickerMode?: boolean;
  onChoose?: (asset: MediaAsset) => void;
}

export function MediaTable({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onLinkCourse,
  onDownload,
  onDelete,
  isPickerMode = false,
  onChoose,
}: Props) {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const resolveAsset = (
    item: { asset: MediaAsset; usageCount: number } | MediaAsset,
  ): MediaAsset | null => {
    if (!item) return null;
    return 'asset' in item && item.asset ? item.asset : (item as MediaAsset);
  };

  const resolveUsage = (
    item: { asset: MediaAsset; usageCount: number } | MediaAsset,
  ): number => {
    return 'usageCount' in item && typeof item.usageCount === 'number'
      ? item.usageCount
      : 0;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSelected =
    items.length > 0 &&
    items.every((i) => {
      const a = resolveAsset(i);
      return a ? selectedIds.includes(a.id) : false;
    });
  const someSelected =
    items.some((i) => {
      const a = resolveAsset(i);
      return a ? selectedIds.includes(a.id) : false;
    }) && !allSelected;

  const handleRowClick = (asset: MediaAsset) => {
    if (isPickerMode && onChoose) {
      onChoose(asset);
    } else {
      navigate(`/partner/media-library/${asset.id}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-slate-600">No media assets found</p>
        <p className="text-xs text-slate-400 mt-1">
          Try adjusting your search or filters, or upload new files.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {onToggleSelect && !isPickerMode && (
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={() => {
                    if (allSelected) {
                      onClearSelection?.();
                    } else {
                      onSelectAll?.();
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
              </th>
            )}
            <th className="py-3 px-4">Asset</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Size</th>
            <th className="py-3 px-4">Duration</th>
            <th className="py-3 px-4">Usage</th>
            <th className="py-3 px-4">Date Added</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {items.map((item) => {
            const asset = resolveAsset(item);
            const usageCount = resolveUsage(item);
            if (!asset || !asset.id) return null;

            const isSelected = selectedIds.includes(asset.id);
            const isMenuOpen = activeMenuId === asset.id;

            return (
              <tr
                key={asset.id}
                onClick={() => handleRowClick(asset)}
                className={`group cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary-50/30 hover:bg-primary-50/50'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {onToggleSelect && !isPickerMode && (
                  <td
                    className="py-3 px-4 w-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(asset.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </td>
                )}

                {/* Asset details */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <MediaThumb asset={asset} size="md" />
                    <div className="min-w-0">
                      <div
                        className="font-medium text-slate-900 truncate max-w-xs sm:max-w-md group-hover:text-primary-600 transition-colors"
                        title={asset.title}
                      >
                        {asset.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">
                        {asset.fileName}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <MediaTypeBadge type={asset.type} />
                </td>

                {/* Category */}
                <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600">
                  {asset.category ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      {asset.category.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">—</span>
                  )}
                </td>

                {/* Size */}
                <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600">
                  {formatBytes(asset.sizeBytes)}
                </td>

                {/* Duration / Pages */}
                <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600">
                  {asset.metadata.durationSeconds
                    ? formatDuration(asset.metadata.durationSeconds)
                    : asset.metadata.pageCount
                      ? `${asset.metadata.pageCount} pages`
                      : '—'}
                </td>

                {/* Usage */}
                <td className="py-3 px-4 whitespace-nowrap text-xs">
                  {usageCount > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <BookOpen className="w-3 h-3" />
                      {usageCount} {usageCount === 1 ? 'course' : 'courses'}
                    </span>
                  ) : (
                    <span className="text-slate-400">Unused</span>
                  )}
                </td>

                {/* Date Added */}
                <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                  {formatDate(asset.createdAt)}
                </td>

                {/* Action button */}
                <td
                  className="py-3 px-4 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPickerMode ? (
                    <button
                      type="button"
                      onClick={() => onChoose?.(asset)}
                      className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      Select
                    </button>
                  ) : (
                    <div className="relative inline-block text-left" ref={menuRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(isMenuOpen ? null : asset.id)
                        }
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/partner/media-library/${asset.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            View Details
                          </button>
                          {onLinkCourse && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onLinkCourse(asset);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                            >
                              <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                              Link to Course
                            </button>
                          )}
                          {onDownload && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDownload(asset);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-400" />
                              Download
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDelete(asset);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
