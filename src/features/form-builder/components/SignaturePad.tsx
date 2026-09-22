import { useCallback, useEffect, useRef, useState } from 'react';

interface SignaturePadProps {
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
}

export default function SignaturePad({ value, onChange, error, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(Boolean(value));

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(rect.width * ratio) || canvas.height !== Math.round(rect.height * ratio)) {
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      const context = canvas.getContext('2d');
      context?.scale(ratio, ratio);
      if (value) {
        const image = new Image();
        image.onload = () => context?.drawImage(image, 0, 0, rect.width, rect.height);
        image.src = value;
      }
    }
    return canvas;
  }, [value]);

  useEffect(() => {
    prepareCanvas();
    const resize = () => prepareCanvas();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [prepareCanvas]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = prepareCanvas();
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = point(event);
    context.beginPath();
    context.moveTo(x, y);
    context.lineWidth = 2.25;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#0f172a';
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled) return;
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const { x, y } = point(event);
    context.lineTo(x, y);
    context.stroke();
    setHasInk(true);
  };

  const finish = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onChange(event.currentTarget.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange('');
  };

  return <div className="space-y-2">
    <div className={`relative h-44 w-full max-w-xl overflow-hidden rounded-lg border bg-white ${error ? 'border-red-500' : 'border-slate-300 focus-within:border-purple-600'}`}>
      {!hasInk && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">Draw signature here</span>}
      <canvas ref={canvasRef} aria-label="Signature drawing area" className="h-full w-full touch-none cursor-crosshair" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish}/>
      <div className="pointer-events-none absolute bottom-7 left-6 right-6 border-b border-dashed border-slate-300" />
    </div>
    <button type="button" disabled={!hasInk || disabled} onClick={clear} className="text-xs font-medium text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Clear signature</button>
  </div>;
}
