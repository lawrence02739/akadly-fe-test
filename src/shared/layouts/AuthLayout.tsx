// import { ReactNode } from 'react';

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex w-full font-sans bg-white">
      {/* LEFT PANEL - Hidden on small screens, 50% width on large screens */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#07080B] h-screen sticky top-0 flex-col overflow-hidden relative p-12">
        {/* Background Gradients to match the SVG glow */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        {/* Header / Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-bold text-xl tracking-wide">AKADLY</span>
        </div>

        {/* Center Composition - Floating Glassmorphism Cards */}
        <div className="flex-1 flex items-center justify-center relative z-10 w-full mt-12 mb-12">
          <div className="relative w-full max-w-md aspect-square">
            {/* Background Card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 aspect-[4/3] rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden translate-y-4 -rotate-6 opacity-60">
              <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-contain opacity-50" alt="Background Element" />
            </div>
            {/* Middle Card */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] aspect-[4/3] rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-2xl overflow-hidden translate-y-8 rotate-3 opacity-80">
              <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-contain opacity-60" alt="Middle Element" />
            </div>
            {/* Foreground Main Card */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full aspect-[4/3] rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
              <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-contain" alt="Foreground Element" />
            </div>
          </div>
        </div>

        {/* Footer / Quote */}
        <div className="relative z-10 mt-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-1 bg-white rounded-full"></div>
            <div className="w-2 h-1 bg-white/30 rounded-full"></div>
            <div className="w-2 h-1 bg-white/30 rounded-full"></div>
          </div>
          <h3 className="text-white text-2xl font-semibold leading-snug max-w-md">
            "Space, light, and structured order are the things that men need just as much as they need bread or a place to sleep."
          </h3>
        </div>
      </div>

      {/* RIGHT PANEL - Scrollable Form Area */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col relative overflow-y-auto">
        {/* Language Selector */}
        <div className="absolute top-8 right-8 z-10">
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            EN
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content Centered */}
        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
