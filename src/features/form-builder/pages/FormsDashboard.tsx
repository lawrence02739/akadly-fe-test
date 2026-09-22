import { useEffect, useState } from 'react';
import { Plus, Search, FileText, Loader2, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useListForms, useDeleteForm } from '../hooks/useForms';
import toast from 'react-hot-toast';

export default function FormsDashboard() {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timeout = window.setTimeout(() => { setSearch(searchTitle.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchTitle]);
  const { data, isLoading, isError, isFetching } = useListForms({ page, limit: 12, search, sort: sortBy });
  const deleteFormMutation = useDeleteForm();
  const forms = data?.items ?? [];

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await deleteFormMutation.mutateAsync(id);
        if (forms.length === 1 && page > 1) setPage(page - 1);
        toast.success('Form deleted successfully');
      } catch {
        toast.error('Failed to delete form');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Forms</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and configure all your custom forms and surveys
          </p>
        </div>
        <button
          onClick={() => navigate('/partner/forms/create')}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Create Form
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-4 text-sm overflow-x-auto">
        <div className="flex-1 min-w-[200px] relative px-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms..."
            className="w-full pl-8 pr-4 py-2 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </div>

        <div className="h-6 w-px bg-slate-200 shrink-0"></div>

        <select
          className="px-4 py-2 outline-none text-slate-600 bg-transparent shrink-0 border-r border-slate-200 cursor-pointer hover:bg-slate-50"
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as 'newest' | 'oldest'); setPage(1); }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
          <p>Loading forms...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <p>Failed to load forms. Please try again later.</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No forms found</h3>
          <p className="text-slate-500 mb-6">{search ? 'Try a different search term.' : 'Get started by creating your first form.'}</p>
          <button
            onClick={() => navigate('/partner/forms/create')}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {forms.map((form) => (
            <div key={form.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/partner/forms/${form.id}/edit`)}>
              <div className="aspect-video bg-slate-50 flex items-center justify-center border-b border-slate-100 relative">
                <FileText className="w-12 h-12 text-purple-200 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/partner/forms/${form.id}/edit`); }} className="p-1.5 bg-white/90 shadow-sm rounded-md text-slate-600 hover:text-purple-600 hover:bg-purple-50">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(form.id); }} className="p-1.5 bg-white/90 shadow-sm rounded-md text-slate-600 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {form.title || 'Untitled Form'}
                </h3>
                <div className="flex items-center justify-between mt-3 text-xs font-medium text-slate-500">
                  <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded-full ${form.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    {form.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {data && data.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600" aria-live="polite">
          <span>{`Showing ${(data.page - 1) * data.limit + 1}-${Math.min(data.page * data.limit, data.total)} of ${data.total} forms`}{isFetching ? ' · Updating…' : ''}</span>
          <div className="flex items-center gap-3">
            <button type="button" disabled={page <= 1 || isFetching} onClick={() => setPage(page - 1)} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50">Previous</button>
            <span>{`Page ${data.page} of ${data.totalPages}`}</span>
            <button type="button" disabled={page >= data.totalPages || isFetching} onClick={() => setPage(page + 1)} className="px-3 py-2 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
