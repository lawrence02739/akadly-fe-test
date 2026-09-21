import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CodingCategory =
  | 'CODING_CHALLENGE'
  | 'CODE_DEBUGGING'
  | 'SQL_QUERY'
  | 'DOMAIN_SPECIFIC'
  | 'MACHINE_CODING_UI'
  | 'SYSTEM_DESIGN';

interface TestCase {
  input: string;
  expectedOutput: string;
  weightPercent: number;
}

interface CodingChallengeExtras {
  starterCode?: string;
  hints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  visibleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  instructionCyclesPerSecond?: number;
  optimalTimeComplexity?: string;
  spaceComplexity?: string;
  approachType?: 'ITERATIVE' | 'RECURSIVE';
}

interface CodeDebuggingExtras {
  buggyCode: string;
  hints: string[];
  numberOfBugs?: number;
  expectedOutput?: string;
}

interface SqlQueryExtras {
  databaseSchema: { tableName: string; columns: { name: string; type: string }[] }[];
  querySolutionDraft: string;
  expectedOutputColumns: string[];
  queryValidationMode: 'RESULT_SET_MATCH_ORDER_INSENSITIVE' | 'RESULT_SET_MATCH_ORDER_SENSITIVE' | 'EXACT_QUERY_MATCH';
}

export interface CodingContent {
  category: CodingCategory;
  title: string;
  problemDescription: string;
  language: string;
  timeLimitMinutes: number;
  challenge?: CodingChallengeExtras;
  debugging?: CodeDebuggingExtras;
  sql?: SqlQueryExtras;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<CodingCategory, string> = {
  CODING_CHALLENGE: 'Coding Challenge',
  CODE_DEBUGGING: 'Code Debugging',
  SQL_QUERY: 'SQL Query',
  DOMAIN_SPECIFIC: 'Domain Specific',
  MACHINE_CODING_UI: 'Machine Coding / UI',
  SYSTEM_DESIGN: 'System Design',
};

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'SQL'];

const STUB_CATEGORIES: CodingCategory[] = ['DOMAIN_SPECIFIC', 'MACHINE_CODING_UI', 'SYSTEM_DESIGN'];

// ── Sub-editors ───────────────────────────────────────────────────────────────

const CodingChallengeFields: React.FC<{
  value: CodingChallengeExtras;
  onChange: (v: CodingChallengeExtras) => void;
}> = ({ value, onChange }) => {
  const set = (patch: Partial<CodingChallengeExtras>) => onChange({ ...value, ...patch });

  return (
    <>
      <div className="section-label">Starter Code <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.starterCode || ''}
        onChange={(e) => set({ starterCode: e.target.value })}
        placeholder="// Starter code provided to the student"
        style={{ fontFamily: 'monospace', minHeight: '100px', resize: 'vertical', width: '100%', marginBottom: '14px' }}
      />

      <div className="section-label">Hints</div>
      {value.hints.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input
            type="text"
            value={h}
            onChange={(e) => { const hints = [...value.hints]; hints[i] = e.target.value; set({ hints }); }}
            placeholder={`Hint ${i + 1}`}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => set({ hints: value.hints.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button className="add-opt-btn" type="button" onClick={() => set({ hints: [...value.hints, ''] })} style={{ marginBottom: '14px' }}>
        <Plus size={13} strokeWidth={2.6} /> Add hint
      </button>

      <div className="section-label">Constraints</div>
      {value.constraints.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input
            type="text"
            value={c}
            onChange={(e) => { const constraints = [...value.constraints]; constraints[i] = e.target.value; set({ constraints }); }}
            placeholder={`e.g. 1 ≤ n ≤ 10^5`}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => set({ constraints: value.constraints.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button className="add-opt-btn" type="button" onClick={() => set({ constraints: [...value.constraints, ''] })} style={{ marginBottom: '14px' }}>
        <Plus size={13} strokeWidth={2.6} /> Add constraint
      </button>

      <div className="section-label">Examples</div>
      {value.examples.map((ex, i) => (
        <div key={i} style={{ border: '1px solid var(--rule)', borderRadius: '8px', padding: '10px', marginBottom: '8px', background: 'var(--bg-alt, #fafafa)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '12px' }}>Example {i + 1}</span>
            <button type="button" onClick={() => set({ examples: value.examples.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}><Trash2 size={13} /></button>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <div style={{ flex: 1 }}>
              <div className="field-hint-row">Input</div>
              <textarea value={ex.input} onChange={(e) => { const examples = [...value.examples]; examples[i] = { ...examples[i], input: e.target.value }; set({ examples }); }} rows={2} style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="field-hint-row">Output</div>
              <textarea value={ex.output} onChange={(e) => { const examples = [...value.examples]; examples[i] = { ...examples[i], output: e.target.value }; set({ examples }); }} rows={2} style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace' }} />
            </div>
          </div>
          <div className="field-hint-row">Explanation (optional)</div>
          <input type="text" value={ex.explanation || ''} onChange={(e) => { const examples = [...value.examples]; examples[i] = { ...examples[i], explanation: e.target.value }; set({ examples }); }} placeholder="Explain this example..." />
        </div>
      ))}
      <button className="add-opt-btn" type="button" onClick={() => set({ examples: [...value.examples, { input: '', output: '', explanation: '' }] })} style={{ marginBottom: '14px' }}>
        <Plus size={13} strokeWidth={2.6} /> Add example
      </button>

      <div className="section-label">Test Cases</div>
      {(['visibleTestCases', 'hiddenTestCases'] as const).map((field) => (
        <div key={field} style={{ marginBottom: '12px' }}>
          <div className="field-hint-row" style={{ fontWeight: 700, marginBottom: '6px' }}>{field === 'visibleTestCases' ? 'Visible' : 'Hidden'} test cases</div>
          {value[field].map((tc, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
              <textarea value={tc.input} onChange={(e) => { const tcs = [...value[field]]; tcs[i] = { ...tcs[i], input: e.target.value }; set({ [field]: tcs }); }} rows={2} placeholder="Input" style={{ flex: 1, fontFamily: 'monospace', resize: 'vertical' }} />
              <textarea value={tc.expectedOutput} onChange={(e) => { const tcs = [...value[field]]; tcs[i] = { ...tcs[i], expectedOutput: e.target.value }; set({ [field]: tcs }); }} rows={2} placeholder="Expected output" style={{ flex: 1, fontFamily: 'monospace', resize: 'vertical' }} />
              <div style={{ width: '70px' }}>
                <div className="field-hint-row">Weight %</div>
                <input type="number" min={0} max={100} value={tc.weightPercent} onChange={(e) => { const tcs = [...value[field]]; tcs[i] = { ...tcs[i], weightPercent: Number(e.target.value) }; set({ [field]: tcs }); }} />
              </div>
              <button type="button" onClick={() => set({ [field]: value[field].filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer', marginTop: '20px' }}><Trash2 size={14} /></button>
            </div>
          ))}
          <button className="add-opt-btn" type="button" onClick={() => set({ [field]: [...value[field], { input: '', expectedOutput: '', weightPercent: 0 }] })}>
            <Plus size={13} strokeWidth={2.6} /> Add test case
          </button>
        </div>
      ))}

      <div className="section-label" style={{ marginTop: '8px' }}>Settings</div>
      <div className="form-grid">
        <div className="field">
          <label>Optimal Time Complexity</label>
          <input type="text" value={value.optimalTimeComplexity || ''} onChange={(e) => set({ optimalTimeComplexity: e.target.value })} placeholder="e.g. O(n log n)" />
        </div>
        <div className="field">
          <label>Space Complexity</label>
          <input type="text" value={value.spaceComplexity || ''} onChange={(e) => set({ spaceComplexity: e.target.value })} placeholder="e.g. O(1)" />
        </div>
        <div className="field">
          <label>Approach Type</label>
          <select value={value.approachType || ''} onChange={(e) => set({ approachType: e.target.value as any || undefined })}>
            <option value="">Any</option>
            <option value="ITERATIVE">Iterative</option>
            <option value="RECURSIVE">Recursive</option>
          </select>
        </div>
      </div>
    </>
  );
};

const CodeDebuggingFields: React.FC<{
  value: CodeDebuggingExtras;
  onChange: (v: CodeDebuggingExtras) => void;
}> = ({ value, onChange }) => {
  const set = (patch: Partial<CodeDebuggingExtras>) => onChange({ ...value, ...patch });
  return (
    <>
      <div className="section-label">Buggy Code <span className="req">*</span></div>
      <textarea
        value={value.buggyCode}
        onChange={(e) => set({ buggyCode: e.target.value })}
        placeholder="// Paste the code with bugs here"
        style={{ fontFamily: 'monospace', minHeight: '140px', resize: 'vertical', width: '100%', marginBottom: '14px' }}
      />
      <div className="form-grid">
        <div className="field">
          <label>Number of bugs</label>
          <input type="number" min={1} value={value.numberOfBugs ?? ''} onChange={(e) => set({ numberOfBugs: e.target.value ? Number(e.target.value) : undefined })} placeholder="e.g. 3" />
        </div>
        <div className="field">
          <label>Expected output</label>
          <input type="text" value={value.expectedOutput || ''} onChange={(e) => set({ expectedOutput: e.target.value })} placeholder="What should the fixed code output?" />
        </div>
      </div>
      <div className="section-label">Hints</div>
      {value.hints.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input type="text" value={h} onChange={(e) => { const hints = [...value.hints]; hints[i] = e.target.value; set({ hints }); }} placeholder={`Hint ${i + 1}`} style={{ flex: 1 }} />
          <button type="button" onClick={() => set({ hints: value.hints.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button className="add-opt-btn" type="button" onClick={() => set({ hints: [...value.hints, ''] })}><Plus size={13} strokeWidth={2.6} /> Add hint</button>
    </>
  );
};

const SqlQueryFields: React.FC<{
  value: SqlQueryExtras;
  onChange: (v: SqlQueryExtras) => void;
}> = ({ value, onChange }) => {
  const set = (patch: Partial<SqlQueryExtras>) => onChange({ ...value, ...patch });

  const addTable = () =>
    set({ databaseSchema: [...value.databaseSchema, { tableName: '', columns: [{ name: '', type: '' }] }] });

  const addColumn = (ti: number) => {
    const databaseSchema = value.databaseSchema.map((t, idx) =>
      idx === ti ? { ...t, columns: [...t.columns, { name: '', type: '' }] } : t
    );
    set({ databaseSchema });
  };

  return (
    <>
      <div className="section-label">Database Schema <span className="req">*</span></div>
      {value.databaseSchema.map((table, ti) => (
        <div key={ti} style={{ border: '1px solid var(--rule)', borderRadius: '8px', padding: '10px', marginBottom: '10px', background: 'var(--bg-alt, #fafafa)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={table.tableName}
              onChange={(e) => {
                const databaseSchema = value.databaseSchema.map((t, idx) => idx === ti ? { ...t, tableName: e.target.value } : t);
                set({ databaseSchema });
              }}
              placeholder="Table name"
              style={{ flex: 1, fontWeight: 600 }}
            />
            <button type="button" onClick={() => set({ databaseSchema: value.databaseSchema.filter((_, idx) => idx !== ti) })} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}><Trash2 size={14} /></button>
          </div>
          {table.columns.map((col, ci) => (
            <div key={ci} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <input type="text" value={col.name} onChange={(e) => {
                const databaseSchema = value.databaseSchema.map((t, idx) => idx === ti ? { ...t, columns: t.columns.map((c, cidx) => cidx === ci ? { ...c, name: e.target.value } : c) } : t);
                set({ databaseSchema });
              }} placeholder="column_name" style={{ flex: 2 }} />
              <input type="text" value={col.type} onChange={(e) => {
                const databaseSchema = value.databaseSchema.map((t, idx) => idx === ti ? { ...t, columns: t.columns.map((c, cidx) => cidx === ci ? { ...c, type: e.target.value } : c) } : t);
                set({ databaseSchema });
              }} placeholder="VARCHAR / INT / etc." style={{ flex: 1 }} />
              <button type="button" onClick={() => {
                const databaseSchema = value.databaseSchema.map((t, idx) => idx === ti ? { ...t, columns: t.columns.filter((_, cidx) => cidx !== ci) } : t);
                set({ databaseSchema });
              }} style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}><Trash2 size={13} /></button>
            </div>
          ))}
          <button className="add-opt-btn" type="button" onClick={() => addColumn(ti)} style={{ fontSize: '12px' }}>
            <Plus size={11} strokeWidth={2.6} /> Add column
          </button>
        </div>
      ))}
      <button className="add-opt-btn" type="button" onClick={addTable} style={{ marginBottom: '14px' }}>
        <Plus size={13} strokeWidth={2.6} /> Add table
      </button>

      <div className="section-label">Reference / Solution Query <span className="req">*</span></div>
      <textarea
        value={value.querySolutionDraft}
        onChange={(e) => set({ querySolutionDraft: e.target.value })}
        placeholder="SELECT * FROM users WHERE ..."
        style={{ fontFamily: 'monospace', minHeight: '100px', resize: 'vertical', width: '100%', marginBottom: '14px' }}
      />

      <div className="section-label">Query Validation Mode <span className="req">*</span></div>
      <select
        value={value.queryValidationMode}
        onChange={(e) => set({ queryValidationMode: e.target.value as any })}
        style={{ marginBottom: '14px' }}
      >
        <option value="">Select...</option>
        <option value="RESULT_SET_MATCH_ORDER_INSENSITIVE">Result Set Match (Order Insensitive)</option>
        <option value="RESULT_SET_MATCH_ORDER_SENSITIVE">Result Set Match (Order Sensitive)</option>
        <option value="EXACT_QUERY_MATCH">Exact Query Match</option>
      </select>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  value: CodingContent;
  onChange: (v: CodingContent) => void;
}

export const CodingEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<CodingContent>) => onChange({ ...value, ...patch });

  const isStub = STUB_CATEGORIES.includes(value.category);

  const ensureChallenge = (): CodingChallengeExtras =>
    value.challenge || { starterCode: '', hints: [], examples: [], constraints: [], visibleTestCases: [], hiddenTestCases: [] };
  const ensureDebugging = (): CodeDebuggingExtras =>
    value.debugging || { buggyCode: '', hints: [] };
  const ensureSql = (): SqlQueryExtras =>
    value.sql || { databaseSchema: [], querySolutionDraft: '', expectedOutputColumns: [], queryValidationMode: 'RESULT_SET_MATCH_ORDER_INSENSITIVE' };

  return (
    <>
      {/* Category selector */}
      <div className="section-label">Category <span className="req">*</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {(Object.keys(CATEGORY_LABELS) as CodingCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => set({ category: cat })}
            style={{
              padding: '8px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: `2px solid ${value.category === cat ? 'var(--primary)' : 'var(--rule)'}`,
              background: value.category === cat ? 'var(--primary-50, #eff6ff)' : 'transparent',
              color: value.category === cat ? 'var(--primary)' : 'var(--ink)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {CATEGORY_LABELS[cat]}
            {STUB_CATEGORIES.includes(cat) && (
              <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.65 }}>soon</span>
            )}
          </button>
        ))}
      </div>

      {/* Common fields */}
      <div className="form-grid">
        <div className="field full">
          <label>Problem Title <span className="req">*</span></label>
          <input type="text" value={value.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Two Sum" />
        </div>
        <div className="field">
          <label>Programming Language <span className="req">*</span></label>
          <select value={value.language} onChange={(e) => set({ language: e.target.value })}>
            <option value="">Select language...</option>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Time Limit (minutes) <span className="req">*</span></label>
          <input type="number" min={1} value={value.timeLimitMinutes || ''} onChange={(e) => set({ timeLimitMinutes: Number(e.target.value) })} placeholder="e.g. 60" />
        </div>
      </div>

      <div className="section-label">Problem Description <span className="req">*</span></div>
      <textarea
        value={value.problemDescription}
        onChange={(e) => set({ problemDescription: e.target.value })}
        placeholder="Describe the problem clearly..."
        style={{ width: '100%', minHeight: '100px', resize: 'vertical', marginBottom: '16px' }}
      />

      {/* Stub placeholder */}
      {isStub && (
        <div
          style={{
            padding: '24px', background: 'var(--bg-alt, #fafafa)',
            border: '1px dashed var(--rule-strong)', borderRadius: '10px',
            textAlign: 'center', color: 'var(--ink-soft)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚧</div>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>{CATEGORY_LABELS[value.category]}</div>
          <div style={{ fontSize: '13px' }}>
            Extended fields for this category are coming soon. The common fields above will be saved.
          </div>
        </div>
      )}

      {/* Category-specific fields */}
      {!isStub && value.category === 'CODING_CHALLENGE' && (
        <CodingChallengeFields
          value={ensureChallenge()}
          onChange={(challenge) => set({ challenge })}
        />
      )}
      {!isStub && value.category === 'CODE_DEBUGGING' && (
        <CodeDebuggingFields
          value={ensureDebugging()}
          onChange={(debugging) => set({ debugging })}
        />
      )}
      {!isStub && value.category === 'SQL_QUERY' && (
        <SqlQueryFields
          value={ensureSql()}
          onChange={(sql) => set({ sql })}
        />
      )}
    </>
  );
};

export const defaultCodingContent = (): CodingContent => ({
  category: 'CODING_CHALLENGE',
  title: '',
  problemDescription: '',
  language: '',
  timeLimitMinutes: 60,
  challenge: {
    starterCode: '',
    hints: [],
    examples: [],
    constraints: [],
    visibleTestCases: [],
    hiddenTestCases: [],
  },
});
