import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { Question, QuestionType, CreateQuestionDto } from '../../quizzes/types';
import { useTags, useCreateTag } from '../../courses/hooks/useMasterData';
import CreatableDropdown from '../../../shared/components/CreatableDropdown';

const QUESTION_TYPES: { id: QuestionType; label: string }[] = [
  { id: 'SINGLE', label: 'Single Choice' },
  { id: 'MULTIPLE', label: 'Multiple Choice' },
  { id: 'NUMERIC', label: 'Numeric Answer' },
  { id: 'MATCH', label: 'Match Matrix' },
  { id: 'SUBJECTIVE', label: 'Subjective (Essay)' },
];

export interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: Question | null;
  nextOrder: number;
  onSave: (dto: CreateQuestionDto) => Promise<void>;
  isSaving?: boolean;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  question,
  nextOrder,
  onSave,
  isSaving = false,
}) => {
  const [type, setType] = useState<QuestionType>('SINGLE');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('');
  
  const { data: tagsList } = useTags();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();
  const [group, setGroup] = useState(false);
  const [text, setText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [order, setOrder] = useState<number>(nextOrder);
  const [mark, setMark] = useState<number>(1);
  const [penalty, setPenalty] = useState<number>(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Type specific state
  const [options, setOptions] = useState<{text: string; correct: boolean}[]>([
    { text: '', correct: false }, { text: '', correct: false }
  ]);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [numericRange, setNumericRange] = useState(false);
  const [matchColI, setMatchColI] = useState<{text: string; match: string}[]>([
    { text: '', match: '' }, { text: '', match: '' }
  ]);
  const [matchColII, setMatchColII] = useState<string[]>(['', '']);

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

        if (question.type === 'SINGLE' || question.type === 'MULTIPLE') {
          setOptions(question.options?.length ? [...question.options] : [{ text: '', correct: false }, { text: '', correct: false }]);
        } else if (question.type === 'NUMERIC') {
          setNumericAnswer(question.answer !== undefined ? String(question.answer) : '');
          setNumericRange(!!question.range);
        } else if (question.type === 'MATCH') {
          setMatchColI(question.colI?.length ? [...question.colI] : [{ text: '', match: '' }, { text: '', match: '' }]);
          setMatchColII(question.colII?.length ? [...question.colII] : ['', '']);
        }
      } else {
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
        setOptions([{ text: '', correct: false }, { text: '', correct: false }]);
        setNumericAnswer('');
        setNumericRange(false);
        setMatchColI([{ text: '', match: '' }, { text: '', match: '' }]);
        setMatchColII(['', '']);
      }
      setShowAdvanced(false);
    }
  }, [isOpen, question, nextOrder]);

  if (!isOpen) return null;

  const handleSaveClick = async () => {
    if (!subject.trim() || !topic.trim() || !text.trim()) {
      alert('Subject, topic, and question text are required.');
      return;
    }

    if (type === 'SINGLE' || type === 'MULTIPLE') {
      const filledOptions = options.filter(o => (o.text || '').trim() !== '');
      if (filledOptions.length < 2) {
        alert('Please provide at least 2 options.');
        return;
      }
      if (!filledOptions.some(o => o.correct)) {
        alert('Mark at least one option as correct.');
        return;
      }
      // Only keep the filled options to save
      setOptions(filledOptions);
    } else if (type === 'MATCH') {
      if (matchColI.some(p => !p.text.trim() || !p.match.trim())) {
        alert('Fill in every Column I row.');
        return;
      }
      if (matchColII.filter(o => o.trim() !== '').length < 2) {
        alert('At least two Column II options are required.');
        return;
      }
    } else if (type === 'NUMERIC') {
      if (!numericAnswer.trim()) {
        alert('Enter the correct answer.');
        return;
      }
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
    };

    if (type === 'SINGLE' || type === 'MULTIPLE') {
      dto.options = options.filter(o => o.text.trim() !== '');
    } else if (type === 'NUMERIC') {
      dto.answer = Number(numericAnswer);
      dto.range = numericRange ? 1 : 0;
    } else if (type === 'MATCH') {
      dto.colI = matchColI;
      dto.colII = matchColII.filter(o => o.trim() !== '');
    }

    await onSave(dto);
  };

  const renderTypeFields = () => {
    if (type === 'SINGLE' || type === 'MULTIPLE') {
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
                  <button type="button" onClick={() => {
                    const newOpts = [...options];
                    newOpts.splice(i, 1);
                    setOptions(newOpts);
                  }} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                ) : <div style={{ width: '24px' }} />}
              </div>
            ))}
          </div>
          <button className="add-opt-btn" onClick={() => {
            if (options.length >= 8) {
              alert('Maximum 8 options.');
              return;
            }
            setOptions([...options, { text: '', correct: false }]);
          }}>
            <Plus size={13} strokeWidth={2.6} /> Add option
          </button>
        </>
      );
    } else if (type === 'NUMERIC') {
      return (
        <>
          <div className="section-label">Answer</div>
          <div className="form-grid">
            <div className="field full">
              <input
                type="text"
                placeholder="Correct numeric answer"
                value={numericAnswer}
                onChange={(e) => setNumericAnswer(e.target.value)}
              />
            </div>
            <div className="field full">
              <label className="check-row" style={{ width: 'fit-content' }}>
                <input
                  type="checkbox"
                  checked={numericRange}
                  onChange={(e) => setNumericRange(e.target.checked)}
                /> Accept a range of answers
              </label>
            </div>
          </div>
        </>
      );
    } else if (type === 'MATCH') {
      return (
        <>
          <div className="section-label">Column II options (Answers) <span className="req">*</span></div>
          <div className="field-hint-row">e.g. A. 18th century, B. 20th century. Provide the options here first.</div>
          <div style={{ marginBottom: '24px' }}>
            {matchColII.map((text, i) => (
              <div key={i} className="match-row" style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder={`Option e.g. ${String.fromCharCode(65 + i)}. `}
                  value={text}
                  onChange={(e) => {
                    const newColII = [...matchColII];
                    newColII[i] = e.target.value;
                    setMatchColII(newColII);
                  }}
                  style={{ flex: 1 }}
                />
                {matchColII.length > 2 ? (
                  <button className="opt-remove" onClick={() => {
                    const newColII = [...matchColII];
                    newColII.splice(i, 1);
                    setMatchColII(newColII);
                  }}>
                    <Trash2 size={15} />
                  </button>
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
                <input
                  type="text"
                  placeholder="Option text"
                  value={p.text}
                  onChange={(e) => {
                    const newColI = [...matchColI];
                    newColI[i].text = e.target.value;
                    setMatchColI(newColI);
                  }}
                  style={{ flex: 1 }}
                />
                <select
                  value={p.match}
                  onChange={(e) => {
                    const newColI = [...matchColI];
                    newColI[i].match = e.target.value;
                    setMatchColI(newColI);
                  }}
                  style={{ width: '200px' }}
                >
                  <option value="">Select match...</option>
                  {matchColII.map((col2Item, idx) => {
                    const trimmed = col2Item.trim();
                    if (!trimmed) return null;
                    const matchId = col2Item.includes('.') ? col2Item.split('.')[0].trim() : String.fromCharCode(65 + idx);
                    return (
                      <option key={idx} value={matchId}>
                        {trimmed.length > 30 ? trimmed.substring(0, 30) + '...' : trimmed}
                      </option>
                    );
                  })}
                </select>
                {matchColI.length > 2 ? (
                  <button className="opt-remove" onClick={() => {
                    const newColI = [...matchColI];
                    newColI.splice(i, 1);
                    setMatchColI(newColI);
                  }}>
                    <Trash2 size={15} />
                  </button>
                ) : <span style={{ width: '31px' }} />}
              </div>
            ))}
          </div>
          <button className="add-opt-btn" onClick={() => setMatchColI([...matchColI, { text: '', match: '' }])}>
            <Plus size={13} strokeWidth={2.6} /> Add row
          </button>
        </>
      );
    } else if (type === 'SUBJECTIVE') {
      return (
        <div className="field-hint-row" style={{ marginTop: '16px' }}>
          Subjective questions are graded manually — no answer key is needed here.
        </div>
      );
    }
  };

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

          <div className="type-select">
            {QUESTION_TYPES.map((t) => (
              <div
                key={t.id}
                className={`type-chip ${type === t.id ? 'active' : ''}`}
                onClick={() => {
                  if (type !== t.id) {
                    setType(t.id);
                    if (t.id === 'SINGLE' || t.id === 'MULTIPLE') setOptions([{ text: '', correct: false }, { text: '', correct: false }]);
                    else if (t.id === 'NUMERIC') { setNumericAnswer(''); setNumericRange(false); }
                    else if (t.id === 'MATCH') { setMatchColI([{ text: '', match: '' }, { text: '', match: '' }]); setMatchColII(['', '']); }
                  }
                }}
              >
                {t.label}
              </div>
            ))}
          </div>

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
            
            <div className="field full">
              <label>Question text <span className="req">*</span></label>
              <textarea placeholder="Type your question here..." value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            
            <div className="field full" style={{ margin: '8px 0 -8px' }}>
              <hr style={{ border: 0, borderTop: '1px solid var(--rule)' }} />
            </div>

            <div className="field full">
              {renderTypeFields()}
            </div>

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
                  <label>Order / Sequence</label>
                  <input type="number" min="1" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                </div>
                <div className="field">
                  <label className="check-row" style={{ marginTop: '22px' }}>
                    <input type="checkbox" checked={group} onChange={(e) => setGroup(e.target.checked)} />
                    Group with next question (passage)
                  </label>
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
