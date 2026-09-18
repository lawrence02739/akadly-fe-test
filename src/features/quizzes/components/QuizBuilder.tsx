import React, { useState } from 'react';
import { ChevronDown, Clock, RefreshCw, List, Trash2, Edit2, Download, Plus } from 'lucide-react';
import { useQuiz, useDeleteQuiz, useDeleteQuestion, useCreateQuestion, useUpdateQuestion, useLinkQuestions } from '../hooks/useQuizzes';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { QuestionModal } from '../../questions/components/QuestionModal';
import { QuestionBankModal } from '../../questions/components/QuestionBankModal';
import type { Question, CreateQuestionDto } from '../types';

interface QuizBuilderProps {
  quizId: string;
  onBack: () => void;
  onEditSettings: (quizId: string) => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({ quizId, onBack, onEditSettings }) => {
  const { data: quiz, isLoading } = useQuiz(quizId);

  const deleteQuizMutation = useDeleteQuiz();
  const deleteQuestionMutation = useDeleteQuestion();
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const linkQuestionsMutation = useLinkQuestions();

  const [panelCollapsed, setPanelCollapsed] = useState({ settings: false, questions: false });
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [deleteQuizConfirm, setDeleteQuizConfirm] = useState(false);
  
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [bankModalOpen, setBankModalOpen] = useState(false);

  if (isLoading) {
    return <div className="qs-view"><div className="empty-state"><p>Loading quiz...</p></div></div>;
  }

  if (!quiz) {
    return (
      <div className="qs-view">
        <div className="empty-state">
          <h3>Quiz not found</h3>
          <p>It may have been deleted.</p>
          <button className="btn btn-primary" onClick={onBack}>Back to quizzes</button>
        </div>
      </div>
    );
  }

  const togglePanel = (name: 'settings' | 'questions') => {
    setPanelCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const totalMarks = (quiz.questions || []).reduce((s, q) => s + (Number(q.mark) || 0), 0);

  const handleDeleteQuiz = () => {
    deleteQuizMutation.mutate(quiz.id, {
      onSuccess: () => {
        setDeleteQuizConfirm(false);
        onBack();
      }
    });
  };

  const handleDeleteQuestion = () => {
    if (deleteQuestionId) {
      deleteQuestionMutation.mutate({ quizId: quiz.id, qId: deleteQuestionId }, {
        onSuccess: () => setDeleteQuestionId(null)
      });
    }
  };

  const handleSaveQuestion = async (dto: CreateQuestionDto) => {
    if (editingQuestion) {
      await updateQuestionMutation.mutateAsync({ quizId: quiz.id, qId: editingQuestion.id, dto });
    } else {
      await createQuestionMutation.mutateAsync({ quizId: quiz.id, dto });
    }
    setQuestionModalOpen(false);
  };

  const handleImportQuestions = async (questionIds: string[]) => {
    await linkQuestionsMutation.mutateAsync({ quizId: quiz.id, questionIds });
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
            <h1>{quiz.title}</h1>
            <button className="icon-btn" onClick={() => onEditSettings(quiz.id)} aria-label="Edit quiz settings">
              <Edit2 size={15} />
            </button>
          </div>
          <div className="builder-sub">
            <span><Clock size={12} /> {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min limit` : 'No time limit'}</span>
            <span><RefreshCw size={12} /> {quiz.retakeAttempts ? `${quiz.retakeAttempts} retake attempts` : 'Unlimited attempts'}</span>
            <span><List size={12} /> {totalMarks} marks total</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-danger" onClick={() => setDeleteQuizConfirm(true)}>Delete quiz</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head" onClick={() => togglePanel('settings')}>
          <h2>Quiz settings</h2>
          <ChevronDown size={15} strokeWidth={2.2} className={`chev ${panelCollapsed.settings ? '' : 'open'}`} />
        </div>
        <div className={`panel-body ${panelCollapsed.settings ? 'collapsed' : ''}`}>
          <div className="form-grid">
            <div className="field">
              <label>Title</label>
              <div style={{ padding: '9px 0', fontWeight: 500 }}>{quiz.title}</div>
            </div>
            <div className="field">
              <label>Tags</label>
              <div style={{ padding: '9px 0' }}>
                {(quiz.tags || []).length > 0 ? (
                  (quiz.tags || []).map((t, i) => <span key={i} className="tag" style={{ marginRight: '4px' }}>{t}</span>)
                ) : '—'}
              </div>
            </div>
            <div className="field">
              <label>Time limit</label>
              <div style={{ padding: '9px 0' }}>{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} minutes` : 'No limit'}</div>
            </div>
            <div className="field">
              <label>Re-take attempts</label>
              <div style={{ padding: '9px 0' }}>{quiz.retakeAttempts ? quiz.retakeAttempts : 'Unlimited'}</div>
            </div>
          </div>
          <button className="btn btn-sm" style={{ marginTop: '6px' }} onClick={() => onEditSettings(quiz.id)}>
            Edit settings
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head" onClick={() => togglePanel('questions')}>
          <h2>Questions <span className="count">({(quiz.questions || []).length})</span></h2>
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

          {(quiz.questions || []).length > 0 ? (
            (quiz.questions || []).map((q, i) => renderQuestionRow(q, i))
          ) : (
            <div className="q-empty">
              <p style={{ marginBottom: '14px' }}>No questions yet — add the first one to this quiz.</p>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}>
                + New question
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteQuizConfirm}
        onClose={() => setDeleteQuizConfirm(false)}
        onConfirm={handleDeleteQuiz}
        isDeleting={deleteQuizMutation.isPending}
        title="Delete this quiz?"
        description={
          <><b>{quiz.title}</b> and its {(quiz.questions || []).length} questions will be permanently removed. This can't be undone.</>
        }
      />

      <DeleteConfirmModal
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={handleDeleteQuestion}
        isDeleting={deleteQuestionMutation.isPending}
        title="Unlink this question?"
        description={
          <>This question will be removed from this quiz. It will remain in the shared Question Bank.</>
        }
      />

      {questionModalOpen && (
        <QuestionModal
          isOpen={questionModalOpen}
          onClose={() => setQuestionModalOpen(false)}
          question={editingQuestion}
          nextOrder={(quiz.questions || []).length + 1}
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
          existingQuestionIds={(quiz.questions || []).map(q => q.id)}
        />
      )}
    </div>
  );
};
