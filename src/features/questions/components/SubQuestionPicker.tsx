import React, { useState } from 'react';
import { X, Plus, BookOpen, Edit2 } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import type { QuestionType, InlineSubQuestion, CreateQuestionDto } from '../../quizzes/types';
import { QuestionModal } from './QuestionModal';

const TYPE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  SINGLE:               { bg: '#eff6ff', color: '#2563eb' },
  MULTIPLE:             { bg: '#f0fdf4', color: '#16a34a' },
  NUMERIC:              { bg: '#fef9c3', color: '#ca8a04' },
  TRUE_FALSE:           { bg: '#fdf4ff', color: '#9333ea' },
  FILL_BLANK:           { bg: '#fff7ed', color: '#ea580c' },
  SHORT_ANSWER:         { bg: '#f0fdfa', color: '#0d9488' },
  SUBJECTIVE:           { bg: '#fef3c7', color: '#b45309' },
  MATCH:                { bg: '#e0f2fe', color: '#0284c7' },
  ASSERTION_REASON:     { bg: '#fce7f3', color: '#be185d' },
  ARRANGEMENT:          { bg: '#f1f5f9', color: '#475569' },
  MAP_BASED:            { bg: '#dcfce7', color: '#15803d' },
  DRAG_DROP:            { bg: '#ede9fe', color: '#7c3aed' },
  CODING:               { bg: '#f0f9ff', color: '#0369a1' },
};

interface Props {
  value: (string | InlineSubQuestion)[];
  onChange: (ids: (string | InlineSubQuestion)[]) => void;
  excludeTypes?: QuestionType[];
}

/**
 * Lets the user pick existing questions from the bank or create inline
 * questions to use as sub-questions in a LINKED_COMPREHENSION or VIVA_ORAL parent.
 */
export const SubQuestionPicker: React.FC<Props> = ({ value, onChange, excludeTypes = [] }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showInlineCreator, setShowInlineCreator] = useState(false);
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'' | 'EASY' | 'MEDIUM' | 'HARD'>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuestions({
    search,
    difficulty: difficulty || undefined,
    page,
    pageSize: 8,
  });

  const stringIds = value.filter((v): v is string => typeof v === 'string');
  const inlineQs = value.filter((v): v is InlineSubQuestion => typeof v === 'object' && v.inline);

  // Questions currently selected as sub-questions (resolved from the bank list)
  const { data: allData } = useQuestions({ pageSize: 200 });
  const resolvedSubQs = (allData?.items || []).filter((q) => stringIds.includes(q.id));

  const addId = (id: string) => {
    if (!stringIds.includes(id)) onChange([...value, id]);
  };

  const removeValue = (vToRemove: string | InlineSubQuestion) => {
    if (typeof vToRemove === 'string') {
      onChange(value.filter(v => v !== vToRemove));
    } else {
      onChange(value.filter(v => typeof v === 'string' || v.id !== vToRemove.id));
    }
  };

  const handleInlineSave = async (dto: CreateQuestionDto) => {
    if (editingInlineId) {
      onChange(value.map(v => (typeof v === 'object' && v.id === editingInlineId) ? { ...dto, id: editingInlineId, inline: true } : v));
      setEditingInlineId(null);
    } else {
      const inlineQ: InlineSubQuestion = {
        id: `inline_${Math.random().toString(36).slice(2, 10)}`,
        inline: true,
        ...dto,
      };
      onChange([...value, inlineQ]);
      setShowInlineCreator(false);
    }
  };

  const filteredItems = (data?.items || []).filter(
    (q) => !excludeTypes.includes(q.type as QuestionType) && !stringIds.includes(q.id)
  );

  return (
    <div>
      {/* Sub-question rows */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {value.map((v) => {
            if (typeof v === 'string') {
              const q = resolvedSubQs.find(rq => rq.id === v);
              if (!q) {
                return (
                  <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px', background: 'var(--bg-alt)' }}>
                    <span style={{ flex: 1, fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'monospace' }}>{v}</span>
                    <button type="button" onClick={() => removeValue(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', display: 'flex', padding: 0 }}>
                      <X size={15} />
                    </button>
                  </div>
                );
              }
              const badge = TYPE_BADGE_COLORS[q.type] || { bg: '#f1f5f9', color: '#475569' };
              return (
                <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: '1px solid var(--rule)', borderRadius: '6px', background: 'var(--bg-alt)' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: badge.bg, color: badge.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {q.type.replace('_', ' ')}
                  </span>
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.text}
                  </span>
                  <button type="button" onClick={() => removeValue(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', display: 'flex', padding: 0, flexShrink: 0 }}>
                    <X size={15} />
                  </button>
                </div>
              );
            } else {
              const badge = TYPE_BADGE_COLORS[v.type] || { bg: '#f1f5f9', color: '#475569' };
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', border: '1px solid var(--indigo)', borderRadius: '6px', background: '#fff' }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, background: 'var(--indigo-deep)', color: '#fff', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    LOCAL
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: badge.bg, color: badge.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {v.type.replace('_', ' ')}
                  </span>
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.text || '(New Question)'}
                  </span>
                  <button type="button" onClick={() => setEditingInlineId(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', display: 'flex', padding: 0, flexShrink: 0 }} title="Edit inline question">
                    <Edit2 size={14} />
                  </button>
                  <button type="button" onClick={() => removeValue(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', display: 'flex', padding: 0, flexShrink: 0 }} title="Remove">
                    <X size={15} />
                  </button>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Add buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button type="button" className="add-opt-btn" onClick={() => setShowPicker(!showPicker)}>
          <Plus size={13} strokeWidth={2.6} /> Add from bank
        </button>
        <button type="button" className="add-opt-btn" onClick={() => setShowInlineCreator(true)}>
          <Plus size={13} strokeWidth={2.6} /> Create question here
        </button>
      </div>

      {/* Inline bank picker */}
      {showPicker && (
        <div style={{
          border: '1.5px solid var(--rule)', borderRadius: '8px',
          padding: '12px', marginBottom: '12px', background: '#fff',
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search bank questions..."
              style={{ flex: 1 }}
            />
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value as any); setPage(1); }}
              style={{ width: '120px' }}
            >
              <option value="">Any level</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowPicker(false)}
              style={{ padding: '6px 10px' }}
            >
              <X size={14} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: '13px', padding: '12px 0' }}>Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ color: 'var(--ink-soft)', fontSize: '13px', padding: '12px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <BookOpen size={16} /> No questions found
              {excludeTypes.length > 0 && <span style={{ fontSize: '11px' }}>({excludeTypes.join(', ')} types excluded)</span>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto' }}>
              {filteredItems.map((q) => {
                const badge = TYPE_BADGE_COLORS[q.type] || { bg: '#f1f5f9', color: '#475569' };
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => addId(q.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 10px', border: '1px solid var(--rule)', borderRadius: '6px',
                      background: '#fff', cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-alt)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
                      background: badge.bg, color: badge.color, flexShrink: 0, whiteSpace: 'nowrap',
                    }}>
                      {q.type.replace('_', ' ')}
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.text}
                    </span>
                    <Plus size={14} style={{ flexShrink: 0, color: 'var(--indigo)' }} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data && data.total > 8 && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px', fontSize: '12px', color: 'var(--ink-soft)' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '4px 8px' }}>‹ Prev</button>
              <span style={{ alignSelf: 'center' }}>{page} / {Math.ceil(data.total / 8)}</span>
              <button type="button" className="btn btn-ghost" onClick={() => setPage(page + 1)} disabled={page >= Math.ceil(data.total / 8)} style={{ padding: '4px 8px' }}>Next ›</button>
            </div>
          )}
        </div>
      )}

      {/* Embedded QuestionModal for Inline Creation/Editing */}
      {(showInlineCreator || editingInlineId) && (
        <QuestionModal
          isOpen={true}
          nextOrder={1}
          embedded
          excludeTypes={['LINKED_COMPREHENSION', 'VIVA_ORAL']}
          question={editingInlineId ? (inlineQs.find(q => q.id === editingInlineId) as any) : undefined}
          onSave={handleInlineSave}
          onClose={() => { setShowInlineCreator(false); setEditingInlineId(null); }}
        />
      )}
    </div>
  );
};
