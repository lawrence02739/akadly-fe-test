import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TestDashboard } from './components/TestDashboard';
import { TestBuilder } from './components/TestBuilder';
import { TestSettingsModal } from './components/TestSettingsModal';
import { useTests, useUpdateTest } from './hooks/useTests';
import '../quizzes/assets/quiz-studio.css';

export default function TestStudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const testIdParam = searchParams.get('testId');
  const [view, setView] = useState<'dashboard' | 'builder'>(testIdParam ? 'builder' : 'dashboard');
  const [activeTestId, setActiveTestId] = useState<string | null>(testIdParam);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);

  const { data: tests = [] } = useTests();
  const updateMutation = useUpdateTest();

  useEffect(() => {
    if (testIdParam) {
      if (view !== 'builder') {
        setView('builder');
        setActiveTestId(testIdParam);
      }
    } else {
      if (view !== 'dashboard') {
        setView('dashboard');
        setActiveTestId(null);
      }
    }
  }, [testIdParam, view]);

  const handleOpenBuilder = (id: string) => {
    setSearchParams({ testId: id });
    setActiveTestId(id);
    setView('builder');
  };

  const handleBackToDashboard = () => {
    setSearchParams({});
    setActiveTestId(null);
    setView('dashboard');
  };

  const handleOpenNewTest = () => {
    setEditingTestId(null);
    setSettingsModalOpen(true);
  };

  const handleEditSettings = (id: string) => {
    setEditingTestId(id);
    setSettingsModalOpen(true);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    updateMutation.mutate({ id, dto: { status: newStatus as any } });
  };

  const editingTest = editingTestId ? tests.find(t => t.id === editingTestId) : null;
  const activeTest = activeTestId ? tests.find(t => t.id === activeTestId) : null;

  return (
    <div className="quiz-studio-root max-w-7xl mx-auto w-full h-full flex flex-col">

      <div className="topbar-actions">
        {activeTest && (
          <>
            <span className={`status-pill ${activeTest.status.toLowerCase()}`}>
              {activeTest.status}
            </span>
            <button
              className="btn btn-sm"
              onClick={() => handleToggleStatus(activeTest.id, activeTest.status)}
              disabled={updateMutation.isPending}
            >
              {activeTest.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
            </button>
          </>
        )}
      </div>

      <div className="qs-main">
        {view === 'dashboard' ? (
          <TestDashboard
            onOpenTest={(id) => {
              if (id !== 'new') {
                handleOpenBuilder(id);
              } else {
                handleOpenNewTest();
              }
            }}
            onEditSettings={handleEditSettings}
          />
        ) : (
          activeTestId && (
            <TestBuilder
              testId={activeTestId}
              onBack={handleBackToDashboard}
              onEditSettings={handleEditSettings}
            />
          )
        )}
      </div>

      {settingsModalOpen && (
        <TestSettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          test={editingTest}
          onSuccess={(newTestId) => {
            if (!editingTestId) {
              handleOpenBuilder(newTestId);
            }
          }}
        />
      )}
    </div>
  );
}
