import { ExternalLink, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import type { MediaAsset, MediaType } from '../types';
import { MediaThumb } from './MediaThumb';
import { MediaTypeBadge } from './MediaTypeBadge';
import { formatBytes, formatDuration } from '../utils/format';

interface SelectedMediaProps {
  assetId?: string;
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  durationSeconds?: number | null;
  mediaType?: MediaType;
  title?: string;
  onChangeMedia?: () => void;
  onDetach?: () => void;
}

export function SelectedMediaCard({
  assetId,
  fileUrl,
  fileName,
  mimeType,
  sizeBytes,
  durationSeconds,
  mediaType,
  title,
  onChangeMedia,
  onDetach,
}: SelectedMediaProps) {
  // Infer correct media type if not explicitly set or if mismatched
  const effectiveMediaType: MediaType = (() => {
    const cleanMime = (mimeType || '').toLowerCase();
    const cleanName = (fileName || fileUrl || '').toLowerCase();

    if (
      cleanMime.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(cleanName)
    ) {
      return 'IMAGE';
    }
    if (
      cleanMime.startsWith('audio/') ||
      /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(cleanName)
    ) {
      return 'AUDIO';
    }
    if (
      cleanMime === 'application/pdf' ||
      /\.(pdf|docx?|pptx?|xlsx?|txt)$/i.test(cleanName)
    ) {
      return 'DOCUMENT';
    }
    if (
      cleanMime.startsWith('video/') ||
      /\.(mp4|webm|ogg|mov|mkv)$/i.test(cleanName)
    ) {
      return 'VIDEO';
    }

    if (mediaType && ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(mediaType)) {
      return mediaType;
    }

    return 'VIDEO';
  })();

  // Construct a minimal MediaAsset object for MediaThumb
  const dummyAsset: MediaAsset = {
    id: assetId || '',
    tenantId: '',
    title: title || fileName || 'Selected Media',
    description: null,
    type: effectiveMediaType,
    status: 'ACTIVE',
    category: null,
    subject: null,
    topicTag: null,
    tags: [],
    fileKey: '',
    fileUrl,
    fileName: fileName || 'file',
    mimeType: mimeType || '',
    sizeBytes: sizeBytes || 0,
    metadata: {
      durationSeconds: durationSeconds ?? null,
    },
    extractedText: { status: 'NONE' },
    transcript: { status: 'NONE' },
    uploadedBy: { id: '', name: '', email: '' },
    createdAt: '',
    updatedAt: '',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-800">
            Attached Media Asset
          </span>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Library
          </span>
        </div>

        {assetId && (
          <a
            href={`/partner/media-library/${assetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            <span>View in Library</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="flex items-start gap-3.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <MediaThumb asset={dummyAsset} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-slate-900 truncate">
              {title || fileName}
            </h4>
            <MediaTypeBadge type={effectiveMediaType} showIcon={false} />
          </div>

          <p className="text-[11px] text-slate-500 truncate mt-0.5">
            {fileName}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            {sizeBytes ? <span>{formatBytes(sizeBytes)}</span> : null}
            {durationSeconds ? (
              <>
                <span>•</span>
                <span>{formatDuration(durationSeconds)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onDetach && (
          <button
            type="button"
            onClick={onDetach}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Detach
          </button>
        )}

        {onChangeMedia && (
          <button
            type="button"
            onClick={onChangeMedia}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors bg-white shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Change Media
          </button>
        )}
      </div>
    </div>
  );
}
