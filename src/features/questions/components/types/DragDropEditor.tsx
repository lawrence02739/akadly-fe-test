import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface DragItem {
  id: string;
  text: string;
}

interface DropTarget {
  id: string;
  label: string;
  capacity?: number;
  correctItemIds: string[];
}

export interface DragDropContent {
  prompt: string;
  itemsLabel?: string;
  items: DragItem[];
  targetsLabel?: string;
  targets: DropTarget[];
  explanation?: string;
}

const uid = () => `dd_${Math.random().toString(36).slice(2, 8)}`;

interface Props {
  value: DragDropContent;
  onChange: (v: DragDropContent) => void;
}

export const DragDropEditor: React.FC<Props> = ({ value, onChange }) => {
  const set = (patch: Partial<DragDropContent>) => onChange({ ...value, ...patch });

  const addItem = () => set({ items: [...value.items, { id: uid(), text: '' }] });
  const updateItem = (i: number, text: string) =>
    set({ items: value.items.map((it, idx) => idx === i ? { ...it, text } : it) });
  const removeItem = (id: string) => {
    const targets = value.targets.map((t) => ({
      ...t,
      correctItemIds: t.correctItemIds.filter((cid) => cid !== id),
    }));
    set({ items: value.items.filter((it) => it.id !== id), targets });
  };

  const addTarget = () => set({ targets: [...value.targets, { id: uid(), label: '', capacity: 1, correctItemIds: [] }] });
  const updateTarget = (i: number, patch: Partial<DropTarget>) =>
    set({ targets: value.targets.map((t, idx) => idx === i ? { ...t, ...patch } : t) });
  const removeTarget = (id: string) =>
    set({ targets: value.targets.filter((t) => t.id !== id) });

  const toggleMapping = (targetIdx: number, itemId: string) => {
    const target = value.targets[targetIdx];
    const has = target.correctItemIds.includes(itemId);
    const newIds = has
      ? target.correctItemIds.filter((x) => x !== itemId)
      : [...target.correctItemIds, itemId];
    updateTarget(targetIdx, { correctItemIds: newIds });
  };

  return (
    <>
      <div className="section-label">Prompt <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.prompt}
        onChange={(e) => set({ prompt: e.target.value })}
        placeholder="Drag and drop the items into the correct categories..."
        style={{ width: '100%', minHeight: '64px', resize: 'vertical', marginBottom: '16px' }}
      />

      {/* Draggable Items */}
      <div className="section-label">Draggable Items <span className="req">*</span></div>
      <div style={{ marginBottom: '4px' }}>
        <input
          type="text"
          value={value.itemsLabel || ''}
          onChange={(e) => set({ itemsLabel: e.target.value })}
          placeholder="Items section label (optional, e.g. 'Animals')"
          style={{ marginBottom: '8px' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
        {value.items.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '28px', height: '28px', background: 'var(--primary-50, #eff6ff)',
                border: '1px solid var(--primary)', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '12px', flexShrink: 0, color: 'var(--primary)',
              }}
            >
              {i + 1}
            </span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Item ${i + 1}`}
              style={{ flex: 1 }}
            />
            {value.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(item.id)}
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

      {/* Drop Targets */}
      <div className="section-label">Drop Targets <span className="req">*</span></div>
      <div style={{ marginBottom: '4px' }}>
        <input
          type="text"
          value={value.targetsLabel || ''}
          onChange={(e) => set({ targetsLabel: e.target.value })}
          placeholder="Targets section label (optional, e.g. 'Categories')"
          style={{ marginBottom: '8px' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
        {value.targets.map((target, ti) => (
          <div
            key={target.id}
            style={{
              border: '1px solid var(--rule)', borderRadius: '8px',
              padding: '12px', background: 'var(--bg-alt, #fafafa)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={target.label}
                onChange={(e) => updateTarget(ti, { label: e.target.value })}
                placeholder={`Target ${ti + 1} label`}
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>Capacity</span>
                <input
                  type="number"
                  min={1}
                  value={target.capacity ?? 1}
                  onChange={(e) => updateTarget(ti, { capacity: Number(e.target.value) })}
                  style={{ width: '60px' }}
                />
              </div>
              {value.targets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTarget(target.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            {/* Correct item mapping checkboxes */}
            <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginBottom: '6px', fontWeight: 600 }}>Correct items for this target:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {value.items.map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px',
                    background: target.correctItemIds.includes(item.id) ? 'var(--primary-50, #eff6ff)' : 'white',
                    border: `1px solid ${target.correctItemIds.includes(item.id) ? 'var(--primary)' : 'var(--rule)'}`,
                    borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={target.correctItemIds.includes(item.id)}
                    onChange={() => toggleMapping(ti, item.id)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  {item.text || <em>Item {value.items.indexOf(item) + 1}</em>}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="add-opt-btn" type="button" onClick={addTarget} style={{ marginBottom: '20px' }}>
        <Plus size={13} strokeWidth={2.6} /> Add target
      </button>

      <div className="section-label">Explanation <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.explanation || ''}
        onChange={(e) => set({ explanation: e.target.value })}
        placeholder="Explain the correct answer..."
        style={{ width: '100%', minHeight: '72px', resize: 'vertical' }}
      />
    </>
  );
};

export const defaultDragDropContent = (): DragDropContent => ({
  prompt: '',
  items: [{ id: uid(), text: '' }, { id: uid(), text: '' }],
  targets: [{ id: uid(), label: '', capacity: 1, correctItemIds: [] }],
  explanation: '',
});
