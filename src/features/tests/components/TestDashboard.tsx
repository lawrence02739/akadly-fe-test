import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Unlink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTests, useDeleteTest, useUnlinkCourse } from '../hooks/useTests';
import { TestCard } from './TestCard';
import {
  TestStatus,
  TestDifficulty,
  type TestFilters,
  type Test,
} from '../types';

interface DeleteConflict {
  message: string;
  references: string[];
  testId: string;
}

export const TestDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [deleteTargetTest, setDeleteTargetTest] = useState<Test | null>(null);
  const [deleteConflict, setDeleteConflict] = useState<DeleteConflict | null>(null);

  const queryFilters: TestFilters = {
    search: search.trim() || undefined,
    status: statusFilter !== 'all' ? (statusFilter as TestStatus) : undefined,
    difficulty: difficultyFilter !== 'all' ? (difficultyFilter as TestDifficulty) : undefined,
    page,
    pageSize,
  };

  const { data, isLoading } = useTests(queryFilters);
  const deleteMutation = useDeleteTest();
  const unlinkMutation = useUnlinkCourse();

  const tests = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleDelete = async (test: Test) => {
    setDeleteTargetTest(test);
    setDeleteConflict(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetTest) return;
    try {
      await deleteMutation.mutateAsync(deleteTargetTest.id);
      toast.success('Assessment deleted');
      setDeleteTargetTest(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDeleteConflict({
          testId: deleteTargetTest.id,
          message:
            err.response.data?.message ||
            'Cannot delete test because it is linked to course modules.',
          references: err.response.data?.references || [],
        });
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete test');
      }
    }
  };

  const handleUnlinkAndDelete = async () => {
    if (!deleteConflict) return;
    try {
      await unlinkMutation.mutateAsync(deleteConflict.testId);
      await deleteMutation.mutateAsync(deleteConflict.testId);
      toast.success('Unlinked from course and assessment deleted');
      setDeleteConflict(null);
      setDeleteTargetTest(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unlink and delete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Test Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build and manage formal tests, mock exams, and proctored certification assessments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/partner/test-studio/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus size={16} />
          <span>Create New Test</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by test name, subject..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Status:</span>
            {['all', 'DRAFT', 'PUBLISHED'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  statusFilter === s
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty:</span>
            {['all', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficultyFilter(d);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  difficultyFilter === d
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 space-y-3"
            >
              <div className="h-36 bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <BookOpen size={40} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No assessments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== 'all' || difficultyFilter !== 'all'
              ? 'Try adjusting your search query or filter selections.'
              : 'Start by creating your first test assessment.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/partner/test-studio/new')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Create Assessment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onClick={() => navigate(`/partner/test-studio/${test.id}/details`)}
              onDelete={() => handleDelete(test)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} assessments
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetTest && !deleteConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={20} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Delete Assessment?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{deleteTargetTest.title}"</strong>?
                This action soft-deletes the assessment from the test library.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetTest(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={confirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 409 Conflict Modal (Linked to Course) */}
      {deleteConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Unlink size={20} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Cannot Delete Linked Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{deleteConflict.message}</p>
              {deleteConflict.references && deleteConflict.references.length > 0 && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-2xs text-left font-mono text-slate-600 max-h-24 overflow-y-auto">
                  {deleteConflict.references.map((r, i) => (
                    <div key={i}>• {r}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConflict(null);
                  setDeleteTargetTest(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={unlinkMutation.isPending || deleteMutation.isPending}
                onClick={handleUnlinkAndDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {unlinkMutation.isPending ? 'Unlinking...' : 'Unlink and Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
