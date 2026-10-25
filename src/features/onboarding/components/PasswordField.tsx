import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, ShieldAlert } from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/passwordStrength';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  label = 'Create Account Password',
  placeholder = 'At least 12 characters with letters and numbers',
  required = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const strength = evaluatePasswordStrength(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span
            className={`text-xs font-bold ${
              strength.score <= 1
                ? 'text-rose-600'
                : strength.score === 2
                  ? 'text-amber-600'
                  : 'text-emerald-600'
            }`}
          >
            {strength.label}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Strength Bar */}
      {value && (
        <div className="flex gap-1.5 h-1.5 w-full mt-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                step <= strength.score ? strength.color : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Criteria Checklist */}
      <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          {strength.hasMinLength ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className={strength.hasMinLength ? 'text-slate-800 font-medium' : ''}>
            Minimum 12 characters
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {strength.hasLetter && strength.hasDigit ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span
            className={
              strength.hasLetter && strength.hasDigit
                ? 'text-slate-800 font-medium'
                : ''
            }
          >
            Letters & numbers
          </span>
        </div>
      </div>

      {value && !strength.isValid && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium mt-0.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Must be at least 12 characters and contain both letters and numbers</span>
        </div>
      )}
    </div>
  );
};
