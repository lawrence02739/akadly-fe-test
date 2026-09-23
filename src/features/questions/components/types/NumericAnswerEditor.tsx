import React from 'react';

export interface NumericAnswerContent {
  prompt: string;
  prefix?: string;
  correctAnswer: number | '';
  suffix?: string;
  tolerance?: number;
  integerOnly: boolean;
  min?: number;
  max?: number;
}

interface Props {
  value: NumericAnswerContent;
  onChange: (v: NumericAnswerContent) => void;
  variant: 'NUMERIC' | 'INTEGER' | 'CALCULATION';
}

export const NumericAnswerEditor: React.FC<Props> = ({ value, onChange, variant }) => {
  const set = (patch: Partial<NumericAnswerContent>) => onChange({ ...value, ...patch });
  const lockedInteger = variant === 'INTEGER';
  const showTolerance = !lockedInteger && !value.integerOnly;
  const showMinMax = lockedInteger || value.integerOnly;

  return (
    <div>
      <div className="field full" style={{ marginBottom: '16px' }}>
        <label>Question Description <span className="req">*</span></label>
        <textarea
          placeholder="Enter the prompt or scenario..."
          value={value.prompt}
          onChange={(e) => set({ prompt: e.target.value })}
        />
      </div>

      <div className="section-label" style={{ marginBottom: '12px' }}>Configure Answer</div>
      
      {!lockedInteger && (
        <label className="check-row" style={{ display: 'inline-flex', marginBottom: '16px' }}>
          <input
            type="checkbox"
            checked={value.integerOnly}
            onChange={(e) => set({ integerOnly: e.target.checked })}
          />
          Integer Answer Only
        </label>
      )}

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 2fr 1fr', marginBottom: '16px' }}>
        <div className="field">
          <label>Prefix <span className="hint">(Optional)</span></label>
          <input
            type="text"
            placeholder="e.g. $"
            value={value.prefix || ''}
            onChange={(e) => set({ prefix: e.target.value })}
          />
        </div>
        
        <div className="field">
          <label>Correct Answer <span className="req">*</span></label>
          <input
            type="number"
            placeholder="e.g. 42"
            step={(lockedInteger || value.integerOnly) ? '1' : 'any'}
            value={value.correctAnswer === '' ? '' : value.correctAnswer}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : Number(e.target.value);
              set({ correctAnswer: val });
            }}
          />
        </div>

        <div className="field">
          <label>Suffix <span className="hint">(Optional)</span></label>
          <input
            type="text"
            placeholder="e.g. kg"
            value={value.suffix || ''}
            onChange={(e) => set({ suffix: e.target.value })}
          />
        </div>
      </div>

      {showTolerance && (
        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="field">
            <label>Tolerance / Margin of Error</label>
            <input
              type="number"
              placeholder="e.g. 0.002"
              step="any"
              value={value.tolerance === undefined ? '' : value.tolerance}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                set({ tolerance: val });
              }}
            />
          </div>
        </div>
      )}

      {showMinMax && (
        <div className="form-grid" style={{ marginBottom: '16px' }}>
          <div className="field">
            <label>Minimum Allowed Value</label>
            <input
              type="number"
              placeholder="e.g. 1"
              step={(lockedInteger || value.integerOnly) ? '1' : 'any'}
              value={value.min === undefined ? '' : value.min}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                set({ min: val });
              }}
            />
          </div>
          <div className="field">
            <label>Maximum Allowed Value</label>
            <input
              type="number"
              placeholder="e.g. 100"
              step={(lockedInteger || value.integerOnly) ? '1' : 'any'}
              value={value.max === undefined ? '' : value.max}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                set({ max: val });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const defaultNumericAnswerContent = (variant: 'NUMERIC'|'INTEGER'|'CALCULATION'): NumericAnswerContent => ({
  prompt: '',
  correctAnswer: '',
  integerOnly: variant === 'INTEGER',
});
