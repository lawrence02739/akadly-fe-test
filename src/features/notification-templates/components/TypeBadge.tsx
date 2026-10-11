import { TemplateType } from '../types';

export function TypeBadge({ type }: { type: TemplateType }) {
  if (type === TemplateType.SYSTEM) {
    return (
      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        System template
      </span>
    );
  }
  return (
    <span className="text-xs text-slate-500">Custom template</span>
  );
}
