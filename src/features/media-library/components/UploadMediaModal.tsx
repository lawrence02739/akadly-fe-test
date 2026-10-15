import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, X, Plus, Loader2 } from 'lucide-react';
import { useMediaUploadQueue } from '../hooks/useMediaUploadQueue';
import { UploadQueueItem } from './UploadQueueItem';
import { ALL_MEDIA_ACCEPT_STRING } from '../constants';
import type { MediaAsset } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultLinkCourseId?: string;
  onUploadComplete?: (assets: MediaAsset[]) => void;
}

export function UploadMediaModal({
  isOpen,
  onClose,
  defaultLinkCourseId,
  onUploadComplete,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    queue,
    isProcessing,
    addFiles,
    updateItemConfig,
    removeItem,
    clearCompleted,
    startUpload,
  } = useMediaUploadQueue();

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files, defaultLinkCourseId);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      addFiles(files, defaultLinkCourseId);
      e.target.value = '';
    }
  };

  const handleStartUpload = async () => {
    const uploadedAssets = await startUpload();
    if (uploadedAssets.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedAssets);
    }
  };

  const completedCount = queue.filter((i) => i.status === 'SUCCESS').length;
  const pendingCount = queue.filter(
    (i) => i.status === 'QUEUED' || i.status === 'ERROR',
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Upload Media
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload videos, audios, documents, or images to your media library
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50/50'
                : 'border-slate-300 hover:border-primary-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALL_MEDIA_ACCEPT_STRING}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              MP4, WebM, MP3, WAV, PDF, DOCX, PNG, JPG, GIF, WebP up to 2GB
            </p>
          </div>

          {/* Upload Queue */}
          {queue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Files ({queue.length})
                </span>
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={clearCompleted}
                    className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                  >
                    Clear completed
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <UploadQueueItem
                    key={item.id}
                    item={item}
                    disabled={isProcessing}
                    onUpdate={(patch) => updateItemConfig(item.id, patch)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {completedCount > 0 && (
              <span className="text-emerald-600 font-medium">
                {completedCount} uploaded.{' '}
              </span>
            )}
            {pendingCount > 0 && <span>{pendingCount} ready to upload.</span>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white transition-colors"
            >
              {completedCount > 0 && pendingCount === 0 ? 'Done' : 'Cancel'}
            </button>

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:bg-primary-400 transition-colors shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Start Upload ({pendingCount})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
