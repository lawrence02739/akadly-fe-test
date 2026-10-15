import { useRef, useState } from 'react';
import {
  Upload,
  Volume2,
  FileText,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { MediaAsset } from '../types';
import { useReplaceMediaFile } from '../hooks/useMediaLibrary';
import { ALL_MEDIA_ACCEPT_STRING } from '../constants';
import { presignUpload, putFileToStorage } from '../api/media-library.api';
import { extractMediaMetadataFromFile } from '../utils/mediaFile';

interface Props {
  asset: MediaAsset;
  onTimeSeek?: (seconds: number) => void;
  mediaRef?: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>;
}

export function MediaPreview({ asset, mediaRef }: Props) {
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(0);

  const { mutateAsync: replaceFile } = useReplaceMediaFile();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsReplacing(true);
      setReplaceProgress(10);

      const clientMeta = await extractMediaMetadataFromFile(file);
      setReplaceProgress(25);

      const presign = await presignUpload({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        purpose: 'library',
      });
      setReplaceProgress(40);

      await putFileToStorage(presign.uploadUrl, file, (pct) => {
        setReplaceProgress(40 + Math.round(pct * 0.5));
      });

      await replaceFile({
        id: asset.id,
        data: {
          fileKey: presign.fileKey,
          fileUrl: presign.fileUrl,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          metadata: {
            durationSeconds: clientMeta.durationSeconds ?? null,
            width: clientMeta.width ?? null,
            height: clientMeta.height ?? null,
          },
        },
      });

      setReplaceProgress(100);
    } catch {
      // handled by hook
    } finally {
      setIsReplacing(false);
      setReplaceProgress(0);
      e.target.value = '';
    }
  };

  return (
    <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Player content */}
      <div className="w-full flex items-center justify-center min-h-[320px] max-h-[500px] bg-slate-950">
        {asset.type === 'VIDEO' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={asset.fileUrl}
            controls
            className="w-full max-h-[480px] object-contain"
            playsInline
          />
        ) : asset.type === 'AUDIO' ? (
          <div className="w-full p-8 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg">
              <Volume2 className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">{asset.title}</p>
              <p className="text-xs text-slate-400 mt-1">{asset.fileName}</p>
            </div>
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={asset.fileUrl}
              controls
              className="w-full max-w-md"
            />
          </div>
        ) : asset.type === 'IMAGE' ? (
          <img
            src={asset.fileUrl ? asset.fileUrl.split('?')[0] : asset.fileUrl}
            alt={asset.title}
            className="w-full max-h-[480px] object-contain p-2"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('?')) {
                target.src = target.src.split('?')[0];
              }
            }}
          />
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-900/30 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{asset.fileName}</p>
              <p className="text-xs text-slate-400 mt-1">
                Document preview is best viewed directly
              </p>
            </div>
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Document
            </a>
          </div>
        )}
      </div>

      {/* Floating Replace File Button */}
      <div className="absolute top-3 right-3 z-10">
        <input
          ref={replaceFileInputRef}
          type="file"
          accept={ALL_MEDIA_ACCEPT_STRING}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => replaceFileInputRef.current?.click()}
          disabled={isReplacing}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 rounded-lg text-xs font-medium transition-all shadow-md"
        >
          {isReplacing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Replacing ({replaceProgress}%)...
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              Replace File
            </>
          )}
        </button>
      </div>
    </div>
  );
}
