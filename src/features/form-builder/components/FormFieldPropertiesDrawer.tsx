import { X, LayoutTemplate, Settings2, SlidersHorizontal, GitBranch, Trash2 } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import type { FormBlock, LogicRule } from '../types/form-builder.types';

export const FormFieldPropertiesDrawer: React.FC = () => {
  const { 
    activeBlockId,  
    activeSectionId,
    sections,
    updateBlock,
    activePropertiesTab,
    setActivePropertiesTab,
    setActiveBlock
  } = useFormBuilderStore();

  const section = sections.find(s => s.id === activeSectionId);
  const block = section?.blocks.find(b => b.id === activeBlockId);

  if (!block || !section) return null;

  const TABS = [
    { id: 'GENERAL', label: 'General', icon: Settings2 },
    { id: 'VALIDATION', label: 'Validation', icon: SlidersHorizontal },
    { id: 'LAYOUT', label: 'Layout', icon: LayoutTemplate },
    { id: 'LOGIC', label: 'Logic', icon: GitBranch },
  ] as const;

  const handleUpdate = (updates: Partial<FormBlock>) => {
    updateBlock(section.id, block.id, updates);
  };

  const renderGeneralTab = () => (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Question Text</label>
        <textarea
          value={block.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="w-full p-3 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none transition-all shadow-sm"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Description / Sub-label</label>
        <textarea
          value={block.description || ''}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          placeholder="Add extra context..."
          className="w-full p-3 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 resize-none transition-all shadow-sm"
          rows={2}
        />
      </div>

      {['FILE_UPLOAD', 'IMAGE_UPLOAD', 'VIDEO_UPLOAD', 'AUDIO_UPLOAD'].includes(block.questionType || '') && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Upload settings</h3>
          <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
            Set how many {block.questionType === 'IMAGE_UPLOAD' ? 'images' : block.questionType === 'VIDEO_UPLOAD' ? 'videos' : block.questionType === 'AUDIO_UPLOAD' ? 'audio files' : 'documents'} a respondent can attach.
          </p>
          <label className="mb-2 block text-[11px] font-bold uppercase text-slate-500" htmlFor={`max-uploads-${block.id}`}>
            Maximum uploads
          </label>
          <select
            id={`max-uploads-${block.id}`}
            value={block.settings?.maxFiles || 1}
            onChange={(e) => handleUpdate({ settings: { ...block.settings, maxFiles: Number(e.target.value) } })}
            className="w-full rounded border border-slate-200 bg-white p-2.5 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map(count => (
              <option key={count} value={count}>{count} {count === 1 ? 'file' : 'files'}</option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer group">
        <input 
          type="checkbox"
          checked={block.settings?.readOnly || false}
          onChange={(e) => handleUpdate({ settings: { ...block.settings, readOnly: e.target.checked } })}
          className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-600"
        />
        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Read-only field</span>
      </label>

      <label className="flex items-center gap-3 cursor-pointer group">
        <input 
          type="checkbox"
          checked={block.isHidden || false}
          onChange={(e) => handleUpdate({ isHidden: e.target.checked })}
          className="w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-600"
        />
        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Hidden field</span>
      </label>
    </div>
  );

  const renderValidationTab = () => (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-50 p-4 rounded border border-slate-200">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-slate-700">Required Field</span>
          <div className="relative">
            <input 
              type="checkbox"
              className="sr-only peer"
              checked={block.validation?.required || false}
              onChange={(e) => handleUpdate({ validation: { ...block.validation, required: e.target.checked } })}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
          </div>
        </label>
      </div>

      {['SHORT_TEXT', 'LONG_TEXT'].includes(block.questionType || '') && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Min Length</label>
              <input 
                type="number" 
                value={block.validation?.minLength || ''}
                onChange={(e) => handleUpdate({ validation: { ...block.validation, minLength: Number(e.target.value) || undefined } })}
                className="w-full p-2 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Max Length</label>
              <input 
                type="number" 
                value={block.validation?.maxLength || ''}
                onChange={(e) => handleUpdate({ validation: { ...block.validation, maxLength: Number(e.target.value) || undefined } })}
                className="w-full p-2 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 transition-colors shadow-sm"
              />
            </div>
          </div>
        </>
      )}

      {['NUMBER'].includes(block.questionType || '') && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Min Value</label>
              <input 
                type="number" 
                value={block.validation?.min || ''}
                onChange={(e) => handleUpdate({ validation: { ...block.validation, min: Number(e.target.value) || undefined } })}
                className="w-full p-2 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 transition-colors shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Max Value</label>
              <input 
                type="number" 
                value={block.validation?.max || ''}
                onChange={(e) => handleUpdate({ validation: { ...block.validation, max: Number(e.target.value) || undefined } })}
                className="w-full p-2 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 transition-colors shadow-sm"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase">Custom Error Message</label>
        <input 
          type="text" 
          value={block.validation?.customErrorMessage || ''}
          onChange={(e) => handleUpdate({ validation: { ...block.validation, customErrorMessage: e.target.value } })}
          placeholder="e.g. Please enter a valid phone number"
          className="w-full p-2 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:outline-none focus:border-purple-600 placeholder-slate-400 transition-colors shadow-sm"
        />
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase">Field Width (Columns)</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { w: 'full', label: '1/1' },
            { w: 'half', label: '1/2' },
            { w: 'third', label: '1/3' },
            { w: 'quarter', label: '1/4' }
          ].map(({ w, label }) => (
            <button
              key={w}
              onClick={() => handleUpdate({ width: w as FormBlock['width'] })}
              className={`py-2 text-xs font-medium rounded border transition-colors ${
                (block.width || 'full') === w 
                  ? 'bg-purple-50 border-purple-600 text-purple-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-3 uppercase">Label Alignment</label>
        <div className="flex bg-slate-100 rounded border border-slate-200 p-1">
          {['TOP', 'LEFT', 'RIGHT'].map((align) => (
            <button
              key={align}
              onClick={() => handleUpdate({ labelAlignment: align as 'TOP' | 'LEFT' | 'RIGHT' })}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                (block.labelAlignment || 'TOP') === align
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {align.charAt(0) + align.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLogicTab = () => {
    const rules = block.logicRules || [];
    
    const handleAddRule = () => {
      const newRule: LogicRule = {
        id: crypto.randomUUID(),
        targetId: '',
        action: 'SHOW_QUESTION',
        conditionOperator: 'AND',
        conditions: [{
          questionId: block.id,
          operator: 'EQUALS',
          value: ''
        }]
      };
      handleUpdate({ logicRules: [...rules, newRule] });
    };

    const handleUpdateRule = (ruleId: string, updates: Partial<LogicRule>) => {
      handleUpdate({
        logicRules: rules.map(r => r.id === ruleId ? { ...r, ...updates } : r)
      });
    };

    const handleDeleteRule = (ruleId: string) => {
      handleUpdate({
        logicRules: rules.filter(r => r.id !== ruleId)
      });
    };

    // Get all blocks (for target selection)
    const allBlocks = sections.flatMap(s => s.blocks).filter(b => b.id !== block.id && b.type === 'QUESTION');
    const allSections = sections.filter(s => s.id !== section.id);

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-500 uppercase">Logic Rules</label>
          <button 
            type="button" 
            onClick={handleAddRule}
            className="text-xs text-purple-600 font-medium hover:text-purple-700 bg-purple-50 px-2 py-1 rounded"
          >
            + Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded border border-slate-200 border-dashed">
            <GitBranch className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs">No logic rules added yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md relative group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">Rule {idx + 1}</span>
                  <button onClick={() => handleDeleteRule(rule.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Condition (Simple: IF current question equals X) */}
                <div className="flex flex-col gap-1 mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500">If answer</span>
                  <div className="flex gap-2">
                    <select 
                      value={rule.conditions[0]?.operator}
                      onChange={(e) => {
                        const newConds = [...rule.conditions];
                        if(newConds[0]) newConds[0].operator = e.target.value as any;
                        handleUpdateRule(rule.id, { conditions: newConds });
                      }}
                      className="text-xs p-1.5 border border-slate-200 rounded flex-1 outline-none focus:border-purple-500"
                    >
                      <option value="EQUALS">Equals</option>
                      <option value="NOT_EQUALS">Does not equal</option>
                      <option value="CONTAINS">Contains</option>
                      <option value="GREATER_THAN">Greater than</option>
                      <option value="LESS_THAN">Less than</option>
                      <option value="EMPTY">Is empty</option>
                      <option value="NOT_EMPTY">Is not empty</option>
                    </select>
                  </div>
                  {!['EMPTY', 'NOT_EMPTY'].includes(rule.conditions[0]?.operator) && (
                    <input 
                      type="text"
                      placeholder="Value..."
                      value={rule.conditions[0]?.value as string || ''}
                      onChange={(e) => {
                        const newConds = [...rule.conditions];
                        if(newConds[0]) newConds[0].value = e.target.value;
                        handleUpdateRule(rule.id, { conditions: newConds });
                      }}
                      className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 w-full mt-1"
                    />
                  )}
                </div>

                {/* Action */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Then</span>
                  <select
                    value={rule.action}
                    onChange={(e) => handleUpdateRule(rule.id, { action: e.target.value as any, targetId: '' })}
                    className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 w-full"
                  >
                    <option value="SHOW_QUESTION">Show Question</option>
                    <option value="HIDE_QUESTION">Hide Question</option>
                    <option value="GO_TO_SECTION">Jump to Section</option>
                    <option value="END_FORM">End Form (Submit)</option>
                  </select>
                  
                  {['SHOW_QUESTION', 'HIDE_QUESTION'].includes(rule.action) && (
                    <select
                      value={rule.targetId}
                      onChange={(e) => handleUpdateRule(rule.id, { targetId: e.target.value })}
                      className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 w-full mt-1"
                    >
                      <option value="">Select a question...</option>
                      {allBlocks.map(b => (
                        <option key={b.id} value={b.id}>{b.title || 'Untitled'}</option>
                      ))}
                    </select>
                  )}

                  {rule.action === 'GO_TO_SECTION' && (
                    <select
                      value={rule.targetId}
                      onChange={(e) => handleUpdateRule(rule.id, { targetId: e.target.value })}
                      className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-purple-500 w-full mt-1"
                    >
                      <option value="">Select a section...</option>
                      {allSections.map((s, i) => (
                        <option key={s.id} value={s.id}>{s.title || `Section ${i + 1}`}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[320px] h-full bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 text-slate-800 shadow-[-5px_0_15px_rgba(0,0,0,0.05)]">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-1">Properties</h2>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            {block.questionType ? block.questionType.replace('_', ' ') : block.type}
          </span>
        </div>
        <button 
          onClick={() => setActiveBlock('', '')} // Close drawer
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-slate-200 bg-slate-50 px-2 pt-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePropertiesTab(tab.id)}
            className={`flex-1 py-2.5 border-b-[3px] flex justify-center transition-colors ${
              activePropertiesTab === tab.id 
                ? 'border-purple-600 text-purple-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            title={tab.label}
          >
            <span className="text-[11px] font-bold tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activePropertiesTab === 'GENERAL' && renderGeneralTab()}
        {activePropertiesTab === 'VALIDATION' && renderValidationTab()}
        {activePropertiesTab === 'LAYOUT' && renderLayoutTab()}
        {activePropertiesTab === 'LOGIC' && renderLogicTab()}
      </div>
    </div>
  );
};
