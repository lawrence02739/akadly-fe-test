import { Settings, Send } from 'lucide-react';

export function TemplateInfoCards() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary-600" />
              Template management
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Configure system messages and build custom multi-channel notifications for your learners.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Automatic event notifications
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                Versioned content
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between h-full">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary-600" />
              Send a one-time notification
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Select an audience and dispatch a manual notification instantly across multiple channels.
            </p>
            <div className="mt-4">
              <button
                disabled
                title="Coming soon"
                className="inline-flex items-center justify-center rounded-lg bg-primary-800 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
              >
                Send notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
