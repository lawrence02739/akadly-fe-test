
import { useSearchParams, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useNotificationPermissions } from '../hooks/useNotificationPermissions';
import { useTemplates, useTemplateSummary } from '../hooks/useNotificationTemplates';
import { TemplateStatCards } from '../components/TemplateStatCards';
import { TemplateInfoCards } from '../components/TemplateInfoCards';
import { TemplateFilters } from '../components/TemplateFilters';
import { TemplateTable } from '../components/TemplateTable';
import { TemplateType, TemplateState } from '../types';

export default function NotificationTemplatesPage() {
  const { canManage } = useNotificationPermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'ALL') as 'ALL' | TemplateType;
  const state = (searchParams.get('state') || 'ALL') as 'ALL' | TemplateState;

  const { data: summary, isLoading: isSummaryLoading } = useTemplateSummary();
  const { data: listData, isLoading: isListLoading } = useTemplates({
    page,
    limit: 20,
    q: q || undefined,
    type: type !== 'ALL' ? type : undefined,
    state: state !== 'ALL' ? state : undefined,
  });



  const updateFilters = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '' || v === 'ALL') {
        newParams.delete(k);
      } else {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleDuplicate = async (_id: string) => {
    // In a real app we'd trigger a dialog or use a ref hook to duplicate
  };

  const handleArchive = async (_id: string) => {
    // In a real app we'd trigger a confirm dialog
  };

  const totalPages = listData ? Math.ceil(listData.total / listData.limit) : 1;

  return (
    <div className="bg-slate-50 min-h-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage reusable system and custom messages with safe fallbacks and versioning.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <Link
                to="/partner/notifications/templates/new"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                New custom template
              </Link>
            )}
          </div>
        </div>

        <TemplateStatCards summary={summary} isLoading={isSummaryLoading} />
        <TemplateInfoCards />

        <div className="space-y-4">
          <TemplateFilters
            search={q}
            type={type}
            state={state}
            onSearchChange={(v) => updateFilters({ q: v })}
            onTypeChange={(v) => updateFilters({ type: v })}
            onStateChange={(v) => updateFilters({ state: v })}
          />

          <TemplateTable
            items={listData?.items ?? []}
            isLoading={isListLoading}
            canManage={canManage}
            onDuplicate={handleDuplicate}
            onArchive={handleArchive}
          />

          {listData && listData.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-sm text-slate-500">
                Published versions are immutable. Editing starts a new draft.
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
