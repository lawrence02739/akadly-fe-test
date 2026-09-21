import React from 'react';

interface TrueFalseContent {
  correctAnswer: boolean | null;
  explanation?: string;
}

interface Props {
  value: TrueFalseContent;
  onChange: (v: TrueFalseContent) => void;
}

export const TrueFalseEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<TrueFalseContent>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="section-label">Correct Answer <span className="req">*</span></div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[true, false].map((opt) => (
          <label
            key={String(opt)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              border: `2px solid ${value.correctAnswer === opt ? 'var(--primary)' : 'var(--rule)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              background: value.correctAnswer === opt ? 'var(--primary-50, #eff6ff)' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.15s',
            }}
          >
            <input
              type="radio"
              name="tf_correct"
              checked={value.correctAnswer === opt}
              onChange={() => set({ correctAnswer: opt })}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
            />
            {opt ? '✓ True' : '✗ False'}
          </label>
        ))}
      </div>

      <div className="section-label">Explanation <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        placeholder="Explain why the answer is correct..."
        value={value.explanation || ''}
        onChange={(e) => set({ explanation: e.target.value })}
        style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
      />
    </>
  );
};

export const defaultTrueFalseContent = (): TrueFalseContent => ({
  correctAnswer: null,
  explanation: '',
});
