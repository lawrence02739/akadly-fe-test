import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../../shared/layouts/AuthLayout';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on load
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newOtp[index + i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus next empty or last input
      const nextEmptyIndex = newOtp.findIndex(val => val === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const code = otp.join('');
    
    if (code.length === 6) {
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: code }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Verification failed. Please try again.');
        }

        navigate('/partner/courses');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">Verify your email</h1>
        <p className="text-slate-500 mb-8">
          We've sent a 6-digit verification code to <span className="font-medium text-slate-900">partner@akadly.com</span>. Please enter it below.
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-8">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6} // Allow paste of full code
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-slate-900 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0C5A69]/20 focus:border-[#0C5A69] transition-all shadow-sm"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otp.join('').length !== 6 || isLoading}
            className="w-full bg-[#0C5A69] hover:bg-[#084855] disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(12,90,105,0.2)] hover:shadow-[0_6px_20px_rgba(12,90,105,0.23)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? 'Verifying...' : 'Verify & Complete Registration'}
          </button>
        </form>

        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-slate-600">
            Didn't receive the code?{' '}
            <button type="button" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none">
              Resend now
            </button>
          </p>
          <p className="text-sm">
            <Link to="/signup" className="text-slate-400 hover:text-slate-600 font-medium flex items-center justify-center gap-2 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to sign up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
