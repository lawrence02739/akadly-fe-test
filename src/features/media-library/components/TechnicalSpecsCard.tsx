import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { MediaAsset } from '../types';
import { formatBytes, formatDateTime, formatDuration } from '../utils/format';
import { useDownloadMediaUrl } from '../hooks/useMediaLibrary';

interface Props {
  asset: MediaAsset;
}

export function TechnicalSpecsCard({ asset }: Props) {
  const [copiedKey, setCopiedKey] = useState(false);
  const { mutate: downloadMedia, isPending: isDownloading } =
    useDownloadMediaUrl();

  const handleCopyKey = () => {
    navigator.clipboard.writeText(asset.fileKey || asset.fileUrl || '');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const resolution =
    asset?.metadata?.resolution ||
    (asset?.metadata?.width && asset?.metadata?.height
      ? `${asset.metadata.width} × ${asset.metadata.height}`
      : null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Technical Specifications
        </h4>
        <button
          type="button"
          onClick={() => downloadMedia(asset.id)}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
        <div>
          <dt className="text-slate-400">Format</dt>
          <dd className="font-medium text-slate-800 mt-0.5">
            {asset.mimeType || asset.fileName.split('.').pop()?.toUpperCase()}
          </dd>
        </div>

        <div>
          <dt className="text-slate-400">File Size</dt>
          <dd className="font-medium text-slate-800 mt-0.5">
            {formatBytes(asset.sizeBytes)}
          </dd>
        </div>

        {resolution && (
          <div>
            <dt className="text-slate-400">Dimensions</dt>
            <dd className="font-medium text-slate-800 mt-0.5">{resolution}</dd>
          </div>
        )}

        {asset.metadata?.durationSeconds ? (
          <div>
            <dt className="text-slate-400">Duration</dt>
            <dd className="font-medium text-slate-800 mt-0.5">
              {formatDuration(asset.metadata.durationSeconds)}
            </dd>
          </div>
        ) : null}

        {asset.metadata?.frameRate ? (
          <div>
            <dt className="text-slate-400">Frame Rate</dt>
            <dd className="font-medium text-slate-800 mt-0.5">
              {asset.metadata.frameRate} fps
            </dd>
          </div>
        ) : null}

        {asset.metadata?.bitRate ? (
          <div>
            <dt className="text-slate-400">Bit Rate</dt>
            <dd className="font-medium text-slate-800 mt-0.5">
              {Math.round(asset.metadata.bitRate / 1000)} kbps
            </dd>
          </div>
        ) : null}

        {asset.metadata?.audioCodec ? (
          <div>
            <dt className="text-slate-400">Audio Codec</dt>
            <dd className="font-medium text-slate-800 mt-0.5">
              {asset.metadata.audioCodec}
            </dd>
          </div>
        ) : null}

        {asset.metadata?.pageCount ? (
          <div>
            <dt className="text-slate-400">Pages</dt>
            <dd className="font-medium text-slate-800 mt-0.5">
              {asset.metadata.pageCount}
            </dd>
          </div>
        ) : null}

        <div className="col-span-2 pt-2 border-t border-slate-100">
          <dt className="text-slate-400">Uploaded By</dt>
          <dd className="font-medium text-slate-800 mt-0.5">
            {asset.uploadedBy?.name || 'Tenant User'}
            {asset.uploadedBy?.email ? (
              <span className="text-slate-400 font-normal">
                {' '}({asset.uploadedBy.email})
              </span>
            ) : null}
          </dd>
        </div>

        <div className="col-span-2">
          <dt className="text-slate-400">Added</dt>
          <dd className="font-medium text-slate-800 mt-0.5">
            {formatDateTime(asset.createdAt)}
          </dd>
        </div>

        <div className="col-span-2 pt-2 border-t border-slate-100">
          <dt className="text-slate-400 flex items-center justify-between">
            <span>Storage Key</span>
            <button
              type="button"
              onClick={handleCopyKey}
              className="text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 text-[11px]"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </dt>
          <dd className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2 rounded mt-1 break-all border border-slate-200/60">
            {asset.fileKey}
          </dd>
        </div>
      </dl>
    </div>
  );
}
