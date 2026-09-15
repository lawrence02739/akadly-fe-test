import { HelpCircle, Plus, Trash2 } from 'lucide-react';

export default function QuizContentEditor({ item }: { item: any }) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          {item.title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" defaultValue={item.title} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
          <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" rows={2} placeholder="Explain the rules of the quiz..."></textarea>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Questions</h3>
            <button className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Sample Question */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium text-slate-800 mb-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" defaultValue="What does CSS stand for?" />
              </div>
              <button className="text-slate-400 hover:text-red-500 mt-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input type="radio" name="q1" className="w-4 h-4 text-teal-600 focus:ring-teal-500" />
                <input type="text" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm" defaultValue="Computer Style Sheets" />
              </div>
              <div className="flex items-center gap-3">
                <input type="radio" name="q1" className="w-4 h-4 text-teal-600 focus:ring-teal-500" defaultChecked />
                <input type="text" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-green-50 border-green-200" defaultValue="Cascading Style Sheets" />
              </div>
              <div className="flex items-center gap-3">
                <input type="radio" name="q1" className="w-4 h-4 text-teal-600 focus:ring-teal-500" />
                <input type="text" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm" defaultValue="Creative Style System" />
              </div>
              <button className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 mt-2">
                 <Plus className="w-3 h-3" /> Add Option
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
           <div className="flex items-center justify-between">
             <span className="text-sm font-medium text-slate-700">Randomize Questions</span>
             <input type="checkbox" className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500" />
           </div>
           <div className="flex items-center justify-between">
             <span className="text-sm font-medium text-slate-700">Show Answers after submit</span>
             <input type="checkbox" className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500" defaultChecked />
           </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end gap-3">
        <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800">
          Save Quiz
        </button>
      </div>
    </div>
  );
}
