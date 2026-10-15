import { LayoutGrid, List } from 'lucide-react';

interface Props {
  view: 'table' | 'grid';
  onChange: (view: 'table' | 'grid') => void;
}

export function ViewToggle({ view, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange('table')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          view === 'table'
            ? 'bg-white text-slate-900 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Table view"
      >
        <List className="w-4 h-4" />
        Table
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          view === 'grid'
            ? 'bg-white text-slate-900 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
        Grid
      </button>
    </div>
  );
}
