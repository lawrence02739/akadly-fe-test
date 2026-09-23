import React, { useState } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';
import type { QuestionType } from '../../quizzes/types';

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
  value: string[];                           // question IDs
  onChange: (ids: string[]) => void;
  excludeTypes?: QuestionType[];
}

/**
 * Lets the user pick existing questions from the bank to use as sub-questions
 * in a LINKED_COMPREHENSION or VIVA_ORAL parent question.
 */
export const SubQuestionPicker: React.FC<Props> = ({ value, onChange, excludeTypes = [] }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'' | 'EASY' | 'MEDIUM' | 'HARD'>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuestions({
    search,
    difficulty: difficulty || undefined,
    page,
    pageSize: 8,
  });

  // Questions currently selected as sub-questions (resolved from the bank list)
  const { data: allData } = useQuestions({ pageSize: 200 });
  const resolvedSubQs = (allData?.items || []).filter((q) => value.includes(q.id));

  const addId = (id: string) => {
    if (!value.includes(id)) onChange([...value, id]);
  };

  const removeId = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const filteredItems = (data?.items || []).filter(
    (q) => !excludeTypes.includes(q.type as QuestionType) && !value.includes(q.id)
  );

  return (
    <div>
      {/* Sub-question rows */}
      {resolvedSubQs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {resolvedSubQs.map((q) => {
            const badge = TYPE_BADGE_COLORS[q.type] || { bg: '#f1f5f9', color: '#475569' };
            return (
              <div
                key={q.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', border: '1px solid var(--rule)',
                  borderRadius: '6px', background: 'var(--bg-alt)',
                }}
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
                <button
                  type="button"
                  onClick={() => removeId(q.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', display: 'flex', padding: 0, flexShrink: 0 }}
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
          {/* Show IDs for sub-questions not yet loaded */}
          {value.filter((id) => !resolvedSubQs.find((q) => q.id === id)).map((id) => (
            <div
              key={id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 12px', border: '1px solid var(--rule)',
                borderRadius: '6px', background: 'var(--bg-alt)',
              }}
            >
              <span style={{ flex: 1, fontSize: '12px', color: 'var(--ink-soft)', fontFamily: 'monospace' }}>{id}</span>
              <button
                type="button"
                onClick={() => removeId(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', display: 'flex', padding: 0 }}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add from bank button */}
      <button
        type="button"
        className="add-opt-btn"
        onClick={() => setShowPicker(!showPicker)}
        style={{ marginBottom: '8px' }}
      >
        <Plus size={13} strokeWidth={2.6} /> Add question from bank
      </button>

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
              placeholder="Search questions..."
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
                    <Plus size={14} style={{ flexShrink: 0, color: 'var(--primary)' }} />
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
    </div>
  );
};
