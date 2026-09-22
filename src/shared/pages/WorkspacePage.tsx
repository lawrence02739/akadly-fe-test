import type { LucideIcon } from 'lucide-react';

interface WorkspacePageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function WorkspacePage({
  title,
  description,
  icon: Icon,
}: WorkspacePageProps) {
  return (
    <section className="max-w-6xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
          <Icon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-500 max-w-2xl">{description}</p>

        <div className="mt-8 border border-dashed border-slate-300 rounded-xl bg-slate-50 px-6 py-12 text-center">
          <p className="font-semibold text-slate-700">{title} page is ready</p>
          <p className="mt-1 text-sm text-slate-500">
            Features for this section can now be added here.
          </p>
        </div>
      </div>
    </section>
  );
}
