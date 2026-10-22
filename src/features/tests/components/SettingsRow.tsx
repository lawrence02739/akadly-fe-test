import React from 'react';

interface SettingsRowProps {
  label: string;
  subtitle: string;
  rightElement: React.ReactNode;
  disabled?: boolean;
  disabledReason?: string;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  subtitle,
  rightElement,
  disabled = false,
  disabledReason,
}) => {
  return (
    <div
      className={`flex items-start sm:items-center justify-between py-4 border-b border-slate-100 last:border-b-0 gap-4 transition-opacity ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      title={disabled && disabledReason ? disabledReason : undefined}
    >
      <div className="flex-1 pr-2">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug">{label}</h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
        {disabled && disabledReason && (
          <p className="text-2xs text-amber-600 mt-0.5 italic">{disabledReason}</p>
        )}
      </div>

      <div className="shrink-0">{rightElement}</div>
    </div>
  );
};
