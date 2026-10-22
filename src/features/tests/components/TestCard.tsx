import React, { useState } from 'react';
import {
  MoreVertical,
  Clock,
  HelpCircle,
  Award,
  Link2,
  Trash2,
  Edit,
} from 'lucide-react';
import type { Test } from '../types';

interface TestCardProps {
  test: Test;
  onClick: () => void;
  onDelete: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onClick, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusBadge = () => {
    switch (test.scheduleStatus || test.status) {
      case 'LIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SCHEDULED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'DRAFT':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getDifficultyBadge = () => {
    switch (test.difficulty) {
      case 'EASY':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'HARD':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'MEDIUM':
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer relative"
    >
      {/* Cover Image Header */}
      <div className="relative h-36 w-full bg-linear-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
        {test.coverImage?.url ? (
          <img
            src={test.coverImage.url}
            alt={test.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-tr from-slate-800 to-indigo-900 text-white/20">
            <HelpCircle size={48} strokeWidth={1.5} />
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-full text-2xs font-bold border uppercase tracking-wider shadow-2xs backdrop-blur-xs ${getStatusBadge()}`}
          >
            {test.scheduleStatus || test.status}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:bg-white flex items-center justify-center shadow-xs transition-colors"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 text-xs text-slate-700 animate-scale-up"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onClick();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Edit size={14} className="text-slate-400" />
                  <span>Open Studio</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                >
                  <Trash2 size={14} />
                  <span>Delete Assessment</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Pill */}
        {test.difficulty && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`px-2 py-0.5 rounded-md text-2xs font-bold border uppercase shadow-2xs backdrop-blur-xs ${getDifficultyBadge()}`}
            >
              {test.difficulty}
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Optional Course Link Chip */}
          {test.courseLink?.courseTitle ? (
            <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-2xs font-semibold max-w-full truncate">
              <Link2 size={11} className="shrink-0" />
              <span className="truncate">
                {test.courseLink.courseTitle}
                {test.courseLink.nodeTitle ? ` › ${test.courseLink.nodeTitle}` : ''}
              </span>
            </div>
          ) : (
            <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-2xs font-medium">
              <span>Standalone</span>
            </div>
          )}

          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {test.title}
          </h3>

          {test.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-2xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={13} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">{test.questionCount || 0} Qs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award size={13} className="text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700">
              {test.grading?.totalMarks || 0} pts
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span>{test.timeLimitMinutes || 60}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
