import React from 'react';
import { useBrandingDraftStore } from '../store/brandingDraft.store';
import { getFontFamilyCss } from '../utils/fontStacks';
import { getContrastingTextColor } from '../utils/contrast';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  PlayCircle,
  Star,
  Clock,
  Users,
} from 'lucide-react';

export const StudentExperiencePreview: React.FC = () => {
  const {
    slug,
    displayName,
    primaryColor,
    accentColor,
    fontFamily,
    loginHeadline,
    loginMessage,
    logoUrl,
  } = useBrandingDraftStore();

  const fontCss = getFontFamilyCss(fontFamily);
  const primaryButtonTextColor = getContrastingTextColor(primaryColor);
  const accentTextColor = getContrastingTextColor(accentColor);

  return (
    <div className="w-full max-w-[480px] bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 sticky top-8">
      {/* Live Badge Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: primaryColor }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: primaryColor }}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Portal Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
          <span>{slug || 'academy'}.akadly.com</span>
        </div>
      </div>

      {/* Simulated Browser / App Frame */}
      <div
        className="bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 text-slate-800 transition-all duration-300"
        style={{ fontFamily: fontCss }}
      >
        {/* Top Navbar */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-7 max-w-[120px] object-contain"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryButtonTextColor,
                }}
              >
                {(displayName || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-sm tracking-tight text-slate-900 truncate max-w-[160px]">
              {displayName || 'Your Academy'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-default">
              Catalog
            </span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              JD
            </div>
          </div>
        </div>

        {/* Hero Banner Section */}
        <div
          className="relative px-6 py-7 text-white overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #1e1b4b 100%)`,
          }}
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 bg-white blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold w-fit bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Learner Dashboard</span>
            </div>

            <h3 className="text-xl font-extrabold tracking-tight leading-snug line-clamp-2">
              {loginHeadline || 'Welcome to your academy'}
            </h3>

            <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
              {loginMessage || 'A little progress. A world of possibilities.'}
            </p>

            <div className="flex items-center gap-2.5 mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: '#ffffff',
                  color: primaryColor,
                }}
              >
                Continue Learning
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                Browse All
              </button>
            </div>
          </div>
        </div>

        {/* Content Preview Cards */}
        <div className="p-5 bg-slate-50 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Enrolled Courses</span>
            <span
              className="text-[11px] font-bold cursor-default"
              style={{ color: primaryColor }}
            >
              View 4 Courses
            </span>
          </div>

          {/* Sample Course Card */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm flex flex-col gap-2.5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    Modern Full-Stack & AI Systems
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> 18h left
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> 1.2k learners
                    </span>
                  </div>
                </div>
              </div>

              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0"
                style={{
                  backgroundColor: accentColor,
                  color: accentTextColor,
                }}
              >
                Active
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-600 font-medium mb-1">
                <span>Progress: Module 4 of 12</span>
                <span className="font-bold">64%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: '64%',
                    backgroundColor: primaryColor,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.9 (184 reviews)</span>
              </div>
              <div
                className="flex items-center gap-1 text-[11px] font-bold"
                style={{ color: primaryColor }}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Resume Lesson</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate / Accreditation Pill */}
        <div className="px-5 py-3 bg-white border-t border-slate-100 flex items-center gap-2.5 text-slate-600 text-[11px]">
          <GraduationCap
            className="w-4 h-4 shrink-0"
            style={{ color: primaryColor }}
          />
          <span className="truncate">
            Official certificate issued by{' '}
            <strong className="text-slate-900">{displayName || 'Academy'}</strong>
          </span>
        </div>
      </div>

      <div className="text-[11px] text-slate-400/90 text-center flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>Live preview dynamically reflects your brand colors & font.</span>
      </div>
    </div>
  );
};
