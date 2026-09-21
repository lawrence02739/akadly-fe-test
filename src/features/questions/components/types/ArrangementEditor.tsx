import React from 'react';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface ArrangementItem {
  id: string;
  text: string;
}

export interface ArrangementContent {
  prompt: string;
  items: ArrangementItem[];
  correctOrder: string[];
}

const uid = () => `item_${Math.random().toString(36).slice(2, 8)}`;

interface Props {
  value: ArrangementContent;
  onChange: (v: ArrangementContent) => void;
}

export const ArrangementEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<ArrangementContent>) => onChange({ ...value, ...patch });

  const addItem = () => {
    const id = uid();
    const newItem: ArrangementItem = { id, text: '' };
    set({
      items: [...value.items, newItem],
      correctOrder: [...value.correctOrder, id],
    });
  };

  const updateItem = (i: number, text: string) => {
    const items = value.items.map((item, idx) => idx === i ? { ...item, text } : item);
    set({ items });
  };

  const removeItem = (i: number) => {
    const removed = value.items[i];
    set({
      items: value.items.filter((_, idx) => idx !== i),
      correctOrder: value.correctOrder.filter((id) => id !== removed.id),
    });
  };

  // Move an item up or down in the correctOrder
  const moveInOrder = (ordIdx: number, dir: -1 | 1) => {
    const newOrder = [...value.correctOrder];
    const target = ordIdx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[ordIdx], newOrder[target]] = [newOrder[target], newOrder[ordIdx]];
    set({ correctOrder: newOrder });
  };

  const itemMap = Object.fromEntries(value.items.map((it) => [it.id, it]));

  return (
    <>
      <div className="section-label">Prompt <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.prompt}
        onChange={(e) => set({ prompt: e.target.value })}
        placeholder="Arrange the following items in the correct order..."
        style={{ width: '100%', minHeight: '64px', resize: 'vertical', marginBottom: '16px' }}
      />

      <div className="section-label">Items to Arrange <span className="req">*</span></div>
      <div className="field-hint-row" style={{ marginBottom: '10px' }}>Add items — then set their correct sequence in the "Correct Order" panel below.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        {value.items.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GripVertical size={16} style={{ color: 'var(--ink-soft)', flexShrink: 0 }} />
            <span style={{ width: '24px', fontWeight: 700, color: 'var(--ink-soft)', textAlign: 'center' }}>{i + 1}</span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
              style={{ flex: 1 }}
            />
            {value.items.length > 2 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button className="add-opt-btn" type="button" onClick={addItem} style={{ marginBottom: '20px' }}>
        <Plus size={13} strokeWidth={2.6} /> Add item
      </button>

      {value.items.length >= 2 && (
        <>
          <div className="section-label">Correct Order <span className="req">*</span></div>
          <div className="field-hint-row" style={{ marginBottom: '10px' }}>
            Drag or use arrows to arrange items in the correct sequence.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {value.correctOrder.map((id, ordIdx) => {
              const item = itemMap[id];
              if (!item) return null;
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: 'var(--bg-alt, #fafafa)',
                    border: '1px solid var(--rule)',
                    borderRadius: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'var(--primary)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '12px', flexShrink: 0,
                    }}
                  >
                    {ordIdx + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: '14px' }}>{item.text || <em style={{ color: 'var(--ink-soft)' }}>Empty item</em>}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={ordIdx === 0}
                      onClick={() => moveInOrder(ordIdx, -1)}
                      style={{ background: 'none', border: 'none', cursor: ordIdx === 0 ? 'not-allowed' : 'pointer', color: ordIdx === 0 ? 'var(--rule)' : 'var(--ink)' }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={ordIdx === value.correctOrder.length - 1}
                      onClick={() => moveInOrder(ordIdx, 1)}
                      style={{ background: 'none', border: 'none', cursor: ordIdx === value.correctOrder.length - 1 ? 'not-allowed' : 'pointer', color: ordIdx === value.correctOrder.length - 1 ? 'var(--rule)' : 'var(--ink)' }}
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

export const defaultArrangementContent = (): ArrangementContent => {
  const ids = [uid(), uid()];
  return {
    prompt: '',
    items: ids.map((id) => ({ id, text: '' })),
    correctOrder: [...ids],
  };
};
