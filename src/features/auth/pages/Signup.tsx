import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../../shared/layouts/AuthLayout';
import api from '../../../shared/api/axios';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await api.post('/auth/register', {
        ownerName: fullName,
        email,
        password,
        termsAccepted: true,
      });
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">Create an account</h1>
        <p className="text-slate-500 mb-8">Start your journey with Akadly today.</p>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={() => { window.location.href = 'http://localhost:3000/api/v1/auth/google'; }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C5A69]/20 focus:border-[#0C5A69] transition-all"
              placeholder="e.g. John Doe"
              required
            />
          </div>

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

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C5A69]/20 focus:border-[#0C5A69] transition-all"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Must be at least 8 characters.</p>
          </div>

          {/* Terms */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 rounded group-hover:border-[#0C5A69] transition-colors shrink-0 mt-0.5">
                <input type="checkbox" className="peer sr-only" required />
                <div className="absolute inset-0 bg-[#0C5A69] rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-slate-600 leading-snug">
                I agree to Akadly's{' '}
                <a href="#" className="font-semibold text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="font-semibold text-blue-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0C5A69] hover:bg-[#084855] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-semibold py-3.5 rounded-xl mt-6 transition-all shadow-[0_4px_14px_0_rgba(12,90,105,0.2)] hover:shadow-[0_6px_20px_rgba(12,90,105,0.23)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
