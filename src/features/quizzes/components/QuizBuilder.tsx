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
    const c: any = q.content || {};
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

    // ── New types ────────────────────────────────────────────────────────────
    } else if (q.type === 'TRUE_FALSE') {
      const ans = c.correctAnswer;
      body = (
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {[true, false].map((v) => (
            <span
              key={String(v)}
              style={{
                padding: '4px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                background: ans === v ? (v ? '#d1fae5' : '#fee2e2') : 'var(--bg-alt, #f5f5f5)',
                color: ans === v ? (v ? '#065f46' : '#991b1b') : 'var(--ink-soft)',
                border: `1px solid ${ans === v ? (v ? '#6ee7b7' : '#fca5a5') : 'var(--rule)'}`,
              }}
            >
              {v ? '✓ True' : '✗ False'}
            </span>
          ))}
        </div>
      );

    } else if (q.type === 'FILL_BLANK') {
      body = (
        <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--ink-soft)', fontFamily: 'monospace', background: 'var(--bg-alt, #f5f5f5)', padding: '6px 10px', borderRadius: '6px' }}>
          {c.template || '(No template)'}
          {c.blanks?.length > 0 && (
            <span style={{ marginLeft: '8px', fontFamily: 'sans-serif', fontSize: '11px', color: 'var(--primary)' }}>
              {c.blanks.length} blank{c.blanks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      );

    } else if (q.type === 'SHORT_ANSWER') {
      const excerpt = c.modelAnswer ? c.modelAnswer.slice(0, 120) + (c.modelAnswer.length > 120 ? '...' : '') : '(No model answer)';
      body = (
        <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--ink-soft)', fontStyle: 'italic' }}>
          Model: {excerpt}
          {c.maxCharacterLimit && (
            <span style={{ marginLeft: '8px', fontSize: '11px', fontStyle: 'normal', color: 'var(--primary)' }}>
              ≤ {c.maxCharacterLimit} chars
            </span>
          )}
        </div>
      );

    } else if (q.type === 'ASSERTION_REASON') {
      body = (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          {c.assertion && <div><b style={{ color: 'var(--primary)' }}>A:</b> {c.assertion.slice(0, 100)}{c.assertion.length > 100 ? '...' : ''}</div>}
          {c.reason && <div><b style={{ color: 'var(--correct, #059669)' }}>R:</b> {c.reason.slice(0, 100)}{c.reason.length > 100 ? '...' : ''}</div>}
          {(c.options || []).filter((o: any) => o.correct).map((o: any, i: number) => (
            <div key={i} className="opt-line correct" style={{ marginTop: '4px' }}>
              <span className="opt-mark"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 13 4 4L19 7"/></svg></span>
              <span style={{ fontSize: '12px' }}>{o.text}</span>
            </div>
          ))}
        </div>
      );

    } else if (q.type === 'ARRANGEMENT') {
      body = (
        <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {(c.correctOrder || []).map((id: string, pos: number) => {
            const item = (c.items || []).find((it: any) => it.id === id);
            return (
              <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'var(--bg-alt, #f5f5f5)', border: '1px solid var(--rule)', borderRadius: '6px', fontSize: '12px' }}>
                <span style={{ width: '18px', height: '18px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '10px' }}>{pos + 1}</span>
                {item?.text || '…'}
              </span>
            );
          })}
        </div>
      );

    } else if (q.type === 'MAP_BASED') {
      body = (
        <div style={{ marginTop: '4px', fontSize: '13px', color: 'var(--ink-soft)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {c.mapImage?.fileUrl && (
            <img src={c.mapImage.fileUrl} alt="Map" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--rule)' }} />
          )}
          <div>
            <span>{c.markers?.length || 0} marker{c.markers?.length !== 1 ? 's' : ''}</span>
            <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'var(--primary-50, #eff6ff)', color: 'var(--primary)', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
              {c.answerMode || 'OPTIONS'}
            </span>
          </div>
        </div>
      );

    } else if (q.type === 'DRAG_DROP') {
      body = (
        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          {(c.targets || []).map((t: any, ti: number) => (
            <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ padding: '2px 8px', background: 'var(--primary-50, #eff6ff)', border: '1px solid var(--primary)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--primary)', flexShrink: 0 }}>
                {t.label || `Target ${ti+1}`}
              </span>
              <span style={{ color: 'var(--ink-soft)', fontSize: '12px' }}>
                ← {(t.correctItemIds || []).map((id: string) => {
                  const item = (c.items || []).find((it: any) => it.id === id);
                  return item?.text;
                }).filter(Boolean).join(', ') || 'no items mapped'}
              </span>
            </div>
          ))}
        </div>
      );

    } else if (q.type === 'CODING') {
      const catLabel: Record<string, string> = {
        CODING_CHALLENGE: 'Coding Challenge', CODE_DEBUGGING: 'Code Debugging',
        SQL_QUERY: 'SQL Query', DOMAIN_SPECIFIC: 'Domain Specific',
        MACHINE_CODING_UI: 'Machine Coding / UI', SYSTEM_DESIGN: 'System Design',
      };
      body = (
        <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ padding: '2px 10px', background: '#f3f0ff', color: '#6d28d9', border: '1px solid #c4b5fd', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
            {catLabel[c.category] || c.category}
          </span>
          {c.language && (
            <span style={{ padding: '2px 10px', background: 'var(--bg-alt, #f5f5f5)', border: '1px solid var(--rule)', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
              {c.language}
            </span>
          )}
          {c.title && <span style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>{c.title}</span>}
          {c.timeLimitMinutes && <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>{c.timeLimitMinutes} min</span>}
        </div>
      );
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
