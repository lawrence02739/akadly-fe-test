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
import { formatBytes, formatDuration } from '../utils/format';

interface Props {
  asset: MediaAsset;
  usageCount: number;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onLinkCourse?: (asset: MediaAsset) => void;
  onDownload?: (asset: MediaAsset) => void;
  onDelete?: (asset: MediaAsset) => void;
  isPickerMode?: boolean;
  onChoose?: (asset: MediaAsset) => void;
}

export function MediaCard({
  asset,
  usageCount,
  isSelected = false,
  onToggleSelect,
  onLinkCourse,
  onDownload,
  onDelete,
  isPickerMode = false,
  onChoose,
}: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    if (isPickerMode && onChoose) {
      onChoose(asset);
    } else {
      navigate(`/partner/media-library/${asset.id}`);
    }
  };

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Media Preview */}
      <div
        className="relative cursor-pointer overflow-hidden rounded-t-xl"
        onClick={handleCardClick}
      >
        <MediaThumb asset={asset} size="lg" />

        {/* Checkbox (visible when selected or on hover) */}
        {onToggleSelect && !isPickerMode && (
          <div
            className={`absolute top-2.5 left-2.5 transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(asset.id);
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer shadow-sm"
            />
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-2.5 right-2.5">
          <MediaTypeBadge type={asset.type} />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4
              onClick={handleCardClick}
              className="text-sm font-semibold text-slate-900 line-clamp-1 cursor-pointer hover:text-primary-600 transition-colors"
              title={asset.title}
            >
              {asset.title}
            </h4>

            {/* Menu button */}
            {!isPickerMode && (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
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
          </div>

          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {asset.fileName}
          </p>

          {/* Category & Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {asset.category ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                {asset.category.name}
              </span>
            ) : null}
            {asset.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60"
              >
                #{tag}
              </span>
            ))}
            {asset.tags.length > 2 && (
              <span className="text-[10px] text-slate-400">
                +{asset.tags.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Bottom meta row */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>{formatBytes(asset.sizeBytes)}</span>
            {asset.metadata.durationSeconds ? (
              <>
                <span className="text-slate-300">•</span>
                <span>{formatDuration(asset.metadata.durationSeconds)}</span>
              </>
            ) : null}
          </div>

          {/* Usage badge */}
          {usageCount > 0 ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
              title={`Used in ${usageCount} location(s)`}
            >
              <BookOpen className="w-3 h-3" />
              {usageCount} {usageCount === 1 ? 'course' : 'courses'}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">Unused</span>
          )}
        </div>
      </div>
    </div>
  );
}
