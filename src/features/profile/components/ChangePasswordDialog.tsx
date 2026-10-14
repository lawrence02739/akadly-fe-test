import { Check, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useChangePasswordMutation } from '../hooks/useProfile';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordDialog({
  isOpen,
  onClose,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signOutOtherSessions, setSignOutOtherSessions] = useState(true);

  const mutation = useChangePasswordMutation();

  if (!isOpen) return null;

  // Password rules validation
  const rules = [
    { label: 'At least 8 characters', valid: newPassword.length >= 8 },
    {
      label: 'At least one uppercase letter',
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: 'At least one lowercase letter',
      valid: /[a-z]/.test(newPassword),
    },
    { label: 'At least one number', valid: /[0-9]/.test(newPassword) },
    {
      label: 'At least one special character',
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const allRulesPassed = rules.every((r) => r.valid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!allRulesPassed) {
      toast.error('Please ensure your new password satisfies all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    mutation.mutate(
      {
        currentPassword,
        newPassword,
        signOutOtherSessions,
      },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Change password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your current password and choose a strong new one.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            />
          </div>

          {/* Policy hints */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <span className="block font-semibold text-slate-700 mb-1.5">
              Password requirements:
            </span>
            <div className="space-y-1">
              {rules.map((rule, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {rule.valid ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                  <span
                    className={rule.valid ? 'text-emerald-700' : 'text-slate-500'}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="signOutOthers"
              type="checkbox"
              checked={signOutOtherSessions}
              onChange={(e) => setSignOutOtherSessions(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
            />
            <label
              htmlFor="signOutOthers"
              className="text-xs text-slate-700 cursor-pointer select-none"
            >
              Sign out my other sessions
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !allRulesPassed}
              className="rounded-lg bg-[#0C5A69] px-4 py-2 text-sm font-medium text-white hover:bg-[#0a4854] disabled:opacity-50"
            >
              {mutation.isPending ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
