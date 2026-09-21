import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2, Settings, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Question, QuestionType, CreateQuestionDto } from '../../quizzes/types';
import { useTags, useCreateTag, useCategories } from '../../courses/hooks/useMasterData';
import CreatableDropdown from '../../../shared/components/CreatableDropdown';

// ── Type editor imports ────────────────────────────────────────────────────────
import { TrueFalseEditor, defaultTrueFalseContent } from './types/TrueFalseEditor';
import { FillBlankEditor, defaultFillBlankContent } from './types/FillBlankEditor';
import { ShortAnswerEditor, defaultShortAnswerContent } from './types/ShortAnswerEditor';
import { AssertionReasonEditor, defaultAssertionReasonContent } from './types/AssertionReasonEditor';
import { ArrangementEditor, defaultArrangementContent } from './types/ArrangementEditor';
import { MapBasedEditor, defaultMapBasedContent } from './types/MapBasedEditor';
import { DragDropEditor, defaultDragDropContent } from './types/DragDropEditor';
import { CodingEditor, defaultCodingContent } from './types/CodingEditor';

// ── Palette definition ─────────────────────────────────────────────────────────

interface TypeMeta {
  id: QuestionType;
  label: string;
  icon: string;
  hint: string;
}

const PALETTE: { group: string; types: TypeMeta[] }[] = [
  {
    group: 'Basic Types',
    types: [
      { id: 'SINGLE',    label: 'Single Choice',   icon: '◉', hint: 'One correct option' },
      { id: 'MULTIPLE',  label: 'Multiple Choice',  icon: '☑', hint: 'Multiple correct options' },
      { id: 'NUMERIC',   label: 'Numeric',          icon: '1.5', hint: 'Numeric answer with optional tolerance' },
      { id: 'TRUE_FALSE',label: 'True / False',     icon: 'T/F', hint: 'Binary true or false statement' },
      { id: 'FILL_BLANK',label: 'Fill in Blank',    icon: '___', hint: 'Text, number, or picklist blanks' },
    ],
  },
  {
    group: 'Advanced Types',
    types: [
      { id: 'SHORT_ANSWER',    label: 'Short Answer',       icon: '✍', hint: 'Brief written response with keyword grading' },
      { id: 'SUBJECTIVE',      label: 'Subjective (Essay)', icon: '📝', hint: 'Long-form — graded manually' },
      { id: 'MATCH',           label: 'Match Matrix',       icon: '↔', hint: 'Match Column I to Column II' },
      { id: 'ASSERTION_REASON',label: 'Assertion–Reason',   icon: 'A/R', hint: 'NEET/JEE assertion + reason pair' },
      { id: 'ARRANGEMENT',     label: 'Arrangement',        icon: '⇅', hint: 'Arrange items in correct order' },
    ],
  },
  {
    group: 'Specialized Types',
    types: [
      { id: 'MAP_BASED', label: 'Map Based',   icon: '🗺', hint: 'Place markers on image/map' },
      { id: 'DRAG_DROP', label: 'Drag & Drop', icon: '⇌', hint: 'Drag items into drop targets' },
      { id: 'CODING',    label: 'Coding',      icon: '</>', hint: 'Coding challenges, debugging, SQL' },
    ],
  },
];

// ALL_TYPES kept for future use (type search / filter)

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultContentForType = (t: QuestionType): Record<string, any> | undefined => {
  switch (t) {
    case 'TRUE_FALSE':     return defaultTrueFalseContent();
    case 'FILL_BLANK':     return defaultFillBlankContent();
    case 'SHORT_ANSWER':   return defaultShortAnswerContent();
    case 'ASSERTION_REASON': return defaultAssertionReasonContent();
    case 'ARRANGEMENT':    return defaultArrangementContent();
    case 'MAP_BASED':      return defaultMapBasedContent();
    case 'DRAG_DROP':      return defaultDragDropContent();
    case 'CODING':         return defaultCodingContent();
    default:               return undefined;
  }
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  nextOrder: number;
  onSave: (dto: CreateQuestionDto) => Promise<void>;
  isSaving?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  nextOrder,
  onSave,
  isSaving = false,
}) => {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [type, setType] = useState<QuestionType>('SINGLE');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('');
  const [group, setGroup] = useState(false);
  const [text, setText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [order, setOrder] = useState<number>(nextOrder);
  const [mark, setMark] = useState<number>(1);
  const [penalty, setPenalty] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Shared optional settings (Part 0) ───────────────────────────────────────
  const [categoryId, setCategoryId] = useState<string>('');
  const [negativeMarking, setNegativeMarking] = useState<string>('');
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState<string>('');

  // ── Legacy flat fields (SINGLE / MULTIPLE / NUMERIC / MATCH) ─────────────
  const [options, setOptions] = useState<{ text: string; correct: boolean }[]>([
    { text: '', correct: false }, { text: '', correct: false },
  ]);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [numericRange, setNumericRange] = useState(false);
  const [matchColI, setMatchColI] = useState<{ text: string; match: string }[]>([
    { text: '', match: '' }, { text: '', match: '' },
  ]);
  const [matchColII, setMatchColII] = useState<string[]>(['', '']);

  // ── New type content bag ──────────────────────────────────────────────────
  const [content, setContent] = useState<Record<string, any> | undefined>(undefined);

  // ── Master data ───────────────────────────────────────────────────────────
  const { data: tagsList } = useTags();
  const { data: categoriesList } = useCategories();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();

  // ── Reset / hydrate on open ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (question) {
        setType(question.type);
        setSubject(question.subject || '');
        setTopic(question.topic || '');
        setSelectedTags(question.tags || []);
        setDifficulty(question.difficulty || '');
        setGroup(question.group || false);
        setText(question.text || '');
        setExplanation(question.explanation === 'No explanation available' ? '' : (question.explanation || ''));
        setOrder(question.order ?? nextOrder);
        setMark(question.mark ?? 1);
        setPenalty(question.penalty ?? 0);
        setCategoryId(question.categoryId || '');
        setNegativeMarking(question.negativeMarking !== undefined ? String(question.negativeMarking) : '');
        setCompletionTimeMinutes(question.completionTimeMinutes !== undefined ? String(question.completionTimeMinutes) : '');

        if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
          setOptions(question.options?.length ? [...question.options] : [{ text: '', correct: false }, { text: '', correct: false }]);
        } else if (question.type === 'NUMERIC') {
          setNumericAnswer(question.answer !== undefined ? String(question.answer) : '');
          setNumericRange(!!question.range);
        } else if (question.type === 'MATCH') {
          setMatchColI(question.colI?.length ? [...question.colI] : [{ text: '', match: '' }, { text: '', match: '' }]);
          setMatchColII(question.colII?.length ? [...question.colII] : ['', '']);
        } else {
          setContent(question.content || defaultContentForType(question.type));
        }
      } else {
        // Reset all to defaults
        setType('SINGLE');
        setSubject('');
        setTopic('');
        setSelectedTags([]);
        setDifficulty('');
        setGroup(false);
        setText('');
        setExplanation('');
        setOrder(nextOrder);
        setMark(1);
        setPenalty(0);
        setCategoryId('');
        setNegativeMarking('');
        setCompletionTimeMinutes('');
        setOptions([{ text: '', correct: false }, { text: '', correct: false }]);
        setNumericAnswer('');
        setNumericRange(false);
        setMatchColI([{ text: '', match: '' }, { text: '', match: '' }]);
        setMatchColII(['', '']);
        setContent(undefined);
      }
      setShowAdvanced(false);
    }
  }, [isOpen, question, nextOrder]);

  if (!isOpen) return null;

  // ── Type change handler ─────────────────────────────────────────────────────
  const handleTypeChange = (newType: QuestionType) => {
    if (newType === type) return;
    setType(newType);
    if (newType === 'SINGLE' || newType === 'MULTIPLE') setOptions([{ text: '', correct: false }, { text: '', correct: false }]);
    else if (newType === 'NUMERIC') { setNumericAnswer(''); setNumericRange(false); }
    else if (newType === 'MATCH') { setMatchColI([{ text: '', match: '' }, { text: '', match: '' }]); setMatchColII(['', '']); }
    setContent(defaultContentForType(newType));
  };

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSaveClick = async () => {
    if (!subject.trim() || !topic.trim() || !text.trim()) {
      toast.error('Subject, topic, and question text are required.');
      return;
    }

    if (type === 'SINGLE' || type === 'MULTIPLE') {
      const filledOptions = options.filter((o) => (o.text || '').trim() !== '');
      if (filledOptions.length < 2) { toast.error('Please provide at least 2 options.'); return; }
      if (!filledOptions.some((o) => o.correct)) { toast.error('Mark at least one option as correct.'); return; }
    } else if (type === 'MATCH') {
      if (matchColI.some((p) => !p.text.trim() || !p.match.trim())) { toast.error('Fill in every Column I row.'); return; }
      if (matchColII.filter((o) => o.trim() !== '').length < 2) { toast.error('At least two Column II options are required.'); return; }
    } else if (type === 'NUMERIC') {
      if (!numericAnswer.trim()) { toast.error('Enter the correct answer.'); return; }
    } else if (type === 'TRUE_FALSE') {
      if ((content as any)?.correctAnswer === null || (content as any)?.correctAnswer === undefined) {
        toast.error('Select True or False as the correct answer.'); return;
      }
    } else if (type === 'CODING') {
      const c = content as any;
      if (!c?.title?.trim()) { toast.error('Coding: Problem Title is required.'); return; }
      if (!c?.language?.trim()) { toast.error('Coding: Programming Language is required.'); return; }
      if (!c?.problemDescription?.trim()) { toast.error('Coding: Problem Description is required.'); return; }
    }

    const dto: CreateQuestionDto = {
      type,
      subject: subject.trim(),
      topic: topic.trim(),
      tags: selectedTags,
      difficulty: difficulty as any,
      group,
      text: text.trim(),
      explanation: explanation.trim() || 'No explanation available',
      order,
      mark,
      penalty,
      // Optional shared settings
      categoryId: categoryId || undefined,
      negativeMarking: negativeMarking !== '' ? Number(negativeMarking) : undefined,
      completionTimeMinutes: completionTimeMinutes !== '' ? Number(completionTimeMinutes) : undefined,
    };

    // Legacy flat fields
    if (type === 'SINGLE' || type === 'MULTIPLE') {
      dto.options = options.filter((o) => o.text.trim() !== '');
    } else if (type === 'NUMERIC') {
      dto.answer = Number(numericAnswer);
      dto.range = numericRange ? 1 : 0;
    } else if (type === 'MATCH') {
      dto.colI = matchColI;
      dto.colII = matchColII.filter((o) => o.trim() !== '');
    } else {
      // New type — send via content bag
      dto.content = content;
    }

    await onSave(dto);
  };

  // ── Type-specific field renderer ────────────────────────────────────────────
  const renderTypeFields = () => {
    switch (type) {
      case 'SINGLE':
      case 'MULTIPLE':
        return (
          <>
            <div className="section-label">Options</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type={type === 'SINGLE' ? 'radio' : 'checkbox'}
                    name="correct_option"
                    checked={opt.correct}
                    onChange={(e) => {
                      if (type === 'MULTIPLE') {
                        const newOpts = [...options];
                        newOpts[i].correct = e.target.checked;
                        setOptions(newOpts);
                      } else {
                        setOptions(options.map((o, idx) => ({ ...o, correct: idx === i })));
                      }
                    }}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i].text = e.target.value;
                      setOptions(newOpts);
                    }}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '4px', fontSize: '14px' }}
                  />
                  {options.length > 2 ? (
                    <button type="button" onClick={() => { const newOpts = [...options]; newOpts.splice(i, 1); setOptions(newOpts); }} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  ) : <div style={{ width: '24px' }} />}
                </div>
              ))}
            </div>
            <button className="add-opt-btn" onClick={() => {
              if (options.length >= 8) { alert('Maximum 8 options.'); return; }
              setOptions([...options, { text: '', correct: false }]);
            }}>
              <Plus size={13} strokeWidth={2.6} /> Add option
            </button>
          </>
        );

      case 'NUMERIC':
        return (
          <>
            <div className="section-label">Answer</div>
            <div className="form-grid">
              <div className="field full">
                <input type="text" placeholder="Correct numeric answer" value={numericAnswer} onChange={(e) => setNumericAnswer(e.target.value)} />
              </div>
              <div className="field full">
                <label className="check-row" style={{ width: 'fit-content' }}>
                  <input type="checkbox" checked={numericRange} onChange={(e) => setNumericRange(e.target.checked)} />
                  Accept a range of answers
                </label>
              </div>
            </div>
          </>
        );

      case 'MATCH':
        return (
          <>
            <div className="section-label">Column II options (Answers) <span className="req">*</span></div>
            <div className="field-hint-row">e.g. A. 18th century, B. 20th century. Provide the options here first.</div>
            <div style={{ marginBottom: '24px' }}>
              {matchColII.map((txt, i) => (
                <div key={i} className="match-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input type="text" placeholder={`Option e.g. ${String.fromCharCode(65 + i)}. `} value={txt}
                    onChange={(e) => { const newColII = [...matchColII]; newColII[i] = e.target.value; setMatchColII(newColII); }}
                    style={{ flex: 1 }}
                  />
                  {matchColII.length > 2 ? (
                    <button className="opt-remove" onClick={() => { const newColII = [...matchColII]; newColII.splice(i, 1); setMatchColII(newColII); }}><Trash2 size={15} /></button>
                  ) : <span style={{ width: '31px' }} />}
                </div>
              ))}
              <button className="add-opt-btn" onClick={() => setMatchColII([...matchColII, ''])}>
                <Plus size={13} strokeWidth={2.6} /> Add option
              </button>
            </div>
            <div className="section-label">Column I options (Questions) <span className="req">*</span></div>
            <div className="field-hint-row">Enter Column I items and select their correct match from Column II.</div>
            <div>
              {matchColI.map((p, i) => (
                <div key={i} className="match-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input type="text" placeholder="Option text" value={p.text}
                    onChange={(e) => { const newColI = [...matchColI]; newColI[i].text = e.target.value; setMatchColI(newColI); }}
                    style={{ flex: 1 }}
                  />
                  <select value={p.match} onChange={(e) => { const newColI = [...matchColI]; newColI[i].match = e.target.value; setMatchColI(newColI); }} style={{ width: '200px' }}>
                    <option value="">Select match...</option>
                    {matchColII.map((col2Item, idx) => {
                      const trimmed = col2Item.trim();
                      if (!trimmed) return null;
                      const matchId = col2Item.includes('.') ? col2Item.split('.')[0].trim() : String.fromCharCode(65 + idx);
                      return <option key={idx} value={matchId}>{trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed}</option>;
                    })}
                  </select>
                  {matchColI.length > 2 ? (
                    <button className="opt-remove" onClick={() => { const newColI = [...matchColI]; newColI.splice(i, 1); setMatchColI(newColI); }}><Trash2 size={15} /></button>
                  ) : <span style={{ width: '31px' }} />}
                </div>
              ))}
            </div>
            <button className="add-opt-btn" onClick={() => setMatchColI([...matchColI, { text: '', match: '' }])}>
              <Plus size={13} strokeWidth={2.6} /> Add row
            </button>
          </>
        );

      case 'SUBJECTIVE':
        return (
          <div className="field-hint-row" style={{ marginTop: '16px' }}>
            Subjective questions are graded manually — no answer key is needed here.
          </div>
        );

      // ── New types via content bag ────────────────────────────────────────────
      case 'TRUE_FALSE':
        return (
          <TrueFalseEditor
            value={(content as any) || defaultTrueFalseContent()}
            onChange={setContent}
          />
        );

      case 'FILL_BLANK':
        return (
          <FillBlankEditor
            value={(content as any) || defaultFillBlankContent()}
            onChange={setContent}
          />
        );

      case 'SHORT_ANSWER':
        return (
          <ShortAnswerEditor
            value={(content as any) || defaultShortAnswerContent()}
            onChange={setContent}
          />
        );

      case 'ASSERTION_REASON':
        return (
          <AssertionReasonEditor
            value={(content as any) || defaultAssertionReasonContent()}
            onChange={setContent}
          />
        );

      case 'ARRANGEMENT':
        return (
          <ArrangementEditor
            value={(content as any) || defaultArrangementContent()}
            onChange={setContent}
          />
        );

      case 'MAP_BASED':
        return (
          <MapBasedEditor
            value={(content as any) || defaultMapBasedContent()}
            onChange={setContent}
          />
        );

      case 'DRAG_DROP':
        return (
          <DragDropEditor
            value={(content as any) || defaultDragDropContent()}
            onChange={setContent}
          />
        );

      case 'CODING':
        return (
          <CodingEditor
            value={(content as any) || defaultCodingContent()}
            onChange={setContent}
          />
        );

      default:
        return null;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal wide">
        <div className="modal-head">
          <h2>{question ? 'Edit question' : 'New question'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {question && (
            <div className="warning-callout" style={{ marginBottom: '16px', background: 'var(--blue-50)', color: 'var(--blue-900)', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
              <strong>Note:</strong> This question is part of the shared bank. Edits here will affect all quizzes and tests that use it.
            </div>
          )}

          {/* ── Type palette (grouped) ── */}
          <div style={{ marginBottom: '20px' }}>
            {PALETTE.map((group) => (
              <div key={group.group} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: '6px' }}>
                  {group.group}
                </div>
                <div className="type-select" style={{ flexWrap: 'wrap', gap: '6px' }}>
                  {group.types.map((t) => (
                    <div
                      key={t.id}
                      className={`type-chip ${type === t.id ? 'active' : ''}`}
                      onClick={() => handleTypeChange(t.id)}
                      title={t.hint}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, opacity: 0.7 }}>{t.icon}</span>
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Shared metadata ── */}
          <div className="form-grid">
            <div className="field">
              <label>Subject <span className="req">*</span></label>
              <input type="text" placeholder="e.g. Biology" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="field">
              <label>Topic <span className="req">*</span></label>
              <input type="text" placeholder="e.g. Cell structure" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <CreatableDropdown
                label="Tags"
                items={tagsList || []}
                value={selectedTags}
                onChange={(val: any) => setSelectedTags(val)}
                onCreate={(name: string) => createTag(name)}
                isCreating={isCreatingTag}
                multiple={true}
                placeholder="Select or type tags..."
              />
            </div>
            <div className="field">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                <option value="">Select level...</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="field">
              <label>Category <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional)</span></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">No category</option>
                {(categoriesList || []).map((cat: any) => (
                  <option key={cat.id || cat._id || cat.name} value={cat.id || cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="field full">
              <label>Question text <span className="req">*</span></label>
              <textarea placeholder="Type your question here..." value={text} onChange={(e) => setText(e.target.value)} />
            </div>

            <div className="field full" style={{ margin: '8px 0 -8px' }}>
              <hr style={{ border: 0, borderTop: '1px solid var(--rule)' }} />
            </div>

            {/* ── Type-specific fields ── */}
            <div className="field full">
              {renderTypeFields()}
            </div>

            {/* ── Explanation & Options accordion ── */}
            <div className="field full">
              <button type="button" className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                Explanation & Options <ChevronDown size={14} className={`chev ${showAdvanced ? 'open' : ''}`} />
              </button>

              <div className={`advanced-body ${showAdvanced ? '' : 'hidden'}`}>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label>Explanation (shown after answering)</label>
                  <textarea placeholder="Explain why the answer is correct..." value={explanation} onChange={(e) => setExplanation(e.target.value)} />
                </div>
                <div className="field">
                  <label>Marks (positive)</label>
                  <input type="number" min="0" value={mark} onChange={(e) => setMark(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>Penalty (negative marks)</label>
                  <input type="number" min="0" value={penalty} onChange={(e) => setPenalty(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label>
                    Negative Marking %
                    <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px', marginLeft: '4px' }}>(optional, e.g. -0.25 = -25%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. -0.25"
                    value={negativeMarking}
                    onChange={(e) => setNegativeMarking(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>
                    Completion Time (min)
                    <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px', marginLeft: '4px' }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Expected minutes"
                    value={completionTimeMinutes}
                    onChange={(e) => setCompletionTimeMinutes(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Order / Sequence</label>
                  <input type="number" min="1" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label className="check-row" style={{ marginTop: '22px' }}>
                    <input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} />
                    Group with next question (passage)
                  </label>
                </div>

                {/* Advanced Grading Rules — visible-but-disabled stub per spec */}
                <div className="field full" style={{ borderTop: '1px solid var(--rule)', paddingTop: '12px', marginTop: '4px' }}>
                  <button
                    type="button"
                    disabled
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', border: '1px dashed var(--rule-strong)',
                      borderRadius: '6px', background: 'transparent',
                      color: 'var(--ink-soft)', fontSize: '13px', fontWeight: 600,
                      cursor: 'not-allowed', opacity: 0.65,
                    }}
                    title="Advanced Grading Rules — coming soon"
                  >
                    <Settings size={14} />
                    Advanced Grading Rules
                    <Lock size={12} style={{ opacity: 0.6 }} />
                  </button>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                    Partial scoring, weighted criteria, and rubric-based grading — coming soon.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? 'Saving...' : (question ? 'Save question' : 'Add question')}
          </button>
        </div>
      </div>
    </div>
  );
};
