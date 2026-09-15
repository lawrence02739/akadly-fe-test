import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../../shared/layouts/AuthLayout';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to reset password. Please try again.');
      }

      // Success, redirect to login
      navigate('/login', { state: { message: 'Password has been successfully reset. Please login.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">Set New Password</h1>
        <p className="text-slate-500 mb-8">Please enter your new password below.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C5A69]/20 focus:border-[#0C5A69] transition-all"
                placeholder="Create a strong password"
                required
                disabled={!token}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                disabled={!token}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Must be at least 8 characters.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full bg-[#0C5A69] hover:bg-[#084855] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl mt-6 transition-all shadow-[0_4px_14px_0_rgba(12,90,105,0.2)] hover:shadow-[0_6px_20px_rgba(12,90,105,0.23)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-8 space-y-4">
          <p className="text-sm">
            <Link to="/login" className="text-slate-400 hover:text-slate-600 font-medium flex items-center justify-center gap-2 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
