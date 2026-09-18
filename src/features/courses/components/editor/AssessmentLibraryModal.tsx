import { X } from 'lucide-react';
import { useQuizzes } from '../../../quizzes/hooks/useQuizzes';
import { useTests } from '../../../tests/hooks/useTests';
import { useState } from 'react';

export default function AssessmentLibraryModal({
  isOpen,
  onClose,
  onSelect,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
  type: 'QUIZ' | 'TEST';
}) {
  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuizzes();
  const { data: tests = [], isLoading: isLoadingTests } = useTests();

  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  if (!isOpen) return null;

  const data = type === 'QUIZ' ? quizzes : tests;
  const isLoading = type === 'QUIZ' ? isLoadingQuizzes : isLoadingTests;
  const title = type === 'QUIZ' ? 'Quiz Library' : 'Test Library';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">Loading {type.toLowerCase()}es...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No {type.toLowerCase()}es found. Create one in the Studio!</div>
          ) : (
            <div className="grid gap-3">
              {data.map((item: any) => (
                <div 
                  key={item.id} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <p className="text-sm text-slate-500">
                        {item.questionCount || (item.questionIds ? item.questionIds.length : 0)} Questions • {item.timeLimitMinutes} Minutes
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg">
            Cancel
          </button>
          <button 
            disabled={!selectedItem}
            onClick={() => {
              if (selectedItem) {
                onSelect(selectedItem);
                onClose();
              }
            }} 
            className="px-4 py-2 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg disabled:opacity-50"
          >
            Confirm & Link
          </button>
        </div>
      </div>
    </div>
  );
}
