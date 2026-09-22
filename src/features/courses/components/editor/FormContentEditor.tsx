import { useState } from 'react';
import { Search, X, BarChart2, Maximize2, Loader2, Check, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForms } from '../../api/forms.api';

export default function FormContentEditor({
  item,
  isSaving,
  onSaveContent,
  onCancel,
}: {
  item: any;
  isSaving: boolean;
  onSaveContent: (content: any) => void;
  onCancel: () => void;
}) {
  const [isFormLibraryOpen, setIsFormLibraryOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(item.content?.form ?? null);
  const [isLinking, setIsLinking] = useState(false);
  const [freePreview, setFreePreview] = useState(item.content?.freePreview ?? false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Forms');

  const [tempSelectedForm, setTempSelectedForm] = useState<any>(null);

  const { data: forms = [], isLoading: isLoadingForms } = useForms();

  const filteredForms = forms.filter(f => {
    if (activeTab === 'Active' && f.status !== 'ACTIVE') return false;
    if (activeTab === 'Draft' && f.status !== 'DRAFT') return false;
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAddForm = () => {
    if (!tempSelectedForm) return;
    setIsLinking(true);
    // Simulate linking delay
    setTimeout(() => {
      setSelectedForm(tempSelectedForm);
      setIsLinking(false);
      setIsFormLibraryOpen(false);
      setTempSelectedForm(null);
      toast.success('Form added successfully', {
        icon: '✓',
        style: {
          border: '1px solid #10B981',
          padding: '8px 16px',
          color: '#065F46',
          backgroundColor: '#ECFDF5'
        }
      });
    }, 2500);
  };

  const handleSaveChanges = () => {
    onSaveContent({ form: selectedForm, freePreview });
  };

  return (
    <div className="space-y-6">
      {/* Link Form Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Link Form</label>
        {selectedForm ? (
          <div className="flex flex-col gap-3">
            <div className="flex border border-teal-300 rounded-lg bg-teal-50/40 p-3 relative items-start gap-2">
               <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
               <div className="flex flex-col">
                 <span className="text-sm font-semibold text-teal-700">Linked to Library</span>
                 <span className="text-xs text-slate-500 mt-0.5">{selectedForm?.responses ?? '1,247 responses'} captured</span>
               </div>
               <button onClick={() => setSelectedForm(null)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <button
              onClick={() => setIsFormLibraryOpen(true)}
              className="w-full py-2.5 border border-dashed border-indigo-300 text-indigo-500 bg-white font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center border border-indigo-500 rounded-full text-[12px] pb-[1px]">+</div> Link Form
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsFormLibraryOpen(true)}
            className="w-full py-2.5 border border-slate-300 text-teal-700 bg-white font-semibold rounded-lg hover:bg-slate-50 transition-colors text-sm"
          >
            Open Form Library
          </button>
        )}
      </div>

      {/* Free Preview Lesson */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Free Preview Lesson</p>
          <p className="text-xs text-slate-500">Allow non-registered users access</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={freePreview}
            onChange={e => setFreePreview(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700"></div>
        </label>
      </div>

      {/* Open Fullscreen Editor */}
      <button 
        onClick={() => toast.success('Fullscreen editor coming soon!', { icon: '🏗️' })}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm"
      >
        <Maximize2 className="w-4 h-4" />
        Open Fullscreen Editor
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex-1 py-2.5 bg-[#0C5A69] text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
        <button 
          onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>

      {/* Modals */}
      {isFormLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {isLinking ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-[#0C5A69] animate-spin mb-6"></div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Adding Form to Course</h2>
                <p className="text-sm text-slate-500 mb-8">Linking '{tempSelectedForm?.title}'...</p>
                <div className="w-full max-w-sm h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[#0C5A69] w-2/3 animate-pulse"></div>
                </div>
                <p className="text-xs text-slate-400">Importing fields, settings, and linking live integrations...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                  <h2 className="text-xl font-bold text-slate-800">Select a Form</h2>
                  <button onClick={() => setIsFormLibraryOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search & Tabs */}
                <div className="p-5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search forms..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0C5A69] focus:border-[#0C5A69]"
                      />
                    </div>
                    <div className="flex items-center gap-6 text-sm ml-auto">
                      {['All Forms', 'Active', 'Draft'].map(t => (
                        <button
                          key={t}
                          onClick={() => setActiveTab(t)}
                          className={`font-semibold transition-colors pb-1 border-b-2 ${
                            activeTab === t ? 'text-[#0C5A69] border-[#0C5A69]' : 'text-slate-500 border-transparent hover:text-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {isLoadingForms ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-teal-600" /></div>
                  ) : (
                    <>
                      {filteredForms.map(form => {
                        const isSelected = tempSelectedForm?.id === form.id;
                    return (
                      <div
                        key={form.id}
                        onClick={() => setTempSelectedForm(form)}
                        className={`flex flex-col gap-2 p-4 border rounded-xl cursor-pointer transition-all ${
                          isSelected ? 'border-[#0C5A69] bg-teal-50/30 ring-1 ring-[#0C5A69]' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold w-max ${
                              form.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {form.status === 'ACTIVE' ? 'Active' : 'Draft'}
                            </span>
                            <span className="font-bold text-slate-800 text-sm">{form.title}</span>
                            <span className="text-xs text-slate-400">
                              Edited {new Date(form.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-col items-end justify-between h-full gap-3">
                            <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                              {isSelected ? (
                                <div className="w-2.5 h-2.5 bg-[#0C5A69] rounded-full"></div>
                              ) : (
                                <div className="w-full h-full rounded-full border-slate-300"></div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <BarChart2 className="w-3 h-3" />
                                {form.responses} responses
                                </span>
                                <button className="px-3 py-1 border border-slate-200 text-xs font-semibold rounded hover:bg-slate-50 text-slate-700">Select</button>
                            </div>
                          </div>
                        </div>
                        </div>
                      );
                    })}
                    {filteredForms.length === 0 && (
                      <div className="text-center py-10 text-slate-500 text-sm">No forms found.</div>
                    )}
                  </>
                  )}
                </div>

                {/* Footer */}
                {tempSelectedForm && (
                  <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-white shrink-0 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0C5A69]">
                      <Check className="w-4 h-4" />
                      Selected: {tempSelectedForm.title}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setIsFormLibraryOpen(false); setTempSelectedForm(null); }}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddForm}
                        className="px-5 py-2 bg-[#0C5A69] text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                      >
                        Add to Course
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
