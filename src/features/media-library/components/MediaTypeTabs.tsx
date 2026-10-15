import {
  Video,
  Headphones,
  FileText,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import type { MediaType } from '../types';

interface TabConfig {
  id: MediaType | 'ALL';
  label: string;
  icon: typeof Layers;
}

const TABS: TabConfig[] = [
  { id: 'ALL', label: 'All Media', icon: Layers },
  { id: 'VIDEO', label: 'Videos', icon: Video },
  { id: 'AUDIO', label: 'Audio', icon: Headphones },
  { id: 'DOCUMENT', label: 'Documents', icon: FileText },
  { id: 'IMAGE', label: 'Images', icon: ImageIcon },
];

interface Props {
  selected: MediaType | 'ALL';
  onChange: (tab: MediaType | 'ALL') => void;
  allowedTypes?: MediaType[];
}

export function MediaTypeTabs({ selected, onChange, allowedTypes }: Props) {
  const visibleTabs = allowedTypes
    ? TABS.filter((t) => t.id === 'ALL' || allowedTypes.includes(t.id as MediaType))
    : TABS;

  return (
    <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isSelected = selected === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              isSelected
                ? 'border-primary-600 text-primary-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
