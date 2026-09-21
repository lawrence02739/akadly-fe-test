import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type BlankKind = 'text' | 'number' | 'picklist';

interface TextBlank {
  id: string;
  kind: 'text';
  correctAnswer: string;
  alternates: string[];
  caseSensitive: boolean;
}

interface NumberBlank {
  id: string;
  kind: 'number';
  prefix?: string;
  suffix?: string;
  correctAnswer: number | '';
  tolerance?: number;
  integerOnly: boolean;
  min?: number;
  max?: number;
}

interface PicklistBlank {
  id: string;
  kind: 'picklist';
  optionGroupId: string;
  correctOptionId: string;
}

type Blank = TextBlank | NumberBlank | PicklistBlank;

interface OptionGroup {
  id: string;
  name: string;
  options: string[];
}

export interface FillBlankContent {
  template: string;
  blanks: Blank[];
  optionGroups?: OptionGroup[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const uid = () => `blank_${Math.random().toString(36).slice(2, 8)}`;
const gid = () => `grp_${Math.random().toString(36).slice(2, 8)}`;

// ── Sub-editors ───────────────────────────────────────────────────────────────

const TextBlankEditor: React.FC<{
  blank: TextBlank;
  onChange: (b: TextBlank) => void;
}> = ({ blank, onChange }) => {
  const set = (patch: Partial<TextBlank>) => onChange({ ...blank, ...patch });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="field-hint-row">Correct answer</div>
      <input
        type="text"
        value={blank.correctAnswer}
        onChange={(e) => set({ correctAnswer: e.target.value })}
        placeholder="Exact answer"
      />
      <div className="field-hint-row">Alternative spellings / phrasings (one per line)</div>
      <textarea
        rows={2}
        value={blank.alternates.join('\n')}
        onChange={(e) =>
          set({ alternates: e.target.value.split('\n').filter(Boolean) })
        }
        placeholder="synonym&#10;alternate spelling"
        style={{ resize: 'vertical' }}
      />
      <label className="check-row" style={{ width: 'fit-content' }}>
        <input
          type="checkbox"
          checked={blank.caseSensitive}
          onChange={(e) => set({ caseSensitive: e.target.checked })}
        />
        Case-sensitive matching
      </label>
    </div>
  );
};

const NumberBlankEditor: React.FC<{
  blank: NumberBlank;
  onChange: (b: NumberBlank) => void;
}> = ({ blank, onChange }) => {
  const set = (patch: Partial<NumberBlank>) => onChange({ ...blank, ...patch });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div className="field-hint-row">Prefix (optional)</div>
          <input type="text" value={blank.prefix || ''} onChange={(e) => set({ prefix: e.target.value })} placeholder="$" />
        </div>
        <div style={{ flex: 2 }}>
          <div className="field-hint-row">Correct answer *</div>
          <input type="number" value={blank.correctAnswer} onChange={(e) => set({ correctAnswer: e.target.value === '' ? '' : Number(e.target.value) })} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="field-hint-row">Suffix (optional)</div>
          <input type="text" value={blank.suffix || ''} onChange={(e) => set({ suffix: e.target.value })} placeholder="kg" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div className="field-hint-row">Tolerance (±)</div>
          <input type="number" min={0} value={blank.tolerance ?? ''} onChange={(e) => set({ tolerance: e.target.value === '' ? undefined : Number(e.target.value) })} placeholder="0" />
        </div>
      </div>
      <label className="check-row" style={{ width: 'fit-content' }}>
        <input type="checkbox" checked={blank.integerOnly} onChange={(e) => set({ integerOnly: e.target.checked })} />
        Integer only
      </label>
      {blank.integerOnly && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div className="field-hint-row">Min</div>
            <input type="number" value={blank.min ?? ''} onChange={(e) => set({ min: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="field-hint-row">Max</div>
            <input type="number" value={blank.max ?? ''} onChange={(e) => set({ max: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </div>
        </div>
      )}
    </div>
  );
};

const PicklistBlankEditor: React.FC<{
  blank: PicklistBlank;
  groups: OptionGroup[];
  onChange: (b: PicklistBlank) => void;
}> = ({ blank, groups, onChange }) => {
  const set = (patch: Partial<PicklistBlank>) => onChange({ ...blank, ...patch });
  const selectedGroup = groups.find((g) => g.id === blank.optionGroupId);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="field-hint-row">Option group</div>
      <select value={blank.optionGroupId} onChange={(e) => set({ optionGroupId: e.target.value, correctOptionId: '' })}>
        <option value="">Select group...</option>
        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      {selectedGroup && (
        <>
          <div className="field-hint-row">Correct option</div>
          <select value={blank.correctOptionId} onChange={(e) => set({ correctOptionId: e.target.value })}>
            <option value="">Select correct option...</option>
            {selectedGroup.options.filter(Boolean).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  value: FillBlankContent;
  onChange: (v: FillBlankContent) => void;
}

export const FillBlankEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<FillBlankContent>) => onChange({ ...value, ...patch });

  const addBlank = (kind: BlankKind) => {
    const id = uid();
    const n = value.blanks.length + 1;
    const token = `{{blank-${n}:${kind}}}`;
    const newBlank: Blank =
      kind === 'text'
        ? { id, kind: 'text', correctAnswer: '', alternates: [], caseSensitive: false }
        : kind === 'number'
        ? { id, kind: 'number', correctAnswer: '', integerOnly: false }
        : { id, kind: 'picklist', optionGroupId: '', correctOptionId: '' };
    set({
      template: (value.template || '') + ' ' + token,
      blanks: [...value.blanks, newBlank],
    });
  };

  const updateBlank = (i: number, b: Blank) => {
    const blanks = [...value.blanks];
    blanks[i] = b;
    set({ blanks });
  };

  const removeBlank = (i: number) => {
    const blanks = value.blanks.filter((_, idx) => idx !== i);
    set({ blanks });
  };

  const addGroup = () => {
    const grp: OptionGroup = { id: gid(), name: `Group ${(value.optionGroups || []).length + 1}`, options: [] };
    set({ optionGroups: [...(value.optionGroups || []), grp] });
  };

  const updateGroup = (i: number, grp: OptionGroup) => {
    const groups = [...(value.optionGroups || [])];
    groups[i] = grp;
    set({ optionGroups: groups });
  };

  const hasPicklist = value.blanks.some((b) => b.kind === 'picklist');

  return (
    <>
      <div className="section-label">Question Template <span className="req">*</span></div>
      <div className="field-hint-row" style={{ marginBottom: '8px' }}>
        Use the buttons below to insert blank tokens into the template. Each token like <code>{'{{blank-1:text}}'}</code> will become a fill-in field.
      </div>
      <textarea
        value={value.template || ''}
        onChange={(e) => set({ template: e.target.value })}
        placeholder="Type your sentence here, then click 'Add blank' to insert a {{blank-1:text}} token..."
        style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', marginBottom: '8px' }}
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {(['text', 'number', 'picklist'] as BlankKind[]).map((k) => (
          <button key={k} className="add-opt-btn" type="button" onClick={() => addBlank(k)}>
            <Plus size={13} strokeWidth={2.6} /> Add {k} blank
          </button>
        ))}
      </div>

      {value.blanks.length > 0 && (
        <>
          <div className="section-label">Blank Configuration</div>
          {value.blanks.map((blank, i) => (
            <div
              key={blank.id}
              style={{
                border: '1px solid var(--rule)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '10px',
                background: 'var(--bg-alt, #fafafa)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>
                  Blank {i + 1} — <code style={{ background: 'var(--rule)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{`blank-${i+1}:${blank.kind}`}</code>
                </span>
                <button
                  type="button"
                  onClick={() => removeBlank(i)}
                  style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {blank.kind === 'text' && (
                <TextBlankEditor blank={blank as TextBlank} onChange={(b) => updateBlank(i, b)} />
              )}
              {blank.kind === 'number' && (
                <NumberBlankEditor blank={blank as NumberBlank} onChange={(b) => updateBlank(i, b)} />
              )}
              {blank.kind === 'picklist' && (
                <PicklistBlankEditor
                  blank={blank as PicklistBlank}
                  groups={value.optionGroups || []}
                  onChange={(b) => updateBlank(i, b)}
                />
              )}
            </div>
          ))}
        </>
      )}

      {hasPicklist && (
        <>
          <div className="section-label" style={{ marginTop: '12px' }}>Option Groups</div>
          <div className="field-hint-row">Define the dropdown choices for picklist blanks.</div>
          {(value.optionGroups || []).map((grp, i) => (
            <div key={grp.id} style={{ border: '1px solid var(--rule)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <input
                type="text"
                value={grp.name}
                onChange={(e) => updateGroup(i, { ...grp, name: e.target.value })}
                placeholder="Group name"
                style={{ marginBottom: '8px', fontWeight: 600 }}
              />
              <textarea
                value={grp.options.join('\n')}
                onChange={(e) => updateGroup(i, { ...grp, options: e.target.value.split('\n') })}
                placeholder="One option per line"
                rows={4}
                style={{ resize: 'vertical', width: '100%' }}
              />
            </div>
          ))}
          <button className="add-opt-btn" type="button" onClick={addGroup}>
            <Plus size={13} strokeWidth={2.6} /> Add option group
          </button>
        </>
      )}
    </>
  );
};

export const defaultFillBlankContent = (): FillBlankContent => ({
  template: '',
  blanks: [],
  optionGroups: [],
});
