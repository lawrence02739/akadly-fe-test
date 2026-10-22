import React, { useState } from 'react';
import { Plus, X, Globe } from 'lucide-react';

interface AllowedUrlsInputProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export const cleanHostname = (raw: string): string => {
  let val = raw.trim().toLowerCase();
  if (!val) return '';
  // Strip protocol
  val = val.replace(/^[a-z]+:\/\//i, '');
  // Strip path and query
  val = val.split('/')[0].split('?')[0].split('#')[0];
  // Strip port
  val = val.split(':')[0];
  return val;
};

export const AllowedUrlsInput: React.FC<AllowedUrlsInputProps> = ({
  urls = [],
  onChange,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    const cleaned = cleanHostname(input);
    if (!cleaned) return;

    // Basic domain validation
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned)) {
      setError('Please enter a valid hostname (e.g. example.com)');
      return;
    }

    if (urls.includes(cleaned)) {
      setError('Hostname already added.');
      return;
    }

    if (urls.length >= 50) {
      setError('Maximum 50 allowed URLs reached.');
      return;
    }

    onChange([...urls, cleaned]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (item: string) => {
    onChange(urls.filter((u) => u !== item));
  };

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Globe size={15} />
          </div>
          <input
            type="text"
            value={input}
            disabled={disabled}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. wikipedia.org or github.com"
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          type="button"
          disabled={disabled || !input.trim()}
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      {error && <p className="text-2xs text-rose-500 font-medium">{error}</p>}

      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
          {urls.map((u) => (
            <span
              key={u}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-700 shadow-2xs"
            >
              <span>{u}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(u)}
                  className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-2xs text-slate-400 italic">No external URLs allowed yet. All external domains will be blocked in lockdown.</p>
      )}
    </div>
  );
};
