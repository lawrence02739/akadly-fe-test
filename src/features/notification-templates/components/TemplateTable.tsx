import { Link } from 'react-router-dom';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { TemplateTriggerType, TemplateState } from '../types';
import type { TemplateListRow } from '../types';
import { StateBadge } from './StateBadge';
import { TypeBadge } from './TypeBadge';
import { channelsSummary } from '../utils/format';

interface TemplateTableProps {
  items: TemplateListRow[];
  isLoading: boolean;
  canManage: boolean;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}

export function TemplateTable({ items, isLoading, canManage, onDuplicate, onArchive }: TemplateTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No templates match your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Template
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Channels
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Automatic event trigger
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              State
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Version
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">{item.name}</span>
                  <span className="mt-1"><TypeBadge type={item.type} /></span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {channelsSummary(item.enabledChannels)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {item.triggerType === TemplateTriggerType.NONE ? (
                  <span className="italic text-slate-400">Not configured</span>
                ) : (
                  <span>{item.triggerEventKey || item.triggerType}</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StateBadge state={item.state} hasDraft={item.hasDraft} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {item.currentVersionLabel ? item.currentVersionLabel : <span className="italic">Draft</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    to={`/partner/notifications/templates/${item.id}`}
                    className="text-primary-600 hover:text-primary-900 font-semibold inline-flex items-center gap-1 p-2 rounded-md hover:bg-primary-50 transition-colors"
                    title={item.state === TemplateState.DRAFT ? 'Continue editing' : 'Manage template'}
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  {canManage && (
                    <div className="relative group">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div className="py-1" role="menu">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => onDuplicate(item.id)}
                          >
                            Duplicate
                          </button>
                          {item.type === 'CUSTOM' && (
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                              onClick={() => onArchive(item.id)}
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
