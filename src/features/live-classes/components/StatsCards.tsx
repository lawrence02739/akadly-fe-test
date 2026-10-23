import React from 'react';
import { Calendar, Radio, AlertOctagon, XCircle } from 'lucide-react';
import type { LiveClassStatsResponse } from '../types';

interface StatsCardsProps {
  stats?: LiveClassStatsResponse;
  isLoading?: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-white rounded-xl border border-slate-200 p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const sThisWeek = stats?.sessionsThisWeek ?? { total: 0, upcoming: 0, completed: 0 };
  const sLiveNow = stats?.liveNow ?? { count: 0, joined: 0, enrolled: 0 };
  const sConflicts = stats?.instructorConflicts ?? { count: 0, needsAssignment: 0 };
  const sCancelled = stats?.cancelled ?? { count: 0, creditsIssued: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Sessions this week */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Sessions this week</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{sThisWeek.total}</div>
        <div className="text-xs text-slate-500 mt-1">
          <span className="font-medium text-slate-700">{sThisWeek.upcoming} upcoming</span> · {sThisWeek.completed} completed
        </div>
      </div>

      {/* 2. Live now */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Live now</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">{sLiveNow.count}</div>
        <div className="text-xs text-slate-500 mt-1">
          {sLiveNow.joined} of {sLiveNow.enrolled} joined
        </div>
      </div>

      {/* 3. Instructor conflicts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Instructor conflicts</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-bold ${sConflicts.count > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
          {sConflicts.count}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {sConflicts.needsAssignment > 0 ? `${sConflicts.needsAssignment} need assignment` : 'No unassigned classes'}
        </div>
      </div>

      {/* 4. Cancelled */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium">Cancelled</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{sCancelled.count}</div>
        <div className="text-xs text-slate-500 mt-1">
          {sCancelled.creditsIssued} Credits issued
        </div>
      </div>
    </div>
  );
};
