import React from 'react';
import { X } from 'lucide-react';

export interface ShortAnswerContent {
  modelAnswer: string;
  autoGradeKeywords: string[];
  maxCharacterLimit: number;
  gradingStrictness: 'STRICT' | 'LENIENCY_ALLOWED';
  feedbackMechanism?: string;
}

interface Props {
  value: ShortAnswerContent;
  onChange: (v: ShortAnswerContent) => void;
}

const FEEDBACK_OPTIONS = [
  { value: '', label: 'None (No feedback mechanism)' },
  { value: 'AUTO', label: 'Auto-graded' },
  { value: 'PEER_REVIEW', label: 'Peer Review System' },
  { value: 'INSTRUCTOR_REVIEW', label: 'Instructor Review' },
];

export const ShortAnswerEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<ShortAnswerContent>) => onChange({ ...value, ...patch });
  const [kw, setKw] = React.useState('');

  const addKeyword = () => {
    const trimmed = kw.trim();
    if (!trimmed || value.autoGradeKeywords.includes(trimmed)) return;
    set({ autoGradeKeywords: [...value.autoGradeKeywords, trimmed] });
    setKw('');
  };

  return (
    <>
      <div className="section-label">Model Answer <span className="req">*</span></div>
      <div className="field-hint-row">Used for grading reference — not shown to students during the exam.</div>
      <textarea
        value={value.modelAnswer}
        onChange={(e) => set({ modelAnswer: e.target.value })}
        placeholder="Write the ideal/model answer here..."
        style={{ width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
      />

      <div className="section-label">Auto-grade Keywords</div>
      <div className="field-hint-row">Score weighting depends on matches — add key terms the answer should contain.</div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="text"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
          placeholder="Type keyword and press Enter..."
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={addKeyword}>Add</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {value.autoGradeKeywords.map((k) => (
          <span
            key={k}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              background: 'var(--primary-50, #eff6ff)', color: 'var(--primary)',
              border: '1px solid var(--primary)', borderRadius: '20px',
              padding: '3px 10px', fontSize: '12px', fontWeight: 600,
            }}
          >
            {k}
            <button
              type="button"
              onClick={() => set({ autoGradeKeywords: value.autoGradeKeywords.filter((x) => x !== k) })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Max Character Limit <span className="req">*</span></label>
          <input
            type="number"
            min={1}
            value={value.maxCharacterLimit || ''}
            onChange={(e) => set({ maxCharacterLimit: Number(e.target.value) })}
            placeholder="e.g. 500"
          />
        </div>
        <div className="field">
          <label>Grading Strictness <span className="req">*</span></label>
          <select
            value={value.gradingStrictness}
            onChange={(e) => set({ gradingStrictness: e.target.value as any })}
          >
            <option value="">Select...</option>
            <option value="STRICT">Strict</option>
            <option value="LENIENCY_ALLOWED">Leniency Allowed</option>
          </select>
        </div>
        <div className="field">
          <label>Feedback Mechanism</label>
          <select
            value={value.feedbackMechanism || ''}
            onChange={(e) => set({ feedbackMechanism: e.target.value || undefined })}
          >
            {FEEDBACK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export const defaultShortAnswerContent = (): ShortAnswerContent => ({
  modelAnswer: '',
  autoGradeKeywords: [],
  maxCharacterLimit: 500,
  gradingStrictness: 'LENIENCY_ALLOWED',
  feedbackMechanism: '',
});
