import { Star } from "lucide-react";

export function Stars({ value, compact = false }: { value: number; compact?: boolean }) {
  return <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={compact ? 13 : 17} className={index < value ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}
  </span>;
}

export function StatusPill({ value, className }: { value: string; className: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>{value}</span>;
}
