import React from 'react';
import { Search } from 'lucide-react';
import { InstructorType } from '../types/instructor.types';

interface InstructorFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  specialty: string;
  onSpecialtyChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  instructorType: string;
  onInstructorTypeChange: (val: string) => void;
  specialties: string[];
}

export const InstructorFilters: React.FC<InstructorFiltersProps> = ({
  search,
  onSearchChange,
  specialty,
  onSpecialtyChange,
  status,
  onStatusChange,
  instructorType,
  onInstructorTypeChange,
  specialties,
}) => {
  const tabs = [
    { label: 'All Instructors', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Invited', value: 'invited' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Draft', value: 'draft' },
  ];

  return (
    <div className="space-y-4">
      {/* Segmented Status Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-[#0C5A69] text-[#0C5A69]'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by instructor name or email..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
          />
        </div>

        {/* Specialty / Subject filter */}
        <select
          value={specialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          aria-label="Filter by subject"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
        >
          <option value="">All Subjects</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Instructor Type filter */}
        <select
          value={instructorType}
          onChange={(e) => onInstructorTypeChange(e.target.value)}
          aria-label="Filter by instructor type"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
        >
          <option value="">All Instructor Types</option>
          <option value={InstructorType.FULL_TIME}>Full-time</option>
          <option value={InstructorType.PART_TIME}>Part-time</option>
          <option value={InstructorType.CONTRACT_BASED}>Contract-based</option>
          <option value={InstructorType.GUEST}>Guest</option>
        </select>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>
  );
};
