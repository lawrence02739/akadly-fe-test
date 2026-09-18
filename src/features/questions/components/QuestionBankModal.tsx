import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useQuestions } from '../hooks/useQuestions';

export interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questionIds: string[]) => Promise<void>;
  isImporting?: boolean;
  existingQuestionIds?: string[];
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  onImport,
  isImporting = false,
  existingQuestionIds = [],
}) => {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuestions({
    search,
    difficulty: difficulty || undefined,
    page,
    pageSize,
  });

  if (!isOpen) return null;

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    await onImport(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const toggleSelectAll = (checked: boolean) => {
    if (!data) return;
    if (checked) {
      const importable = data.items.filter(q => !existingQuestionIds.includes(q.id));
      setSelectedIds(new Set(importable.map(q => q.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  return (
    <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal xwide">
        <div className="modal-head">
          <h2>Import from Question Bank</h2>
          <button className="modal-close" onClick={onClose} disabled={isImporting}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="import-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                placeholder="Search question text..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                style={{ width: '100%', paddingLeft: '36px', borderRadius: 'var(--radius-s)', border: '1px solid var(--rule-strong)' }}
              />
            </div>
            <select 
              value={difficulty} 
              onChange={(e) => { setDifficulty(e.target.value as any); setPage(1); }}
              style={{ width: '160px', borderRadius: 'var(--radius-s)', border: '1px solid var(--rule-strong)' }}
            >
              <option value="">Any difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="entries-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
            Show
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--rule)', borderRadius: 'var(--radius-s)' }}>
            <table className="bank-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead style={{ background: 'var(--rule)', borderBottom: '1px solid var(--rule-strong)' }}>
                <tr>
                  <th style={{ padding: '8px 10px' }}>
                    <input
                      type="checkbox"
                      checked={Number(data?.items?.length) > 0 && selectedIds.size === data?.items?.filter(q => !existingQuestionIds.includes(q.id)).length && selectedIds.size > 0}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px' }}>Question Text</th>
                  <th style={{ padding: '8px 10px' }}>Subject</th>
                  <th style={{ padding: '8px 10px' }}>Topic</th>
                  <th style={{ padding: '8px 10px' }}>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                      Loading questions...
                    </td>
                  </tr>
                ) : data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-soft)' }}>
                      No questions found in the bank matching your filters.
                    </td>
                  </tr>
                ) : (
                  data?.items.map(q => {
                    const isExisting = existingQuestionIds.includes(q.id);
                    return (
                      <tr key={q.id} style={{ borderBottom: '1px solid var(--rule)', opacity: isExisting ? 0.6 : 1, background: isExisting ? 'var(--bg-alt)' : 'transparent' }}>
                        <td style={{ padding: '10px' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(q.id) || isExisting}
                            disabled={isExisting}
                            onChange={(e) => toggleSelect(q.id, e.target.checked)}
                          />
                        </td>
                      <td style={{ padding: '10px', whiteSpace: 'nowrap', color: 'var(--ink-soft)' }}>
                        {new Date(q.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', maxWidth: '300px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                          {q.text}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '4px' }}>
                          {(q.tags || []).join(', ')}
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>{q.subject}</td>
                      <td style={{ padding: '10px' }}>{q.topic}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {q.difficulty}
                            {isExisting && <span style={{ fontSize: '11px', background: 'var(--rule)', padding: '2px 6px', borderRadius: '4px' }}>Added</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="pager" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
            <div>
              Showing {data?.items.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, data?.total || 0)} of {data?.total || 0} entries
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-sm btn-ghost"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-sm btn-ghost"
                disabled={!data || page * pageSize >= data.total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-foot">
          <span style={{ marginRight: 'auto', alignSelf: 'center', color: 'var(--ink-soft)' }}>
            {selectedIds.size} selected
          </span>
          <button className="btn btn-ghost" onClick={onClose} disabled={isImporting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleImport} disabled={isImporting || selectedIds.size === 0}>
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
