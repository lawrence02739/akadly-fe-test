import { Video, Headphones, FileText, Image as ImageIcon } from 'lucide-react';
import type { MediaAsset } from '../types';
import { formatDuration } from '../utils/format';

interface Props {
  asset: MediaAsset;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDuration?: boolean;
}

export function MediaThumb({
  asset,
  size = 'md',
  className = '',
  showDuration = true,
}: Props) {
  const sizeClasses = {
    sm: 'w-10 h-10 rounded-md',
    md: 'w-16 h-12 rounded-lg',
    lg: 'w-full aspect-video rounded-xl',
  };

  const hasDuration =
    asset.metadata.durationSeconds && asset.metadata.durationSeconds > 0;

  const cleanUrl = asset.fileUrl ? asset.fileUrl.split('?')[0] : '';

  if (asset.type === 'IMAGE' && (cleanUrl || asset.fileUrl)) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/80 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={cleanUrl || asset.fileUrl}
          alt={asset.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src.includes('?')) {
              target.src = target.src.split('?')[0];
            }
          }}
        />
      </div>
    );
  }

  if (asset.type === 'VIDEO') {
    return (
      <div
        className={`relative overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 ${sizeClasses[size]} ${className}`}
      >
        <Video className="w-5 h-5 text-blue-400" />
        {showDuration && hasDuration && size !== 'sm' && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white leading-none">
            {formatDuration(asset.metadata.durationSeconds)}
          </span>
        )}
      </div>
    );
  }

  if (asset.type === 'AUDIO') {
    return (
      <div
        className={`relative overflow-hidden bg-purple-50 flex items-center justify-center shrink-0 border border-purple-200 ${sizeClasses[size]} ${className}`}
      >
        <Headphones className="w-5 h-5 text-purple-600" />
        {showDuration && hasDuration && size !== 'sm' && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-purple-900/80 text-[10px] font-mono text-white leading-none">
            {formatDuration(asset.metadata.durationSeconds)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200 ${sizeClasses[size]} ${className}`}
    >
      {asset.type === 'IMAGE' ? (
        <ImageIcon className="w-5 h-5 text-emerald-600" />
      ) : (
        <FileText className="w-5 h-5 text-amber-600" />
      )}
      {showDuration &&
        asset.metadata.pageCount &&
        asset.metadata.pageCount > 0 &&
        size !== 'sm' && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-900/80 text-[10px] font-medium text-white leading-none">
            {asset.metadata.pageCount}p
          </span>
        )}
    </div>
  );
}
