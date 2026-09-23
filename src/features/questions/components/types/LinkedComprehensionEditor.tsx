import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { SubQuestionPicker } from '../SubQuestionPicker';
import type { QuestionType } from '../../../quizzes/types';

const EXCLUDED_TYPES: QuestionType[] = ['LINKED_COMPREHENSION', 'VIVA_ORAL'];

const SCENARIO_MODES = [
  { id: 'COMPREHENSION',      label: 'Comprehension',         hint: 'Reading passage with questions' },
  { id: 'CASE_STUDY',         label: 'Case Study',            hint: 'Business/medical scenario analysis' },
  { id: 'CBQ',                label: 'CBQ',                   hint: 'Competency-based questions' },
  { id: 'DATA_INTERPRETATION',label: 'Data Interpretation',   hint: 'Tables/charts with questions' },
  { id: 'TBS',                label: 'Task Based Simulation', hint: 'Simulation tasks (CPA/CMA style)' },
] as const;

const PASSAGE_LABEL: Record<string, string> = {
  COMPREHENSION: 'Reading Passage',
  CASE_STUDY: 'Case Scenario',
  CBQ: 'Scenario Document',
  DATA_INTERPRETATION: 'Data Source Text',
  TBS: 'Task Document',
};

interface RefTable {
  columns: string[];
  rows: string[][];
}

interface ReferenceData {
  mode: 'TABLE' | 'CHART_IMAGE' | 'PDF';
  table?: RefTable;
  chartImage?: { fileUrl: string };
  pdf?: { fileUrl: string };
}

export interface LinkedComprehensionContent {
  scenarioMode: 'COMPREHENSION' | 'CASE_STUDY' | 'CBQ' | 'DATA_INTERPRETATION' | 'TBS';
  passage: string;
  referenceData?: ReferenceData;
  subQuestions: string[];
}

interface Props {
  value: LinkedComprehensionContent;
  onChange: (v: LinkedComprehensionContent) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export const LinkedComprehensionEditor: React.FC<Props> = ({ value, onChange, onFileUpload }) => {
  const set = (patch: Partial<LinkedComprehensionContent>) => onChange({ ...value, ...patch });
  const [refMode, setRefMode] = useState<'TABLE' | 'CHART_IMAGE' | 'PDF' | 'NONE'>(
    value.referenceData?.mode ?? 'NONE'
  );
  const [uploading, setUploading] = useState(false);

  const setRef = (patch: Partial<ReferenceData>) => {
    const current = value.referenceData || { mode: refMode as any };
    set({ referenceData: { ...current, ...patch } });
  };

  const handleRefModeChange = (mode: 'TABLE' | 'CHART_IMAGE' | 'PDF' | 'NONE') => {
    setRefMode(mode);
    if (mode === 'NONE') {
      set({ referenceData: undefined });
    } else {
      const base: ReferenceData = { mode };
      if (mode === 'TABLE') base.table = { columns: ['Column 1'], rows: [['Row 1']] };
      set({ referenceData: base });
    }
  };

  const handleFileUpload = async (file: File, field: 'chartImage' | 'pdf') => {
    if (!onFileUpload) {
      const url = URL.createObjectURL(file);
      setRef({ [field]: { fileUrl: url } });
      return;
    }
    setUploading(true);
    try {
      const url = await onFileUpload(file);
      setRef({ [field]: { fileUrl: url } });
    } finally {
      setUploading(false);
    }
  };

  // Table helpers
  const table = value.referenceData?.table || { columns: ['Column 1'], rows: [['Row 1']] };

  const addTableColumn = () => {
    const columns = [...table.columns, `Column ${table.columns.length + 1}`];
    const rows = table.rows.map((r) => [...r, '']);
    setRef({ table: { columns, rows } });
  };
  const addTableRow = () => {
    setRef({ table: { ...table, rows: [...table.rows, new Array(table.columns.length).fill('')] } });
  };
  const removeTableColumn = (ci: number) => {
    if (table.columns.length <= 1) return;
    setRef({ table: { columns: table.columns.filter((_, i) => i !== ci), rows: table.rows.map((r) => r.filter((_, i) => i !== ci)) } });
  };
  const removeTableRow = (ri: number) => {
    if (table.rows.length <= 1) return;
    setRef({ table: { ...table, rows: table.rows.filter((_, i) => i !== ri) } });
  };
  const updateCell = (ri: number, ci: number, val: string) => {
    const rows = table.rows.map((r, rIdx) => rIdx === ri ? r.map((c, cIdx) => cIdx === ci ? val : c) : r);
    setRef({ table: { ...table, rows } });
  };
  const updateColumnHeader = (ci: number, val: string) => {
    const columns = table.columns.map((c, i) => i === ci ? val : c);
    setRef({ table: { ...table, columns } });
  };

  const passageLabel = PASSAGE_LABEL[value.scenarioMode] || 'Passage';

  return (
    <>
      {/* Scenario Mode chips */}
      <div className="section-label">Scenario Type <span className="req">*</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {SCENARIO_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => set({ scenarioMode: m.id as any })}
            title={m.hint}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
              border: `2px solid ${value.scenarioMode === m.id ? 'var(--primary)' : 'var(--rule)'}`,
              background: value.scenarioMode === m.id ? 'var(--primary)' : 'transparent',
              color: value.scenarioMode === m.id ? '#fff' : 'var(--ink)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Passage */}
      <div className="section-label">{passageLabel} <span className="req">*</span></div>
      <textarea
        value={value.passage}
        onChange={(e) => set({ passage: e.target.value })}
        placeholder={`Paste or type the ${passageLabel.toLowerCase()} here...`}
        style={{ width: '100%', minHeight: '140px', resize: 'vertical', marginBottom: '16px' }}
      />

      {/* Reference Data section */}
      <div className="section-label">Reference Data <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <div className="field-hint-row" style={{ marginBottom: '10px' }}>
        Attach supplementary data (table, chart, or PDF) that learners can refer to.
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {(['NONE', 'TABLE', 'CHART_IMAGE', 'PDF'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleRefModeChange(m)}
            style={{
              padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              border: `1.5px solid ${refMode === m ? 'var(--primary)' : 'var(--rule)'}`,
              background: refMode === m ? 'var(--primary-50, #eff6ff)' : 'transparent',
              color: refMode === m ? 'var(--primary)' : 'var(--ink)',
              cursor: 'pointer',
            }}
          >
            {m === 'NONE' ? 'None' : m === 'CHART_IMAGE' ? 'Chart Image' : m === 'PDF' ? 'PDF' : 'Table'}
          </button>
        ))}
      </div>

      {refMode === 'TABLE' && (
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
            <thead>
              <tr>
                {table.columns.map((col, ci) => (
                  <th key={ci} style={{ border: '1px solid var(--rule)', padding: '4px 6px', background: 'var(--bg-alt)' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={col}
                        onChange={(e) => updateColumnHeader(ci, e.target.value)}
                        style={{ flex: 1, fontWeight: 700, fontSize: '12px', border: 'none', background: 'transparent' }}
                      />
                      {table.columns.length > 1 && (
                        <button type="button" onClick={() => removeTableColumn(ci)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', padding: 0 }}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ border: '1px solid var(--rule)', padding: '4px 6px', background: 'var(--bg-alt)' }}>
                  <button type="button" className="btn btn-ghost" onClick={addTableColumn} style={{ fontSize: '11px', padding: '2px 6px' }}>
                    <Plus size={11} /> Col
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ border: '1px solid var(--rule)', padding: '4px 6px' }}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '12px' }}
                      />
                    </td>
                  ))}
                  <td style={{ border: '1px solid var(--rule)', padding: '4px 6px' }}>
                    {table.rows.length > 1 && (
                      <button type="button" onClick={() => removeTableRow(ri)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)' }}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="add-opt-btn" onClick={addTableRow} style={{ marginTop: '6px' }}>
            <Plus size={13} strokeWidth={2.6} /> Add row
          </button>
        </div>
      )}

      {refMode === 'CHART_IMAGE' && (
        <div style={{ marginBottom: '16px' }}>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'chartImage'); }}
          />
          {uploading && <div className="field-hint-row">Uploading...</div>}
          {value.referenceData?.chartImage?.fileUrl && (
            <img
              src={value.referenceData.chartImage.fileUrl}
              alt="Chart"
              style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px', borderRadius: '6px', border: '1px solid var(--rule)' }}
            />
          )}
        </div>
      )}

      {refMode === 'PDF' && (
        <div style={{ marginBottom: '16px' }}>
          <div className="field-hint-row" style={{ marginBottom: '6px' }}>Upload a PDF document as reference material.</div>
          <input
            type="file"
            accept="application/pdf"
            disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'pdf'); }}
          />
          {uploading && <div className="field-hint-row">Uploading...</div>}
          {value.referenceData?.pdf?.fileUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--primary)', fontSize: '13px' }}>
              <Upload size={14} /> <a href={value.referenceData.pdf.fileUrl} target="_blank" rel="noopener noreferrer">View uploaded PDF</a>
            </div>
          )}
        </div>
      )}

      {/* Sub-questions */}
      <div className="section-label">Sub-Questions <span className="req">*</span></div>
      <div className="field-hint-row" style={{ marginBottom: '10px' }}>
        Link existing questions from the bank. Students will see the passage above and answer these questions.
      </div>
      <SubQuestionPicker
        value={value.subQuestions}
        onChange={(ids) => set({ subQuestions: ids })}
        excludeTypes={EXCLUDED_TYPES}
      />
    </>
  );
};

export const defaultLinkedComprehensionContent = (): LinkedComprehensionContent => ({
  scenarioMode: 'COMPREHENSION',
  passage: '',
  subQuestions: [],
});
