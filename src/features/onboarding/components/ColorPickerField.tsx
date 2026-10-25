import React from 'react';

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  presetColors?: string[];
  helperText?: string;
}

const DEFAULT_PRESETS = [
  '#4F46E5', // Indigo (Default)
  '#2AA399', // Emerald/Teal (Figma Accent)
  '#0EA5E9', // Sky Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#10B981', // Mint
  '#0F172A', // Slate Dark
];

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  presetColors = DEFAULT_PRESETS,
  helperText,
}) => {
  const handleHexInput = (raw: string) => {
    let clean = raw.trim();
    if (!clean.startsWith('#')) {
      clean = `#${clean}`;
    }
    onChange(clean);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {helperText && (
          <span className="text-xs text-slate-400">{helperText}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Color Swatch / Native Picker */}
        <div className="relative w-10 h-10 rounded-xl border border-slate-300 shadow-2xs overflow-hidden shrink-0 cursor-pointer">
          <input
            type="color"
            value={value.startsWith('#') && value.length === 7 ? value : '#4F46E5'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full rounded-xl transition-colors"
            style={{ backgroundColor: value }}
          />
        </div>

        {/* Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => handleHexInput(e.target.value)}
            maxLength={7}
            placeholder="#4F46E5"
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all uppercase"
          />
        </div>
      </div>

      {/* Preset Swatches */}
      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Presets:</span>
        {presetColors.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
              value.toUpperCase() === hex.toUpperCase()
                ? 'ring-2 ring-indigo-500 ring-offset-1 border-white'
                : 'border-slate-300'
            }`}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>
    </div>
  );
};
