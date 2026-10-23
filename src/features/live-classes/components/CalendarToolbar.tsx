import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  LayoutGrid,
  List,
  Filter,
} from 'lucide-react';
import { CalendarView } from '../types';

interface FilterOption {
  id: string;
  name: string;
}

interface CalendarToolbarProps {
  activeTab: 'calendar' | 'list';
  onTabChange: (tab: 'calendar' | 'list') => void;
  calendarView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  timezone: string;
  onTimezoneChange: (tz: string) => void;

  courses: FilterOption[];
  selectedCourseId?: string;
  onSelectCourse: (id: string | undefined) => void;

  batches: FilterOption[];
  selectedBatchId?: string;
  onSelectBatch: (id: string | undefined) => void;

  instructors: FilterOption[];
  selectedInstructorId?: string;
  onSelectInstructor: (id: string | undefined) => void;

  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Singapore',
];

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  activeTab,
  onTabChange,
  calendarView,
  onViewChange,
  title,
  onPrev,
  onNext,
  onToday,
  timezone,
  onTimezoneChange,
  courses,
  selectedCourseId,
  onSelectCourse,
  batches,
  selectedBatchId,
  onSelectBatch,
  instructors,
  selectedInstructorId,
  onSelectInstructor,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mb-6 shadow-xs space-y-3">
      {/* Top bar: Tabs, Today & Nav, View toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: View mode tab & navigation */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => onTabChange('calendar')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={onPrev}
              className="p-1.5 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-1.5 text-slate-600 hover:bg-slate-50 border-l border-slate-200 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 min-w-36">
            {title}
          </h2>
        </div>

        {/* Right: Month/Week/Day toggle & timezone */}
        <div className="flex items-center gap-2">
          {activeTab === 'calendar' && (
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => onViewChange(CalendarView.MONTH)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  calendarView === CalendarView.MONTH
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => onViewChange(CalendarView.WEEK)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  calendarView === CalendarView.WEEK
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => onViewChange(CalendarView.DAY)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  calendarView === CalendarView.DAY
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day
              </button>
            </div>
          )}

          {/* Timezone picker */}
          <div className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timezone}
              onChange={(e) => onTimezoneChange(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Row: Course, Batch, Instructor, Status */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
        <div className="flex items-center gap-1 text-slate-400 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Course Filter */}
        <select
          value={selectedCourseId ?? ''}
          onChange={(e) => onSelectCourse(e.target.value ? e.target.value : undefined)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Batch Filter */}
        <select
          value={selectedBatchId ?? ''}
          onChange={(e) => onSelectBatch(e.target.value ? e.target.value : undefined)}
          disabled={!selectedCourseId || batches.length === 0}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Instructor Filter */}
        <select
          value={selectedInstructorId ?? ''}
          onChange={(e) => onSelectInstructor(e.target.value ? e.target.value : undefined)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">All Instructors</option>
          {instructors.map((ins) => (
            <option key={ins.id} value={ins.id}>
              {ins.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onSelectStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="LIVE,UPCOMING">Live + upcoming</option>
          <option value="">All statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>
    </div>
  );
};
