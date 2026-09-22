import React, { useState } from 'react';
import { X, FileText, Search, CheckCircle2 } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

const MOCK_FORMS = [
  { id: '1', title: 'Customer Feedback Survey', date: 'Oct 12, 2023', questionsCount: 5 },
  { id: '2', title: 'Event Registration', date: 'Sep 28, 2023', questionsCount: 8 },
  { id: '3', title: 'Employee Satisfaction', date: 'Aug 15, 2023', questionsCount: 12 },
  { id: '4', title: 'Contact Us', date: 'Jul 04, 2023', questionsCount: 4 },
];

const MOCK_QUESTIONS = [
  { id: 'q1', title: 'What is your full name?', type: 'SHORT_TEXT' },
  { id: 'q2', title: 'Email address', type: 'EMAIL' },
  { id: 'q3', title: 'How satisfied were you with our service?', type: 'LINEAR_SCALE' },
  { id: 'q4', title: 'Any additional comments?', type: 'LONG_TEXT' },
  { id: 'q5', title: 'Which products do you use?', type: 'CHECKBOXES' },
];

export const FormImportModal: React.FC = () => {
  const { importModal, closeImportModal, addBlock, activeSectionId, sections } = useFormBuilderStore();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!importModal.isOpen) return null;

  const handleImport = () => {
    const targetSectionId = activeSectionId || sections[0].id;
    
    // In a real app, we'd fetch the actual blocks and insert them.
    // Here we'll just mock inserting the selected questions.
    selectedQuestions.forEach(qId => {
      const q = MOCK_QUESTIONS.find(mq => mq.id === qId);
      if (q) {
        // @ts-ignore
        addBlock(targetSectionId, 'QUESTION', q.type);
      }
    });
    
    closeImportModal();
    setSelectedFormId(null);
    setSelectedQuestions([]);
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const filteredForms = MOCK_FORMS.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex max-h-[85vh] overflow-hidden h-[600px]">
        
        {/* Left Side: Forms List */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col bg-slate-50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <h2 className="text-xl font-medium text-slate-800">Import questions</h2>
            <button onClick={closeImportModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search forms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filteredForms.map(form => (
              <div 
                key={form.id}
                onClick={() => { setSelectedFormId(form.id); setSelectedQuestions([]); }}
                className={`p-4 rounded-lg cursor-pointer mb-3 flex items-start gap-4 transition-colors ${selectedFormId === form.id ? 'bg-purple-100 border border-purple-300' : 'bg-white border border-slate-200 hover:border-purple-300'}`}
              >
                <div className={`p-3 rounded-md ${selectedFormId === form.id ? 'bg-purple-200 text-purple-700' : 'bg-purple-100 text-purple-600'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">{form.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">Last opened {form.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Questions Selection */}
        <div className="w-1/2 flex flex-col bg-white relative">
          <button onClick={closeImportModal} className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hidden md:block">
            <X className="w-5 h-5" />
          </button>

          {selectedFormId ? (
            <>
              <div className="p-6 border-b border-slate-200 mt-8">
                <h3 className="text-xl font-medium text-slate-800">Select questions to import</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium text-slate-500">{selectedQuestions.length} selected</span>
                  <button 
                    onClick={() => setSelectedQuestions(selectedQuestions.length === MOCK_QUESTIONS.length ? [] : MOCK_QUESTIONS.map(q => q.id))}
                    className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                  >
                    {selectedQuestions.length === MOCK_QUESTIONS.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {MOCK_QUESTIONS.map(q => {
                  const isSelected = selectedQuestions.includes(q.id);
                  return (
                    <div 
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      className={`p-4 rounded-lg border mb-3 cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'border-purple-600 bg-purple-50' : 'border-slate-200 hover:border-purple-300'}`}
                    >
                      <div>
                        <h4 className="font-medium text-slate-800">{q.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1 capitalize">{q.type.replace('_', ' ')}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 text-transparent'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
                <button 
                  onClick={closeImportModal}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleImport}
                  disabled={selectedQuestions.length === 0}
                  className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Import questions
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-medium text-slate-800 mb-3">Select a form</h3>
              <p className="text-slate-500 text-lg max-w-sm">Choose a form from the list to view its questions and import them into your current form.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
