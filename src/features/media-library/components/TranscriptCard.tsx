import { useState } from 'react';
import {
  FileAudio,
  Search,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react';
import type { MediaAsset } from '../types';
import { useRequestTranscript } from '../hooks/useMediaLibrary';
import { formatDuration } from '../utils/format';

interface Props {
  asset: MediaAsset;
  onSeek?: (seconds: number) => void;
}

interface TranscriptLine {
  seconds: number;
  speaker?: string;
  text: string;
}

export function TranscriptCard({ asset, onSeek }: Props) {
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const { mutate: requestTranscript, isPending } = useRequestTranscript();

  const transcript = asset?.transcript || {
    status: 'NONE',
    text: null,
  };

  const isCompleted =
    (transcript.status === 'COMPLETED' || (transcript.status as string) === 'READY') &&
    Boolean(transcript.text);
  const isWaiting = transcript.status === 'PENDING' || isPending;

  const handleCopy = () => {
    if (transcript.text) {
      navigator.clipboard.writeText(transcript.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Parse lines or paragraphs. If no format, generate demo lines with timestamps
  const rawText = transcript.text || '';
  const lines: TranscriptLine[] = rawText
    ? rawText
        .split('\n')
        .filter((l) => l.trim().length > 0)
        .map((line, idx) => ({
          seconds: idx * 15,
          text: line,
        }))
    : [];

  const filteredLines = search.trim()
    ? lines.filter((l) =>
        l.text.toLowerCase().includes(search.toLowerCase()),
      )
    : lines;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-slate-900">Transcript</h3>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            English (auto-generated)
          </span>
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
            onClick={() => requestTranscript(asset.id)}
            disabled={isWaiting}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isWaiting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {isCompleted ? 'Regenerate' : 'Generate Transcript'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search within transcript */}
      {isCompleted && lines.length > 0 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within transcript..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:bg-white"
          />
        </div>
      )}

      {/* Body */}
      {isWaiting ? (
        <div className="py-12 text-center bg-primary-50/40 rounded-lg border border-dashed border-primary-200 text-xs text-primary-900 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-600" />
          <p className="font-medium">Transcript generation in progress...</p>
          <p className="text-[11px] text-primary-700">
            Audio processing and speech-to-text transcription underway.
          </p>
        </div>
      ) : isCompleted ? (
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1 text-xs">
          {filteredLines.length === 0 ? (
            <p className="text-center py-6 text-slate-400">
              No matching lines found for "{search}"
            </p>
          ) : (
            filteredLines.map((line, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onSeek?.(line.seconds)}
                  className="font-mono text-[11px] text-primary-600 bg-primary-50 hover:bg-primary-100 px-1.5 py-0.5 rounded font-semibold shrink-0 transition-colors flex items-center gap-1"
                  title="Click to jump to this timestamp"
                >
                  <Clock className="w-3 h-3 opacity-60" />
                  {formatDuration(line.seconds)}
                </button>
                <p className="text-slate-700 leading-relaxed pt-0.5 flex-1">
                  {line.text}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="py-10 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-600">
            No transcript available
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            Generate an automated speech-to-text transcript with searchable
            timestamps for this audio/video asset.
          </p>
        </div>
      )}
    </div>
  );
}
