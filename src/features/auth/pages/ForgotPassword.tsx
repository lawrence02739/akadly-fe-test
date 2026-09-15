import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../shared/layouts/AuthLayout';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Failed to request password reset. Please try again.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">Reset Password</h1>
        <p className="text-slate-500 mb-8">Enter your email and we'll send you a link to reset your password.</p>

        {success ? (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <h3 className="text-green-800 font-semibold mb-2">Check your email</h3>
            <p className="text-green-700 text-sm">
              If an account exists with that email, we've sent instructions on how to reset your password.
            </p>
            <Link 
              to="/login"
              className="mt-4 inline-block font-semibold text-[#0C5A69] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C5A69]/20 focus:border-[#0C5A69] transition-all"
                placeholder="partner@akadly.com"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0C5A69] hover:bg-[#084855] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl mt-6 transition-all shadow-[0_4px_14px_0_rgba(12,90,105,0.2)] hover:shadow-[0_6px_20px_rgba(12,90,105,0.23)]"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!success && (
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
        )}
      </div>
    </AuthLayout>
  );
}
