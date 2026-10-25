import React from 'react';
import type { BrandFont } from '../types/onboarding.types';
import { FONT_OPTIONS } from '../utils/fontStacks';
import { Check } from 'lucide-react';

interface FontSelectProps {
  value: BrandFont;
  onChange: (font: BrandFont) => void;
}

export const FontSelect: React.FC<FontSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-800">
        Typography & Font Family
      </label>
      <p className="text-xs text-slate-500 mb-1">
        Choose the typography style that matches your academy brand identity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FONT_OPTIONS.map((f) => {
          const isSelected = f.key === value;

          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onChange(f.key)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/25 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">{f.label}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div
                className="text-base text-slate-800 tracking-tight leading-snug font-semibold my-1"
                style={{ fontFamily: f.fontFamilyCss }}
              >
                Aa Bb Gg 123
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {f.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
