import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useQuizzes, useDeleteQuiz } from '../hooks/useQuizzes';
import { QuizCard } from './QuizCard';
import { DeleteConfirmModal } from './DeleteConfirmModal';


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

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || q.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteConfirm = () => {
    if (deleteQuizId) {
      deleteMutation.mutate(deleteQuizId, {
        onSuccess: () => setDeleteQuizId(null),
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

      <DeleteConfirmModal
        isOpen={!!deleteQuizId}
        onClose={() => setDeleteQuizId(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
        title="Delete this quiz?"
        description={
          <>
            <b>{deletingQuiz?.title}</b> and all of its questions will be permanently removed. This can't be undone.
          </>
        }
      />
    </div>
  );
};
