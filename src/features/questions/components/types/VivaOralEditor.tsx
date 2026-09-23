import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { SubQuestionPicker } from '../SubQuestionPicker';
import type { QuestionType } from '../../../quizzes/types';

const EXCLUDED_TYPES: QuestionType[] = ['LINKED_COMPREHENSION', 'VIVA_ORAL'];

export interface VivaOralContent {
  mode: 'LISTEN_RESPOND' | 'ORAL_PROMPT';
  audioAsset?: { fileUrl: string; fileName: string };
  audioType?: 'LECTURE' | 'CONVERSATION';
  transcript?: string;
  replayLimit?: number;
  dialect?: string;
  targetAccent?: string;
  wordLimitPerBlank?: number;
  answerMatchMode?: 'STRICT_CASE_SENSITIVE' | 'STRICT_CASE_INSENSITIVE';
  subQuestions?: string[];
  prompts?: { question: string; expectedPoints: string[]; responseTimeLimitSeconds?: number }[];
  recordingRequired?: boolean;
}

interface Props {
  value: VivaOralContent;
  onChange: (v: VivaOralContent) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export const VivaOralEditor: React.FC<Props> = ({ value, onChange, onFileUpload }) => {
  const set = (patch: Partial<VivaOralContent>) => onChange({ ...value, ...patch });
  const [uploading, setUploading] = useState(false);
  const [kwInputs, setKwInputs] = useState<string[]>((value.prompts || []).map(() => ''));

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onFileUpload) {
      setUploading(true);
      try {
        const url = await onFileUpload(file);
        set({ audioAsset: { fileUrl: url, fileName: file.name } });
      } finally {
        setUploading(false);
      }
    } else {
      const url = URL.createObjectURL(file);
      set({ audioAsset: { fileUrl: url, fileName: file.name } });
    }
  };

  // Prompt helpers
  const prompts = value.prompts || [];

  const addPrompt = () => {
    set({ prompts: [...prompts, { question: '', expectedPoints: [] }] });
    setKwInputs((ki) => [...ki, '']);
  };

  const removePrompt = (i: number) => {
    set({ prompts: prompts.filter((_, idx) => idx !== i) });
    setKwInputs((ki) => ki.filter((_, idx) => idx !== i));
  };

  const updatePrompt = (i: number, patch: Partial<typeof prompts[0]>) => {
    const updated = prompts.map((p, idx) => idx === i ? { ...p, ...patch } : p);
    set({ prompts: updated });
  };

  const addKeyword = (i: number) => {
    const kw = kwInputs[i]?.trim();
    if (!kw) return;
    const pts = [...(prompts[i]?.expectedPoints || [])];
    if (!pts.includes(kw)) {
      updatePrompt(i, { expectedPoints: [...pts, kw] });
    }
    setKwInputs((ki) => ki.map((k, idx) => idx === i ? '' : k));
  };

  const removeKeyword = (pi: number, kw: string) => {
    updatePrompt(pi, { expectedPoints: (prompts[pi]?.expectedPoints || []).filter((k) => k !== kw) });
  };

  return (
    <>
      {/* Mode toggle */}
      <div className="section-label">Mode <span className="req">*</span></div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {([
          { id: 'LISTEN_RESPOND', label: '🎧 Listen & Respond', hint: 'Play an audio clip; students answer linked questions' },
          { id: 'ORAL_PROMPT',    label: '🎙 Oral Prompt',       hint: 'Text/audio prompt; students record spoken responses' },
        ] as const).map((m) => (
          <label
            key={m.id}
            title={m.hint}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px',
              border: `2px solid ${value.mode === m.id ? 'var(--primary)' : 'var(--rule)'}`,
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              background: value.mode === m.id ? 'var(--primary-50, #eff6ff)' : 'transparent',
            }}
          >
            <input
              type="radio"
              name="viva_mode"
              checked={value.mode === m.id}
              onChange={() => set({ mode: m.id })}
              style={{ accentColor: 'var(--primary)' }}
            />
            {m.label}
          </label>
        ))}
      </div>

      {/* LISTEN_RESPOND fields */}
      {value.mode === 'LISTEN_RESPOND' && (
        <>
          <div className="section-label">Audio Clip <span className="req">*</span></div>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            disabled={uploading}
            style={{ marginBottom: '10px' }}
          />
          {uploading && <div className="field-hint-row">Uploading audio...</div>}
          {value.audioAsset?.fileUrl && (
            <div style={{ marginBottom: '14px' }}>
              <audio src={value.audioAsset.fileUrl} controls style={{ width: '100%', maxWidth: '480px' }} />
              <div className="field-hint-row">{value.audioAsset.fileName}</div>
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label>Audio Type</label>
              <select value={value.audioType || ''} onChange={(e) => set({ audioType: e.target.value as any || undefined })}>
                <option value="">Not specified</option>
                <option value="LECTURE">Lecture / Monologue</option>
                <option value="CONVERSATION">Conversation / Dialogue</option>
              </select>
            </div>
            <div className="field">
              <label>Replay Limit <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional)</span></label>
              <input
                type="number"
                min={1}
                value={value.replayLimit ?? ''}
                onChange={(e) => set({ replayLimit: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Unlimited"
              />
            </div>
            <div className="field">
              <label>Dialect / Accent <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional)</span></label>
              <input
                type="text"
                value={value.dialect || ''}
                onChange={(e) => set({ dialect: e.target.value || undefined })}
                placeholder="e.g. British English, Tamil"
              />
            </div>
            <div className="field">
              <label>Target Accent <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional)</span></label>
              <input
                type="text"
                value={value.targetAccent || ''}
                onChange={(e) => set({ targetAccent: e.target.value || undefined })}
                placeholder="e.g. Australian English"
              />
            </div>
            <div className="field">
              <label>Word Limit per Blank <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional)</span></label>
              <input
                type="number"
                min={1}
                value={value.wordLimitPerBlank ?? ''}
                onChange={(e) => set({ wordLimitPerBlank: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="No limit"
              />
            </div>
            <div className="field">
              <label>Answer Match Mode</label>
              <select value={value.answerMatchMode || ''} onChange={(e) => set({ answerMatchMode: e.target.value as any || undefined })}>
                <option value="">Not specified</option>
                <option value="STRICT_CASE_INSENSITIVE">Strict (case-insensitive)</option>
                <option value="STRICT_CASE_SENSITIVE">Strict (case-sensitive)</option>
              </select>
            </div>
            <div className="field full">
              <label>Transcript <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional — shown after submission)</span></label>
              <textarea
                value={value.transcript || ''}
                onChange={(e) => set({ transcript: e.target.value || undefined })}
                placeholder="Paste the transcript of the audio clip..."
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="section-label" style={{ marginTop: '16px' }}>Sub-Questions <span className="req">*</span></div>
          <div className="field-hint-row" style={{ marginBottom: '10px' }}>
            Students hear the audio then answer these linked questions.
          </div>
          <SubQuestionPicker
            value={value.subQuestions || []}
            onChange={(ids) => set({ subQuestions: ids })}
            excludeTypes={EXCLUDED_TYPES}
          />
        </>
      )}

      {/* ORAL_PROMPT fields */}
      {value.mode === 'ORAL_PROMPT' && (
        <>
          <div className="section-label">Recording Required?</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={value.recordingRequired ?? false}
              onChange={(e) => set({ recordingRequired: e.target.checked })}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
            />
            Students must record their verbal response
          </label>

          <div className="section-label">Prompts <span className="req">*</span></div>
          <div className="field-hint-row" style={{ marginBottom: '12px' }}>
            Each prompt is a spoken-response question. Add expected key points for grading reference.
          </div>

          {prompts.map((prompt, i) => (
            <div
              key={i}
              style={{
                border: '1.5px solid var(--rule)', borderRadius: '8px',
                padding: '14px 16px', marginBottom: '12px', position: 'relative',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Prompt #{i + 1}
              </div>
              <button
                type="button"
                onClick={() => removePrompt(i)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', display: 'flex' }}
              >
                <Trash2 size={15} />
              </button>

              <div className="field" style={{ marginBottom: '10px' }}>
                <label>Prompt Question <span className="req">*</span></label>
                <textarea
                  value={prompt.question}
                  onChange={(e) => updatePrompt(i, { question: e.target.value })}
                  placeholder="e.g. Describe your greatest professional achievement in under 2 minutes."
                  style={{ minHeight: '72px', resize: 'vertical', width: '100%' }}
                />
              </div>

              <div className="field" style={{ marginBottom: '10px' }}>
                <label>Response Time Limit (seconds) <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(optional)</span></label>
                <input
                  type="number"
                  min={10}
                  value={prompt.responseTimeLimitSeconds ?? ''}
                  onChange={(e) => updatePrompt(i, { responseTimeLimitSeconds: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="No limit"
                  style={{ maxWidth: '180px' }}
                />
              </div>

              <div className="field">
                <label>Expected Key Points <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: '11px' }}>(grading reference)</span></label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={kwInputs[i] || ''}
                    onChange={(e) => setKwInputs((ki) => ki.map((k, idx) => idx === i ? e.target.value : k))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(i); } }}
                    placeholder="Type a key point and press Enter..."
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-ghost" onClick={() => addKeyword(i)} style={{ padding: '6px 12px' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(prompt.expectedPoints || []).map((kw) => (
                    <span
                      key={kw}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: 'var(--primary-50, #eff6ff)', color: 'var(--primary)',
                        border: '1px solid var(--primary)', borderRadius: '20px',
                        padding: '3px 10px', fontSize: '12px', fontWeight: 600,
                      }}
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(i, kw)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="add-opt-btn" onClick={addPrompt}>
            <Plus size={13} strokeWidth={2.6} /> Add prompt
          </button>
        </>
      )}
    </>
  );
};

export const defaultVivaOralContent = (): VivaOralContent => ({
  mode: 'LISTEN_RESPOND',
  subQuestions: [],
});
