import type { TemplateSummary } from '../types';
import { Layers, CheckCircle2, FileEdit, Archive } from 'lucide-react';

interface TemplateStatCardsProps {
  summary?: TemplateSummary;
  isLoading: boolean;
}

export function TemplateStatCards({ summary, isLoading }: TemplateStatCardsProps) {
  const stats = [
    {
      title: 'Templates',
      value: summary?.total ?? 0,
      description: 'System and custom messages',
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Enabled',
      value: summary?.enabled ?? 0,
      description: 'Published · automatic triggers active',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Drafts',
      value: summary?.drafts ?? 0,
      description: 'Not available for production delivery',
      icon: FileEdit,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
    },
    {
      title: 'Archived',
      value: summary?.archived ?? 0,
      description: 'Retained for version history',
      icon: Archive,
      color: 'text-slate-400',
      bgColor: 'bg-slate-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100" />
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-6 w-12 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-500">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
