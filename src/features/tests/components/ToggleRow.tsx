import React from 'react';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  disabledReason,
}) => {
  return (
    <div
      className={`flex items-start justify-between py-3 border-b border-slate-100 last:border-b-0 transition-opacity ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={disabled && disabledReason ? disabledReason : undefined}
    >
      <div className="pr-4 select-none">
        <label
          className={`text-sm font-medium ${
            disabled ? 'text-slate-400' : 'text-slate-800 cursor-pointer'
          }`}
          onClick={() => !disabled && onChange(!checked)}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
        )}
        {disabled && disabledReason && (
          <p className="text-2xs text-amber-600 mt-1 italic">{disabledReason}</p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
          disabled ? 'cursor-not-allowed' : ''
        } ${checked ? 'bg-[#005963]' : 'bg-slate-200'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
