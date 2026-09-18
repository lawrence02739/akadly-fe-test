import React, { useState } from 'react';
import { ChevronDown, Clock, List, Trash2, Edit2, Download, Plus } from 'lucide-react';
import { useTest, useDeleteTest, useDeleteQuestion, useCreateQuestion, useUpdateQuestion, useLinkQuestions } from '../hooks/useTests';
import { DeleteConfirmModal } from '../../quizzes/components/DeleteConfirmModal';
import { QuestionModal } from '../../questions/components/QuestionModal';
import { QuestionBankModal } from '../../questions/components/QuestionBankModal';
import type { CreateQuestionDto } from '../../quizzes/types';
import type { Question } from '../../quizzes/types';

interface TestBuilderProps {
  testId: string;
  onBack: () => void;
  onEditSettings: (testId: string) => void;
}

export const TestBuilder: React.FC<TestBuilderProps> = ({ testId, onBack, onEditSettings }) => {
  const { data: test, isLoading } = useTest(testId);

  const deleteTestMutation = useDeleteTest();
  const deleteQuestionMutation = useDeleteQuestion();
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const linkQuestionsMutation = useLinkQuestions();

  const [panelCollapsed, setPanelCollapsed] = useState({ settings: false, questions: false });
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [deleteTestConfirm, setDeleteTestConfirm] = useState(false);
  
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  if (isLoading) {
    return <div className="qs-view"><div className="empty-state"><p>Loading live test...</p></div></div>;
  }

  if (!test) {
    return (
      <div className="qs-view">
        <div className="empty-state">
          <h3>Test not found</h3>
          <p>It may have been deleted.</p>
          <button className="btn btn-primary" onClick={onBack}>Back to live tests</button>
        </div>
      </div>
    );
  }

  const togglePanel = (name: 'settings' | 'questions') => {
    setPanelCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const totalMarks = (test.questions || []).reduce((s, q) => s + (Number(q.mark) || 0), 0);

  const handleDeleteTest = () => {
    deleteTestMutation.mutate(test.id, {
      onSuccess: () => {
        setDeleteTestConfirm(false);
        onBack();
      }
    });
  };

  const handleDeleteQuestion = () => {
    if (deleteQuestionId) {
      deleteQuestionMutation.mutate({ testId: test.id, qId: deleteQuestionId }, {
        onSuccess: () => setDeleteQuestionId(null)
      });
    }
  };

  const handleSaveQuestion = async (dto: CreateQuestionDto) => {
    if (editingQuestion) {
      await updateQuestionMutation.mutateAsync({ testId: test.id, qId: editingQuestion.id, dto });
    } else {
      await createQuestionMutation.mutateAsync({ testId: test.id, dto });
    }
    setQuestionModalOpen(false);
  };

  const handleImportQuestions = async (questionIds: string[]) => {
    await linkQuestionsMutation.mutateAsync({ testId: test.id, questionIds });
    setBankModalOpen(false);
  };

  const renderQuestionRow = (q: Question, idx: number) => {
    let body = null;
    
    if (q.type === 'SINGLE' || q.type === 'MULTIPLE') {
      body = (q.options || []).map((o, i) => (
        <div key={i} className={`opt-line ${o.correct ? 'correct' : ''}`}>
          <span className="opt-mark">
            {o.correct && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 13 4 4L19 7"/></svg>}
          </span>
          <span>{o.text || <span style={{ color: 'var(--ink-soft)' }}>Empty option</span>}</span>
        </div>
      ));
    } else if (q.type === 'NUMERIC') {
      body = (
        <div className="opt-line correct">
          <span className="opt-mark">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 13 4 4L19 7"/></svg>
          </span>
          <span>Accepted answer: <b>{q.answer ?? '—'}</b> {q.range ? '(range enabled)' : ''}</span>
        </div>
      );
    } else if (q.type === 'MATCH') {
      body = (
        <div className="match-grid">
          {(q.colI || []).map((p, i) => (
            <React.Fragment key={i}>
              <div className="match-cell">{p.text}</div>
              <div className="match-cell">Matches {p.match || '—'}</div>
            </React.Fragment>
          ))}
        </div>
      );
    } else if (q.type === 'SUBJECTIVE') {
      body = <div className="opt-line" style={{ color: 'var(--ink-soft)' }}>Manually graded written response</div>;
    }

    return (
      <div key={q.id} className="qrow">
        <div className="qrow-head">
          <div className="qrow-head-left">
            <span className="q-index">{idx + 1}</span>
            <span className="type-badge">{q.type}</span>
            <span className="q-topic">{q.topic || 'No topic'}</span>
          </div>
          <div className="qrow-head-left">
            <span className="q-marks"><b>+{q.mark ?? 0}</b>{q.penalty ? ` · −${q.penalty}` : ''}</span>
            <div className="qrow-actions">
              <button className="icon-btn" onClick={() => { setEditingQuestion(q); setQuestionModalOpen(true); }} aria-label="Edit question">
                <Edit2 size={15} />
              </button>
              <button className="icon-btn" onClick={() => setDeleteQuestionId(q.id)} aria-label="Delete question" style={{ color: 'var(--incorrect)' }}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
        <div className="qrow-body">
          <div className="q-text">{q.text || <span style={{ color: 'var(--ink-soft)' }}>Untitled question</span>}</div>
          {body}
          <div className="explain-box">
            <b>Explanation:</b> {q.explanation || 'No explanation available'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="qs-view">
      <div className="builder-head">
        <div>
          <div className="builder-title-row">
            <h1>{test.title}</h1>
            <button className="icon-btn" onClick={() => onEditSettings(test.id)} aria-label="Edit test settings">
              <Edit2 size={15} />
            </button>
          </div>
          <div className="builder-sub">
            <span><Clock size={12} /> {test.timeLimitMinutes ? `${test.timeLimitMinutes} min limit` : 'No time limit'}</span>
            <span><List size={12} /> {totalMarks} marks total</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-danger" onClick={() => setDeleteTestConfirm(true)}>Delete test</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head" onClick={() => togglePanel('settings')}>
          <h2>Test settings</h2>
          <ChevronDown size={15} strokeWidth={2.2} className={`chev ${panelCollapsed.settings ? '' : 'open'}`} />
        </div>
        <div className={`panel-body ${panelCollapsed.settings ? 'collapsed' : ''}`}>
          <div className="form-grid">
            <div className="field">
              <label>Title</label>
              <div style={{ padding: '9px 0', fontWeight: 500 }}>{test.title}</div>
            </div>
            <div className="field">
              <label>Language Support</label>
              <div style={{ padding: '9px 0' }}>{test.languageSupport ? test.language : 'None'}</div>
            </div>
            <div className="field">
              <label>Time limit</label>
              <div style={{ padding: '9px 0' }}>{test.timeLimitMinutes ? `${test.timeLimitMinutes} minutes` : 'No limit'}</div>
            </div>
            <div className="field">
              <label>Available From</label>
              <div style={{ padding: '9px 0' }}>{new Date(test.availableFrom).toLocaleString()}</div>
            </div>
            <div className="field">
              <label>Available Till</label>
              <div style={{ padding: '9px 0' }}>{new Date(test.availableTill).toLocaleString()}</div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ marginTop: '6px' }} onClick={() => onEditSettings(test.id)}>
            Edit settings
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head" onClick={() => togglePanel('questions')}>
          <h2>Questions <span className="count">({(test.questions || []).length})</span></h2>
          <ChevronDown size={15} strokeWidth={2.2} className={`chev ${panelCollapsed.questions ? '' : 'open'}`} />
        </div>
        <div className={`panel-body ${panelCollapsed.questions ? 'collapsed' : ''}`}>
          <div className="qlist-toolbar">
            <div className="left-actions">
              <button className="btn btn-sm" onClick={() => setBankModalOpen(true)}>
                <Download size={13} strokeWidth={2} /> Import from Bank
              </button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}>
              <Plus size={13} strokeWidth={2.6} /> New question
            </button>
          </div>

          {(test.questions || []).length > 0 ? (
            (test.questions || []).map((q, i) => renderQuestionRow(q, i))
          ) : (
            <div className="q-empty">
              <p style={{ marginBottom: '14px' }}>No questions yet — add the first one to this test.</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}>
                + New question
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteTestConfirm}
        onClose={() => setDeleteTestConfirm(false)}
        onConfirm={handleDeleteTest}
        isDeleting={deleteTestMutation.isPending}
        title="Delete this test?"
        description={
          <><b>{test.title}</b> and its {(test.questions || []).length} questions will be permanently removed. This can't be undone.</>
        }
      />

      <DeleteConfirmModal
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        isDeleting={deleteQuestionMutation.isPending}
        title="Unlink this question?"
        description={
          <>This question will be removed from this test. It will remain in the shared Question Bank.</>
        }
      />

      {questionModalOpen && (
        <QuestionModal
          isOpen={questionModalOpen}
          onClose={() => setQuestionModalOpen(false)}
          question={editingQuestion}
          nextOrder={(test.questions || []).length + 1}
          onSave={handleSaveQuestion}
          isSaving={createQuestionMutation.isPending || updateQuestionMutation.isPending}
        />
      )}

      {bankModalOpen && (
        <QuestionBankModal
          isOpen={bankModalOpen}
          onClose={() => setBankModalOpen(false)}
          onImport={handleImportQuestions}
          isImporting={linkQuestionsMutation.isPending}
          existingQuestionIds={(test.questions || []).map(q => q.id)}
        />
      )}
    </div>
  );
};
