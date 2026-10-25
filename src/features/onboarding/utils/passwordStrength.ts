export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Too weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  hasMinLength: boolean;
  hasLetter: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 12;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  let score = 0;
  if (password.length >= 8) score++;
  if (hasMinLength) score++;
  if (hasLetter && hasDigit) score++;
  if (hasSpecial && password.length >= 12) score++;

  let label: PasswordStrengthResult['label'] = 'Too weak';
  let color = 'bg-slate-200';

  if (!password) {
    label = 'Too weak';
    color = 'bg-slate-200';
  } else if (score <= 1) {
    label = 'Weak';
    color = 'bg-rose-500';
  } else if (score === 2) {
    label = 'Medium';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'Strong';
    color = 'bg-emerald-500';
  } else {
    label = 'Very Strong';
    color = 'bg-emerald-600';
  }

  const isValid = hasMinLength && hasLetter && hasDigit;

  return {
    score,
    label,
    color,
    hasMinLength,
    hasLetter,
    hasDigit,
    hasSpecial,
    isValid,
  };
}
