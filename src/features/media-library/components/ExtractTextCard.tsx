import { useState } from 'react';
import { FileText, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import type { MediaAsset } from '../types';
import { useRequestExtraction } from '../hooks/useMediaLibrary';

interface Props {
  asset: MediaAsset;
}

export function ExtractTextCard({ asset }: Props) {
  const [copied, setCopied] = useState(false);
  const { mutate: requestExtraction, isPending } = useRequestExtraction();

  const extraction =
    asset?.extractedText ||
    (asset as any)?.textExtraction || {
      status: 'NONE',
      text: null,
    };

  const handleCopy = () => {
    if (extraction.text) {
      navigator.clipboard.writeText(extraction.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCompleted =
    (extraction.status === 'COMPLETED' || (extraction.status as string) === 'READY') &&
    Boolean(extraction.text);
  const isWaiting =
    extraction.status === 'PENDING' || isPending;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Extracted Text (OCR)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => requestExtraction(asset.id)}
            disabled={isWaiting}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isWaiting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {isCompleted ? 'Re-extract Text' : 'Extract Text'}
              </>
            )}
          </button>
        </div>
      </div>

      {isWaiting ? (
        <div className="py-8 text-center bg-amber-50/50 rounded-lg border border-dashed border-amber-200 text-xs text-amber-800 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" />
          <p className="font-medium">Text extraction in progress...</p>
          <p className="text-[11px] text-amber-600">
            This may take a moment depending on file size.
          </p>
        </div>
      ) : isCompleted ? (
        <div className="max-h-64 overflow-y-auto p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
          {extraction.text}
        </div>
      ) : (
        <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-600">
            No text extracted yet
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Extract text from this file using automated text extraction.
          </p>
        </div>
      )}
    </div>
  );
}
