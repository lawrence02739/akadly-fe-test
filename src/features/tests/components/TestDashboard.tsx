import React, { useState } from 'react';
import { Search, Plus, X, AlertCircle } from 'lucide-react';
import { useTests, useDeleteTest } from '../hooks/useTests';

interface DeleteError {
  message: string;
  references: string[];
}
import { TestCard } from './TestCard';
import { TestSettingsModal } from './TestSettingsModal';

interface TestDashboardProps {
  onOpenTest: (id: string) => void;
  onEditSettings: (id: string) => void;
}

export const TestDashboard: React.FC<TestDashboardProps> = ({ onOpenTest, onEditSettings }) => {
  const { data: tests, isLoading } = useTests();
  const deleteMutation = useDeleteTest();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'live' | 'closed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<DeleteError | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteTestId) {
      setDeleteError(null);
      deleteMutation.mutate(deleteTestId, {
        onSuccess: () => setDeleteTestId(null),
        onError: (err: any) => {
          if (err.response?.status === 409) {
            setDeleteError({
              message: err.response.data.message || 'Cannot delete test because it is referenced.',
              references: err.response.data.references || []
            });
          } else {
            alert('Failed to delete test');
          }
        }
      });
    }
  };

  const deletingTest = (tests || []).find((t) => t.id === deleteTestId);

  if (isLoading) {
    return <div className="qs-view"><div className="empty-state"><p>Loading live tests...</p></div></div>;
  }

  const getStatus = (test: any) => {
    if (test.status === 'DRAFT') return 'draft';
    const now = new Date();
    const from = new Date(test.availableFrom);
    const till = new Date(test.availableTill);
    if (now < from) return 'scheduled';
    if (now > till) return 'closed';
    return 'live';
  };

  const filteredTests = (tests || []).filter(test => {
    if (search && !test.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all') {
      const status = getStatus(test);
      if (filter !== status) return false;
    }
    return true;
  });

  return (
    <div className="qs-view">
      <div className="dash-head">
        <div>
          <h1>Live Tests</h1>
          <p>Create and manage scheduled assessments with time limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} style={{ marginRight: 4 }} /> New live test
        </button>
      </div>

      <div className="dash-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search live tests..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {(['all', 'draft', 'scheduled', 'live', 'closed'] as const).map(f => (
            <button 
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="empty-state">
          <h3>No tests found</h3>
          <p>You don't have any live tests matching these filters.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Create your first test
          </button>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredTests.map(test => (
            <TestCard key={test.id} test={test} onClick={() => onOpenTest(test.id)} onEditSettings={() => onEditSettings(test.id)} onDelete={() => setDeleteTestId(test.id)} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <TestSettingsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={onOpenTest}
        />
      )}

      {deleteTestId && deletingTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { setDeleteTestId(null); setDeleteError(null); } }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Delete Test</h2>
              <button onClick={() => { setDeleteTestId(null); setDeleteError(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {deleteError ? (
                <div className="space-y-4">
                  <div className="flex gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-700 m-0 text-sm">Cannot Delete</p>
                      <p className="mt-1 text-sm text-rose-600 leading-relaxed">{deleteError.message}</p>
                    </div>
                  </div>
                  {deleteError.references.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Linked to Course Nodes:</p>
                      <ul className="space-y-2">
                        {deleteError.references.map((ref, i) => (
                          <li key={i} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-slate-500">
                    To delete, first remove this test from all linked course nodes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600">Are you sure you want to permanently delete this test?</p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl border-l-4 border-l-rose-500 italic text-slate-700 font-medium line-clamp-3">
                    "{deletingTest.title}"
                  </div>
                  <p className="text-sm text-slate-500 font-medium">This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80">
              <button onClick={() => { setDeleteTestId(null); setDeleteError(null); }} className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                {deleteError ? 'Close' : 'Cancel'}
              </button>
              {!deleteError && (
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
