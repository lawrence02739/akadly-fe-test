import React, { useRef, useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';

interface Marker {
  id: string;
  label: string;
  x: number; // % of image width
  y: number; // % of image height
}

interface MapOption {
  text: string;
  correct: boolean;
}

export interface MapBasedContent {
  prompt: string;
  mapImage?: { fileUrl: string };
  markers: Marker[];
  answerMode: 'OPTIONS' | 'TAGS';
  options?: MapOption[];     // for OPTIONS mode
  tags?: { markerId: string; correctLabel: string }[]; // for TAGS mode
  explanation?: string;
}

const uid = () => `marker_${Math.random().toString(36).slice(2, 8)}`;

const LABEL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface Props {
  value: MapBasedContent;
  onChange: (v: MapBasedContent) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export const MapBasedEditor: React.FC<Props> = ({ value, onChange, onFileUpload }) => {
  const set = (patch: Partial<MapBasedContent>) => onChange({ ...value, ...patch });
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const label = LABEL_CHARS[value.markers.length] || `${value.markers.length + 1}`;
    const newMarker: Marker = { id: uid(), label, x, y };
    const markers = [...value.markers, newMarker];
    const tags = value.answerMode === 'TAGS'
      ? [...(value.tags || []), { markerId: newMarker.id, correctLabel: '' }]
      : value.tags;
    set({ markers, tags });
  };

  const removeMarker = (id: string) => {
    set({
      markers: value.markers.filter((m) => m.id !== id),
      tags: (value.tags || []).filter((t) => t.markerId !== id),
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onFileUpload) {
      setUploading(true);
      try {
        const url = await onFileUpload(file);
        set({ mapImage: { fileUrl: url } });
      } finally {
        setUploading(false);
      }
    } else {
      // Preview locally if no upload handler
      const url = URL.createObjectURL(file);
      set({ mapImage: { fileUrl: url } });
    }
  };

  return (
    <>
      <div className="section-label">Prompt <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.prompt}
        onChange={(e) => set({ prompt: e.target.value })}
        placeholder="Identify the locations marked on the map..."
        style={{ width: '100%', minHeight: '64px', resize: 'vertical', marginBottom: '16px' }}
      />

      <div className="section-label">Map Image <span className="req">*</span></div>
      <div className="field-hint-row" style={{ marginBottom: '8px' }}>
        Upload a map/diagram image. Then click on it to place labelled markers.
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginBottom: '12px' }}
        disabled={uploading}
      />
      {uploading && <div className="field-hint-row">Uploading image...</div>}

      {value.mapImage?.fileUrl && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px', border: '2px dashed var(--primary)', borderRadius: '8px', overflow: 'hidden', cursor: 'crosshair', maxWidth: '100%' }}>
          <img
            ref={imgRef}
            src={value.mapImage.fileUrl}
            alt="Map"
            onClick={handleImageClick}
            style={{ display: 'block', maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
          />
          {value.markers.map((m) => (
            <div
              key={m.id}
              title={`Marker ${m.label} — click on image to move, use trash to remove`}
              style={{
                position: 'absolute',
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: 'translate(-50%, -100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  background: 'var(--primary)', color: '#fff',
                  borderRadius: '4px', padding: '2px 6px',
                  fontSize: '11px', fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                {m.label}
              </span>
              <MapPin size={18} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
            </div>
          ))}
        </div>
      )}

      {value.markers.length > 0 && (
        <>
          <div className="section-label">Placed Markers</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {value.markers.map((m) => (
              <span
                key={m.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'var(--bg-alt)', border: '1px solid var(--rule)',
                  borderRadius: '6px', padding: '4px 10px', fontSize: '13px',
                }}
              >
                <strong>{m.label}</strong> ({m.x.toFixed(1)}%, {m.y.toFixed(1)}%)
                <button
                  type="button"
                  onClick={() => removeMarker(m.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--incorrect)', padding: 0, display: 'flex' }}
                >
                  <Trash2 size={13} />
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      <div className="section-label">Answer Mode <span className="req">*</span></div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {(['OPTIONS', 'TAGS'] as const).map((mode) => (
          <label
            key={mode}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', border: `2px solid ${value.answerMode === mode ? 'var(--primary)' : 'var(--rule)'}`,
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              background: value.answerMode === mode ? 'var(--primary-50, #eff6ff)' : 'transparent',
            }}
          >
            <input
              type="radio"
              name="map_mode"
              checked={value.answerMode === mode}
              onChange={() => set({ answerMode: mode })}
              style={{ accentColor: 'var(--primary)' }}
            />
            {mode === 'OPTIONS' ? 'Multiple Choice Options' : 'Tag Each Marker'}
          </label>
        ))}
      </div>

      {value.answerMode === 'OPTIONS' && (
        <>
          <div className="section-label">Answer Options <span className="req">*</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            {(value.options || []).map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="map_correct"
                  checked={opt.correct}
                  onChange={() => {
                    const options = (value.options || []).map((o, idx) => ({ ...o, correct: idx === i }));
                    set({ options });
                  }}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => {
                    const options = [...(value.options || [])];
                    options[i] = { ...options[i], text: e.target.value };
                    set({ options });
                  }}
                  placeholder={`Option ${i + 1} (e.g. A – Western Ghats, B – Chilika Lake)`}
                  style={{ flex: 1 }}
                />
                {(value.options || []).length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      const options = (value.options || []).filter((_, idx) => idx !== i);
                      set({ options });
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--incorrect)', cursor: 'pointer' }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            className="add-opt-btn"
            type="button"
            onClick={() => set({ options: [...(value.options || []), { text: '', correct: false }] })}
          >
            <Plus size={13} strokeWidth={2.6} /> Add option
          </button>
        </>
      )}

      {value.answerMode === 'TAGS' && (
        <>
          <div className="section-label">Correct Labels per Marker</div>
          <div className="field-hint-row" style={{ marginBottom: '10px' }}>Enter the correct geographical/location label for each marker.</div>
          {value.markers.map((m) => {
            const tag = (value.tags || []).find((t) => t.markerId === m.id) || { markerId: m.id, correctLabel: '' };
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ width: '28px', height: '28px', background: 'var(--primary)', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  {m.label}
                </span>
                <input
                  type="text"
                  value={tag.correctLabel}
                  onChange={(e) => {
                    const tags = (value.tags || []).filter((t) => t.markerId !== m.id);
                    tags.push({ markerId: m.id, correctLabel: e.target.value });
                    set({ tags });
                  }}
                  placeholder={`Correct label for marker ${m.label}`}
                  style={{ flex: 1 }}
                />
              </div>
            );
          })}
        </>
      )}

      <div className="section-label" style={{ marginTop: '16px' }}>Explanation <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.explanation || ''}
        onChange={(e) => set({ explanation: e.target.value })}
        placeholder="Explain the correct answer..."
        style={{ width: '100%', minHeight: '72px', resize: 'vertical' }}
      />
    </>
  );
};

export const defaultMapBasedContent = (): MapBasedContent => ({
  prompt: '',
  markers: [],
  answerMode: 'OPTIONS',
  options: [{ text: '', correct: false }, { text: '', correct: false }],
  tags: [],
  explanation: '',
});
