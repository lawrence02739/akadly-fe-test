import React, { useState } from 'react';
import { Search, Plus, X, AlertCircle } from 'lucide-react';
import { useQuizzes, useDeleteQuiz } from '../hooks/useQuizzes';
import { QuizCard } from './QuizCard';

interface DeleteError {
  message: string;
  references: string[];
}


interface QuizDashboardProps {
  onOpenBuilder: (quizId: string) => void;
  onOpenNewQuiz: () => void;
  onEditSettings: (quizId: string) => void;
}

export const QuizDashboard: React.FC<QuizDashboardProps> = ({
  onOpenBuilder,
  onOpenNewQuiz,
  onEditSettings,
}) => {
  const { data: quizzes = [], isLoading } = useQuizzes();
  const deleteMutation = useDeleteQuiz();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'PUBLISHED' | 'DRAFT'>('all');
  
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<DeleteError | null>(null);

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || q.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteConfirm = () => {
    if (deleteQuizId) {
      setDeleteError(null);
      deleteMutation.mutate(deleteQuizId, {
        onSuccess: () => setDeleteQuizId(null),
        onError: (err: any) => {
          if (err.response?.status === 409) {
            setDeleteError({
              message: err.response.data.message || 'Cannot delete quiz because it is referenced.',
              references: err.response.data.references || []
            });
          } else {
            alert('Failed to delete quiz');
          }
        }
      });
    }
  };

  const deletingQuiz = quizzes.find((q) => q.id === deleteQuizId);

  return (
    <div className="qs-view">
      <div className="dash-head">
        <div>
          <h1>Your quizzes</h1>
          <p>Build, organize, and grade assessments across every course.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenNewQuiz}>
          <Plus size={15} strokeWidth={2.4} />
          New quiz
        </button>
      </div>

      <div className="dash-toolbar">
        <div className="search-box">
          <Search size={14} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search quizzes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-chip ${filter === 'PUBLISHED' ? 'active' : ''}`}
          onClick={() => setFilter('PUBLISHED')}
        >
          Published
        </button>
        <button
          className={`filter-chip ${filter === 'DRAFT' ? 'active' : ''}`}
          onClick={() => setFilter('DRAFT')}
        >
          Draft
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">
          <p>Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onClick={() => onOpenBuilder(quiz.id)}
              onEditSettings={() => onEditSettings(quiz.id)}
              onDelete={() => setDeleteQuizId(quiz.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No quizzes {search || filter !== 'all' ? 'found' : 'yet'}</h3>
          <p>
            {search || filter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Create your first quiz to start building a question bank.'}
          </p>
          {(!search && filter === 'all') && (
            <button className="btn btn-primary" onClick={onOpenNewQuiz}>
              + New quiz
            </button>
          )}
        </div>
      )}

      {deleteQuizId && deletingQuiz && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { setDeleteQuizId(null); setDeleteError(null); } }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Delete Quiz</h2>
              <button onClick={() => { setDeleteQuizId(null); setDeleteError(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
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
                    To delete, first remove this quiz from all linked course nodes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600">Are you sure you want to permanently delete this quiz?</p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl border-l-4 border-l-rose-500 italic text-slate-700 font-medium line-clamp-3">
                    "{deletingQuiz.title}"
                  </div>
                  <p className="text-sm text-slate-500 font-medium">This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80">
              <button onClick={() => { setDeleteQuizId(null); setDeleteError(null); }} className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
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
