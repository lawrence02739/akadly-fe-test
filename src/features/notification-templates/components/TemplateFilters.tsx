import { Search } from 'lucide-react';
import { TemplateType, TemplateState } from '../types';

interface TemplateFiltersProps {
  search: string;
  type: TemplateType | 'ALL';
  state: TemplateState | 'ALL';
  onSearchChange: (value: string) => void;
  onTypeChange: (value: TemplateType | 'ALL') => void;
  onStateChange: (value: TemplateState | 'ALL') => void;
}

export function TemplateFilters({
  search,
  type,
  state,
  onSearchChange,
  onTypeChange,
  onStateChange,
}: TemplateFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or event"
          className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          className="rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as any)}
        >
          <option value="ALL">All types</option>
          <option value={TemplateType.SYSTEM}>System</option>
          <option value={TemplateType.CUSTOM}>Custom</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          value={state}
          onChange={(e) => onStateChange(e.target.value as any)}
        >
          <option value="ALL">All states</option>
          <option value={TemplateState.ENABLED}>Enabled</option>
          <option value={TemplateState.DRAFT}>Draft</option>
          <option value={TemplateState.DISABLED}>Disabled</option>
          <option value={TemplateState.ARCHIVED}>Archived</option>
        </select>
      </div>
    </div>
  );
}
