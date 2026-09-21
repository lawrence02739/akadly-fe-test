import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface AssertionReasonOption {
  text: string;
  correct: boolean;
}

export interface AssertionReasonContent {
  assertion: string;
  reason: string;
  options: AssertionReasonOption[];
  explanation?: string;
}

const DEFAULT_OPTIONS: AssertionReasonOption[] = [
  { text: 'Both A and R are true and R is the correct explanation of A.', correct: false },
  { text: 'Both A and R are true but R is NOT the correct explanation of A.', correct: false },
  { text: 'A is true but R is false.', correct: false },
  { text: 'A is false but R is true.', correct: false },
];

interface Props {
  value: AssertionReasonContent;
  onChange: (v: AssertionReasonContent) => void;
}

export const AssertionReasonEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<AssertionReasonContent>) => onChange({ ...value, ...patch });

  const updateOption = (i: number, patch: Partial<AssertionReasonOption>) => {
    const options = value.options.map((o, idx) => idx === i ? { ...o, ...patch } : o);
    set({ options });
  };

  const setCorrect = (i: number) => {
    const options = value.options.map((o, idx) => ({ ...o, correct: idx === i }));
    set({ options });
  };

  return (
    <>
      <div className="section-label">Assertion (Statement A) <span className="req">*</span></div>
      <textarea
        value={value.assertion}
        onChange={(e) => set({ assertion: e.target.value })}
        placeholder="Write Assertion A..."
        style={{ width: '100%', minHeight: '72px', resize: 'vertical', marginBottom: '12px' }}
      />

      <div className="section-label">Reason (Statement R) <span className="req">*</span></div>
      <textarea
        value={value.reason}
        onChange={(e) => set({ reason: e.target.value })}
        placeholder="Write Reason R..."
        style={{ width: '100%', minHeight: '72px', resize: 'vertical', marginBottom: '16px' }}
      />

      <div className="section-label">Answer Options <span className="req">*</span></div>
      <div className="field-hint-row" style={{ marginBottom: '10px' }}>
        Select the correct relationship between A and R. Options are pre-filled with standard NEET/JEE phrasings — edit if needed.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {value.options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="radio"
              name="ar_correct"
              checked={opt.correct}
              onChange={() => setCorrect(i)}
              style={{ marginTop: '10px', accentColor: 'var(--primary)', width: '16px', height: '16px', flexShrink: 0 }}
            />
            <textarea
              value={opt.text}
              onChange={(e) => updateOption(i, { text: e.target.value })}
              style={{ flex: 1, minHeight: '56px', resize: 'vertical' }}
            />
            {value.options.length > 2 && (
              <button
                type="button"
                onClick={() => set({ options: value.options.filter((_, idx) => idx !== i) })}
                style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer', marginTop: '8px' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className="add-opt-btn"
        type="button"
        onClick={() => set({ options: [...value.options, { text: '', correct: false }] })}
      >
        <Plus size={13} strokeWidth={2.6} /> Add option
      </button>

      <div className="section-label" style={{ marginTop: '16px' }}>Explanation <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.explanation || ''}
        onChange={(e) => set({ explanation: e.target.value })}
        placeholder="Explain the correct answer..."
        style={{ width: '100%', minHeight: '72px', resize: 'vertical' }}
      />
    </>
  );
};

export const defaultAssertionReasonContent = (): AssertionReasonContent => ({
  assertion: '',
  reason: '',
  options: DEFAULT_OPTIONS.map((o) => ({ ...o })),
  explanation: '',
});
