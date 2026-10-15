import { Video, Headphones, FileText, Image as ImageIcon } from 'lucide-react';
import type { MediaType } from '../types';

interface Props {
  type: MediaType;
  showIcon?: boolean;
  className?: string;
}

export function MediaTypeBadge({
  type,
  showIcon = true,
  className = '',
}: Props) {
  switch (type) {
    case 'VIDEO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          {showIcon && <Video className="w-3.5 h-3.5 text-blue-600" />}
          Video
        </span>
      );
    case 'AUDIO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 ${className}`}
        >
          {showIcon && <Headphones className="w-3.5 h-3.5 text-purple-600" />}
          Audio
        </span>
      );
    case 'DOCUMENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
        >
          {showIcon && <FileText className="w-3.5 h-3.5 text-amber-600" />}
          Document
        </span>
      );
    case 'IMAGE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          {showIcon && <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />}
          Image
        </span>
      );
    default:
      return null;
  }
}
