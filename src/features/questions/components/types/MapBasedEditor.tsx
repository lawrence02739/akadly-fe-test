import React, { useRef, useState } from 'react';
import { Plus, Trash2, MapPin, X, Check } from 'lucide-react';

interface Marker {
  id: string;
  pinLabel: string;    // 'A', 'B', 'C'... auto-assigned
  locationName: string; // required correct identification
  x: number;           // % of image width
  y: number;           // % of image height
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
  options?: MapOption[];
  tags?: { markerId: string; correctLabel: string }[];
  explanation?: string;
}

const uid = () => `marker_${Math.random().toString(36).slice(2, 8)}`;
const PIN_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nextPinLabel = (markers: Marker[]) =>
  PIN_LABELS[markers.length] ?? `${markers.length + 1}`;

interface Props {
  value: MapBasedContent;
  onChange: (v: MapBasedContent) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

interface PendingPlacement {
  pinLabel: string;
  x: number;
  y: number;
}

export const MapBasedEditor: React.FC<Props> = ({ value, onChange, onFileUpload }) => {
  const set = (patch: Partial<MapBasedContent>) => onChange({ ...value, ...patch });
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);

  // Guided placement state
  const [placingMarker, setPlacingMarker] = useState<{ pinLabel: string } | null>(null);
  const [pending, setPending] = useState<PendingPlacement | null>(null);
  const [locationName, setLocationName] = useState('');

  // Migrate old shape: m.label -> m.pinLabel, add locationName if missing
  const markers: Marker[] = (value.markers || []).map((m: any, i: number) => ({
    id: m.id,
    pinLabel: m.pinLabel ?? m.label ?? PIN_LABELS[i] ?? `${i + 1}`,
    locationName: m.locationName ?? '',
    x: m.x,
    y: m.y,
  }));

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!placingMarker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPending({ pinLabel: placingMarker.pinLabel, x, y });
    setLocationName('');
  };

  const confirmPlacement = () => {
    if (!pending) return;
    if (!locationName.trim()) return;
    const newMarker: Marker = {
      id: uid(),
      pinLabel: pending.pinLabel,
      locationName: locationName.trim(),
      x: pending.x,
      y: pending.y,
    };
    const newMarkers = [...markers, newMarker];
    const tags = value.answerMode === 'TAGS'
      ? [...(value.tags || []), { markerId: newMarker.id, correctLabel: '' }]
      : value.tags;
    set({ markers: newMarkers, tags });
    setPending(null);
    setLocationName('');
    setPlacingMarker(null);
  };

  const cancelPlacement = () => {
    setPending(null);
    setLocationName('');
    setPlacingMarker(null);
  };

  const removeMarker = (id: string) => {
    const newMarkers = markers.filter((m) => m.id !== id);
    set({
      markers: newMarkers,
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
      const url = URL.createObjectURL(file);
      set({ mapImage: { fileUrl: url } });
    }
  };

  return (
    <>
      {/* Prompt */}
      <div className="section-label">Prompt <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>(optional)</span></div>
      <textarea
        value={value.prompt}
        onChange={(e) => set({ prompt: e.target.value })}
        placeholder="Identify the locations marked on the map..."
        style={{ width: '100%', minHeight: '64px', resize: 'vertical', marginBottom: '16px' }}
      />

      {/* Map Image Upload */}
      <div className="section-label">Map Image <span className="req">*</span></div>
      <div className="field-hint-row" style={{ marginBottom: '8px' }}>
        Upload a map/diagram image, then use "+ Add Marker" to place named markers.
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
        <div style={{ marginBottom: '16px' }}>
          {/* Placement banner */}
          {placingMarker && !pending && (
            <div style={{
              background: 'var(--primary)', color: '#fff',
              borderRadius: '6px 6px 0 0', padding: '8px 16px',
              fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>📍 Click on the map to place Marker <strong>{placingMarker.pinLabel}</strong></span>
              <button
                type="button"
                onClick={cancelPlacement}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Map image + markers */}
          <div style={{
            position: 'relative', display: 'inline-block', maxWidth: '100%',
            border: placingMarker ? '2px solid var(--primary)' : '2px dashed var(--rule)',
            borderRadius: placingMarker ? '0 0 8px 8px' : '8px',
            overflow: 'hidden',
            cursor: placingMarker && !pending ? 'crosshair' : 'default',
          }}>
            <img
              ref={imgRef}
              src={value.mapImage.fileUrl}
              alt="Map"
              onClick={handleImageClick}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
            />

            {/* Placed markers */}
            {markers.map((m) => (
              <div
                key={m.id}
                title={`${m.pinLabel}: ${m.locationName}`}
                style={{
                  position: 'absolute',
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: 'translate(-50%, -100%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{
                  background: 'var(--primary)', color: '#fff',
                  borderRadius: '4px', padding: '2px 6px',
                  fontSize: '11px', fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}>{m.pinLabel}</span>
                <MapPin size={18} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
              </div>
            ))}

            {/* Pending placement preview */}
            {pending && (
              <div style={{
                position: 'absolute',
                left: `${pending.x}%`,
                top: `${pending.y}%`,
                transform: 'translate(-50%, -100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                zIndex: 100,
              }}>
                <span style={{
                  background: '#f59e0b', color: '#fff',
                  borderRadius: '4px', padding: '2px 6px',
                  fontSize: '11px', fontWeight: 700,
                }}>{pending.pinLabel}</span>
                <MapPin size={18} style={{ color: '#f59e0b' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location name popover — shown after clicking on map */}
      {pending && (
        <div style={{
          border: '2px solid var(--primary)', borderRadius: '8px',
          padding: '14px 16px', marginBottom: '16px', background: 'var(--bg-alt)',
        }}>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
            Name the location for Marker <strong style={{ color: 'var(--primary)' }}>{pending.pinLabel}</strong>:
          </div>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmPlacement(); } if (e.key === 'Escape') cancelPlacement(); }}
            placeholder="e.g. Western Ghats, Chilika Lake..."
            autoFocus
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmPlacement}
              disabled={!locationName.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
            >
              <Check size={14} /> Confirm
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={cancelPlacement}
              style={{ padding: '6px 14px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Marker button */}
      {value.mapImage?.fileUrl && !placingMarker && (
        <button
          type="button"
          className="add-opt-btn"
          style={{ marginBottom: '16px' }}
          onClick={() => setPlacingMarker({ pinLabel: nextPinLabel(markers) })}
        >
          <Plus size={13} strokeWidth={2.6} /> Add Marker
        </button>
      )}

      {/* Marker card grid */}
      {markers.length > 0 && (
        <>
          <div className="section-label">Map Markers &amp; Correct Identifications</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {markers.map((m, i) => (
              <div
                key={m.id}
                style={{
                  border: '1.5px solid var(--rule)', borderRadius: '8px',
                  padding: '10px 12px', position: 'relative', background: 'var(--bg-alt)',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Marker {m.pinLabel} (Pin #{i + 1})
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', wordBreak: 'break-word' }}>
                  {m.locationName || <span style={{ color: 'var(--ink-soft)', fontWeight: 400, fontStyle: 'italic' }}>No name set</span>}
                </div>
                <button
                  type="button"
                  onClick={() => removeMarker(m.id)}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--incorrect)', padding: '2px', display: 'flex',
                  }}
                  title="Remove marker"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Answer Mode */}
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

      {/* OPTIONS mode */}
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

      {/* TAGS mode */}
      {value.answerMode === 'TAGS' && (
        <>
          <div className="section-label">Correct Labels per Marker</div>
          <div className="field-hint-row" style={{ marginBottom: '10px' }}>Enter the correct geographical/location label for each marker.</div>
          {markers.map((m) => {
            const tag = (value.tags || []).find((t) => t.markerId === m.id) || { markerId: m.id, correctLabel: '' };
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ width: '28px', height: '28px', background: 'var(--primary)', color: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  {m.pinLabel}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)', minWidth: '120px' }}>{m.locationName}</span>
                <input
                  type="text"
                  value={tag.correctLabel}
                  onChange={(e) => {
                    const tags = (value.tags || []).filter((t) => t.markerId !== m.id);
                    tags.push({ markerId: m.id, correctLabel: e.target.value });
                    set({ tags });
                  }}
                  placeholder={`Correct label for marker ${m.pinLabel}`}
                  style={{ flex: 1 }}
                />
              </div>
            );
          })}
        </>
      )}

      {/* Explanation */}
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
  mapImage: undefined,
  markers: [],
  answerMode: 'OPTIONS',
  options: [{ text: '', correct: false }, { text: '', correct: false }],
  tags: [],
  explanation: '',
});
