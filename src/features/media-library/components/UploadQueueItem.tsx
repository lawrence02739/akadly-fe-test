import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { UploadQueueItem as IUploadQueueItem } from '../hooks/useMediaUploadQueue';
import { formatBytes } from '../utils/format';
import { MediaTypeBadge } from './MediaTypeBadge';
import { resolveMediaTypeFromFileName } from '../utils/mediaFile';
import { MediaTagSelect } from './MediaTagSelect';
import { MediaCategorySelect } from './MediaCategorySelect';
import { CourseNodeSelect } from './CourseNodeSelect';

interface Props {
  item: IUploadQueueItem;
  disabled?: boolean;
  onUpdate: (patch: Partial<IUploadQueueItem>) => void;
  onRemove: () => void;
}

export function UploadQueueItem({
  item,
  disabled = false,
  onUpdate,
  onRemove,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const detectedType = resolveMediaTypeFromFileName(
    item.file.name,
    item.file.type,
  );

  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {item.status === 'SUCCESS' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : item.status === 'ERROR' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : item.status === 'QUEUED' ? (
            <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
          ) : (
            <Loader2 className="w-4 h-4 text-primary-600 animate-spin shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold text-slate-800 truncate"
                title={item.file.name}
              >
                {item.title || item.file.name}
              </span>
              {detectedType && (
                <MediaTypeBadge type={detectedType} showIcon={false} />
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {formatBytes(item.file.size)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.status !== 'SUCCESS' && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Edit details"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}

          {!disabled && item.status !== 'SUCCESS' && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-slate-400 hover:text-rose-600 rounded"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {item.status !== 'QUEUED' && item.status !== 'SUCCESS' && (
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                item.status === 'ERROR' ? 'bg-rose-500' : 'bg-primary-600'
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>
              {item.status === 'PRESIGNING'
                ? 'Preparing...'
                : item.status === 'UPLOADING'
                  ? `Uploading (${item.progress}%)...`
                  : item.status === 'REGISTERING'
                    ? 'Finalizing...'
                    : item.status === 'ERROR'
                      ? 'Error'
                      : 'Processing...'}
            </span>
          </div>
        </div>
      )}

      {item.error && (
        <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-100">
          {item.error}
        </p>
      )}

      {/* Optional Metadata Expansion */}
      {expanded && (
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={item.title}
              disabled={disabled}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={item.subject || ''}
              disabled={disabled}
              onChange={(e) => onUpdate({ subject: e.target.value })}
              placeholder="e.g. Mathematics"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="sm:col-span-2">
            <MediaCategorySelect
              label="Category"
              value={item.categoryId || ''}
              onChange={(categoryId) => onUpdate({ categoryId })}
            />
          </div>

          <div className="sm:col-span-2">
            <MediaTagSelect
              label="Tags"
              value={item.tags}
              onChange={(tags) => onUpdate({ tags })}
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <CourseNodeSelect
              courseId={item.linkCourseId || ''}
              nodeId={item.linkNodeId || ''}
              onCourseChange={(linkCourseId) => onUpdate({ linkCourseId })}
              onNodeChange={(linkNodeId) => onUpdate({ linkNodeId })}
              disabled={disabled}
              courseLabel="Link to Course (Optional)"
              nodeLabel="Link to Lesson / Node (Optional)"
            />
          </div>
        </div>
      )}
    </div>
  );
}
