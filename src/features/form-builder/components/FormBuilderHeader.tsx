import React, { useState, useRef, useEffect } from 'react';
import { Settings, Palette, Undo, Redo, Send, Users, Link2, Printer, Trash2, CheckCircle, MoreVertical } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import { FormShareModal } from './FormShareModal';
import { useNavigate } from 'react-router-dom';

export const FormBuilderHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const { title, setTitle, isSaving, isPublishing, status, lastSavedAt, saveForm, toggleSettings, toggleTheme, isSettingsOpen, isThemeOpen, togglePreview, isPreviewMode, activeTab, setActiveTab, shareModal, openShareModal, closeShareModal } = useFormBuilderStore();
  const undo = (useFormBuilderStore as any).temporal?.getState().undo;
  const redo = (useFormBuilderStore as any).temporal?.getState().redo;
  const pastStates = (useFormBuilderStore as any).temporal?.getState().pastStates;
  const futureStates = (useFormBuilderStore as any).temporal?.getState().futureStates;

  return (
    <div className="flex px-6 items-center justify-between bg-white border-b border-slate-200 text-slate-800 h-14">
      {/* Left section: Title & Undo/Redo */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 bg-purple-600 rounded-md shrink-0 flex items-center justify-center">
          <span className="text-white font-bold text-xs">F</span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-semibold border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:bg-slate-50 focus:outline-none px-2 py-1 w-[180px] lg:w-[250px] transition-colors truncate"
        />
        <div className="flex items-center gap-2 text-slate-500">
          <div className="flex gap-1">
            <button
              onClick={() => undo()}
              disabled={pastStates.length === 0}
              className={`p-1.5 rounded transition-colors ${pastStates.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className={`p-1.5 rounded transition-colors ${futureStates.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-medium ml-2">
            {isSaving ? 'Saving...' : isPublishing ? 'Publishing...' : lastSavedAt ? 'Saved' : 'Unsaved'}
          </span>
          {status === 'PUBLISHED' && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2 font-bold uppercase">
              Published
            </span>
          )}
        </div>
      </div>

      {/* Center: Tabs */}
      {!isPreviewMode ? (
        <div className="flex items-center justify-center h-full flex-1 min-w-[280px]">
          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`h-full px-6 text-[13px] font-bold tracking-wider transition-colors border-b-[3px] ${activeTab === 'QUESTIONS' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
            BUILD
          </button>
          <button
            onClick={() => { toggleSettings(); setActiveTab('QUESTIONS'); }}
            className={`h-full px-6 text-[13px] font-bold tracking-wider transition-colors border-b-[3px] border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50`}
          >
            SETTINGS
          </button>
          <button
            onClick={async () => {
              setActiveTab('QUESTIONS');
              const publishedFormId = await saveForm(true);
              if (!publishedFormId) return;
              navigate(`/partner/forms/${publishedFormId}/edit`, { replace: true });
              openShareModal();
            }}
            disabled={isSaving || isPublishing}
            className={`h-full px-6 text-[13px] font-bold tracking-wider transition-colors border-b-[3px] border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50`}
          >
            PUBLISH
          </button>
        </div>
      ) : <div className="flex-1 min-w-[280px]"></div>}

      {/* Right side controls */}
      <div className="flex items-center gap-2 lg:gap-3 flex-1 justify-end shrink-0">
        <label className="flex items-center gap-2 cursor-pointer mr-2">
          <span className="text-xs font-bold text-slate-600">Preview Form</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isPreviewMode}
              onChange={togglePreview}
            />
            <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </div>
        </label>

        <div className="text-xs text-slate-500 mr-2 flex items-center gap-1">
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : lastSavedAt ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-500" />
              Saved at {lastSavedAt}
            </>
          ) : (
            'Unsaved changes'
          )}
        </div>

        <button
          onClick={async () => {
            const newId = await saveForm();
            if (newId) {
              navigate(`/partner/forms/${newId}/edit`, { replace: true });
            }
          }}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
          Save
        </button>

        <button
          onClick={async () => {
            const publishedFormId = await saveForm(true);
            if (!publishedFormId) return;
            navigate(`/partner/forms/${publishedFormId}/edit`, { replace: true });
            openShareModal();
          }}
          disabled={isSaving || isPublishing}
          className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md text-sm font-medium transition-colors ml-2 disabled:opacity-50"
        >
          {isPublishing ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isPublishing ? 'Publishing...' : 'Publish & Send'}
        </button>

        <button
          onClick={toggleSettings}
          className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${isThemeOpen ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          title="Customize Theme"
        >
          <Palette className="w-5 h-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full transition-colors ml-1 ${isMenuOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <Undo className="w-4 h-4 text-slate-400" /> Undo
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <Redo className="w-4 h-4 text-slate-400" /> Redo
              </button>
              <div className="h-px bg-slate-200 my-1"></div>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <Link2 className="w-4 h-4 text-slate-400" /> Get pre-filled link
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <Printer className="w-4 h-4 text-slate-400" /> Print
              </button>
              <div className="h-px bg-slate-200 my-1"></div>
              <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-400" /> Add collaborators
              </button>
              <div className="h-px bg-slate-200 my-1"></div>
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-400" /> Move to trash
              </button>
            </div>
          )}
        </div>
      </div>

      <FormShareModal isOpen={shareModal.isOpen} onClose={closeShareModal} />
    </div>
  );
};
