import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizDashboard } from '../components/QuizDashboard';
import { QuizBuilder } from '../components/QuizBuilder';
import { QuizSettingsModal } from '../components/QuizSettingsModal';
import { useQuizzes, useUpdateQuiz } from '../hooks/useQuizzes';
import '../assets/quiz-studio.css';

export default function QuizStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const quizIdParam = searchParams.get('quizId');
  const [view, setView] = useState<'dashboard' | 'builder'>(quizIdParam ? 'builder' : 'dashboard');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(quizIdParam);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const { data: quizzes = [] } = useQuizzes();
  const updateMutation = useUpdateQuiz();

  useEffect(() => {
    if (quizIdParam) {
      if (view !== 'builder') {
        setView('builder');
        setActiveQuizId(quizIdParam);
      }
    } else {
      if (view !== 'dashboard') {
        setView('dashboard');
        setActiveQuizId(null);
      }
    }
  }, [quizIdParam, view]);

  const handleOpenBuilder = (id: string) => {
    setSearchParams({ quizId: id });
    setActiveQuizId(id);
    setView('builder');
  };

  const handleBackToDashboard = () => {
    setSearchParams({});
    setActiveQuizId(null);
    setView('dashboard');
  };

  const handleOpenNewQuiz = () => {
    setEditingQuizId(null);
    setSettingsModalOpen(true);
  };

  const handleEditSettings = (id: string) => {
    setEditingQuizId(id);
    setSettingsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    updateMutation.mutate({ id, dto: { status: newStatus } });
  };

  const editingQuiz = editingQuizId ? quizzes.find(q => q.id === editingQuizId) : null;
  const activeQuiz = activeQuizId ? quizzes.find(q => q.id === activeQuizId) : null;

  return (
    <div className="quiz-studio-root max-w-7xl mx-auto w-full h-full flex flex-col">

      <div className="topbar-actions">
        {activeQuiz && (
          <>
            <span className={`status-pill ${activeQuiz.status.toLowerCase()}`}>
              {activeQuiz.status}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => handleToggleStatus(activeQuiz.id, activeQuiz.status)}
              disabled={updateMutation.isPending}
            >
              {activeQuiz.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </button>
          </>
        )}
      </div>

      <div className="qs-main">
        {view === 'dashboard' ? (
          <QuizDashboard
            onOpenBuilder={handleOpenBuilder}
            onOpenNewQuiz={handleOpenNewQuiz}
            onEditSettings={handleEditSettings}
          />
        ) : (
          activeQuizId && (
            <QuizBuilder
              quizId={activeQuizId}
              onBack={handleBackToDashboard}
              onEditSettings={handleEditSettings}
            />
          )
        )}
      </div>

      {settingsModalOpen && (
        <QuizSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          quiz={editingQuiz}
          onSuccess={(newQuizId) => {
            if (!editingQuizId) {
              handleOpenBuilder(newQuizId);
            }
          }}
        />
      )}
    </div>
  );
}
