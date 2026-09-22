import React from 'react';
import { X, Smartphone, Tablet, Monitor } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

import { getLogicActions } from '../utils/logicEvaluator';
import SignaturePad from './SignaturePad';

const youtubeEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/').split('&')[0];
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
  return null;
};

export const FormPreviewLayout: React.FC = () => {
  const { title, description, sections, theme, togglePreview } = useFormBuilderStore();
  const [device, setDevice] = React.useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);
  const [history, setHistory] = React.useState<number[]>([0]);
  const [responses, setResponses] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const currentSection = sections[currentSectionIndex];

  // --- Logic Evaluation ---
  const allRules = sections.flatMap(s => s.blocks).flatMap(b => b.logicRules || []);
  const activeActions = getLogicActions(allRules, responses);
  
  const hiddenBlockIds = new Set<string>();
  const shownBlockIds = new Set<string>();
  let jumpTargetId: string | null = null;
  let shouldEndForm = false;

  activeActions.forEach(rule => {
    if (rule.action === 'HIDE_QUESTION') hiddenBlockIds.add(rule.targetId);
    if (rule.action === 'SHOW_QUESTION') shownBlockIds.add(rule.targetId);
    if (rule.action === 'GO_TO_SECTION') jumpTargetId = rule.targetId;
    if (rule.action === 'END_FORM') shouldEndForm = true;
  });
  // ------------------------

  const handleResponseChange = (blockId: string, value: any) => {
    setResponses(prev => ({ ...prev, [blockId]: value }));
  };


  const validateFieldFormat = (questionType: string, val: any): string | null => {
    if (!val && val !== 0) return null;
    switch (questionType) {
      case 'EMAIL': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) return 'Please enter a valid email address (e.g. name@example.com)';
        break;
      }
      case 'PHONE': {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,10}$/;
        if (!phoneRegex.test(val.replace(/\s/g, ''))) return 'Please enter a valid phone number (digits, +, -, spaces only)';
        break;
      }
      case 'NUMBER': {
        if (isNaN(Number(val))) return 'Please enter a valid number';
        break;
      }
      case 'URL': {
        try {
          const url = new URL(val);
          if (!['http:', 'https:'].includes(url.protocol)) return 'Please enter a valid URL starting with http:// or https://';
        } catch { return 'Please enter a valid URL (e.g. https://example.com)'; }
        break;
      }
      case 'DATE': {
        if (isNaN(Date.parse(val))) return 'Please enter a valid date';
        break;
      }
      default: break;
    }
    return null;
  };

  const validateSection = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    currentSection?.blocks.forEach(block => {
      let isBlockHidden = block.isHidden;
      if (hiddenBlockIds.has(block.id)) isBlockHidden = true;
      if (shownBlockIds.has(block.id)) isBlockHidden = false;

      if (isBlockHidden || block.type !== 'QUESTION') return;

      const val = responses[block.id];
      const qt = block.questionType || '';

      // 1. Required check
      if (block.validation?.required) {
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[block.id] = block.validation.customErrorMessage || 'This is a required question';
          isValid = false;
          return;
        }
      }

      // 2. Format check
      if (val !== undefined && val !== null && val !== '') {
        const formatError = validateFieldFormat(qt, val);
        if (formatError) {
          newErrors[block.id] = block.validation?.customErrorMessage || formatError;
          isValid = false;
          return;
        }
      }

      // 3. Min/Max length
      if (['SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'URL'].includes(qt) && val) {
        const len = String(val).length;
        if (block.validation?.minLength && len < block.validation.minLength) {
          newErrors[block.id] = `Minimum ${block.validation.minLength} characters required`;
          isValid = false; return;
        }
        if (block.validation?.maxLength && len > block.validation.maxLength) {
          newErrors[block.id] = `Maximum ${block.validation.maxLength} characters allowed`;
          isValid = false; return;
        }
      }

      // 4. Min/Max value for numbers
      if (qt === 'NUMBER' && val !== undefined && val !== '') {
        const num = Number(val);
        if (block.validation?.min !== undefined && num < block.validation.min) {
          newErrors[block.id] = `Value must be at least ${block.validation.min}`;
          isValid = false; return;
        }
        if (block.validation?.max !== undefined && num > block.validation.max) {
          newErrors[block.id] = `Value must be at most ${block.validation.max}`;
          isValid = false; return;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };


  const handleNext = () => {
    if (!validateSection()) {
      return;
    }

    if (shouldEndForm) {
      handleSubmit(new Event('submit') as any);
      return;
    }

    if (jumpTargetId) {
      const nextIdx = sections.findIndex(s => s.id === jumpTargetId);
      if (nextIdx !== -1) {
        setCurrentSectionIndex(nextIdx);
        setHistory(prev => [...prev, nextIdx]);
        return;
      }
    }

    if (currentSection?.goToSectionId) {
      if (currentSection.goToSectionId === 'SUBMIT') {
        alert('Form submitted! (Preview Mode)');
        return;
      }
      if (currentSection.goToSectionId !== 'NEXT') {
        const nextIdx = sections.findIndex(s => s.id === currentSection.goToSectionId);
        if (nextIdx !== -1) {
          setCurrentSectionIndex(nextIdx);
          setHistory(prev => [...prev, nextIdx]);
          return;
        }
      }
    }

    if (currentSectionIndex < sections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setHistory(prev => [...prev, nextIndex]);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current
      const previousIndex = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentSectionIndex(previousIndex);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSection()) {
      return;
    }
    alert('Form submitted! (Preview Mode)');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative h-full">
      {/* Preview Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Preview Mode</span>
        </div>
        
        {/* Device Toggles */}
        <div className="flex items-center bg-slate-100 rounded-md p-1">
          <button 
            onClick={() => setDevice('DESKTOP')}
            className={`p-1.5 rounded transition-colors ${device === 'DESKTOP' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDevice('TABLET')}
            className={`p-1.5 rounded transition-colors ${device === 'TABLET' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setDevice('MOBILE')}
            className={`p-1.5 rounded transition-colors ${device === 'MOBILE' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <button 
          onClick={togglePreview}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4" /> Exit Preview
        </button>
      </div>

      <div 
        className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center py-8 transition-all duration-300"
        style={{
          fontFamily: theme.fontFamily,
          backgroundColor: theme.backgroundColor,
        }}
      >
        <div 
          className={`transition-all duration-300 ${
            device === 'DESKTOP' ? (theme.formWidth === 'NARROW' ? 'w-[770px]' : theme.formWidth === 'WIDE' ? 'w-[1200px]' : 'w-[900px]') : 
            device === 'TABLET' ? 'w-[768px]' : 
            'w-[375px]'
          } max-w-full px-4 flex flex-col gap-4 pb-16`}
        >
          
          {theme.headerImageUrl && (
            <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden mb-4 shadow-sm">
              <img src={theme.headerImageUrl} alt="Form header" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Form Header (Only show on first section) */}
          {currentSectionIndex === 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 border-t-[10px]" style={{ borderTopColor: theme.primaryColor }}>
              <h1 className="text-3xl font-normal text-slate-800 mb-2">{title || 'Untitled Form'}</h1>
              {description && <p className="text-slate-600 text-sm whitespace-pre-wrap">{description}</p>}
            </div>
          )}

          {/* Section Blocks - grid layout support */}
          <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 items-start">
            {currentSection?.blocks.map((block) => {
              const widthMap: Record<string, string> = {
                full:    'col-span-12',
                half:    'col-span-12 md:col-span-6',
                third:   'col-span-12 md:col-span-4',
                quarter: 'col-span-12 md:col-span-3',
              };
              // On mobile device preview, always go full width
              const blockWidth = (device === 'MOBILE') ? 'full' : (block.width || 'full');
              const widthClass = widthMap[blockWidth];
              
              let isBlockHidden = block.isHidden;
              if (hiddenBlockIds.has(block.id)) isBlockHidden = true;
              if (shownBlockIds.has(block.id)) isBlockHidden = false;

              if (isBlockHidden) return null;
              
              const isHorizontal = block.labelAlignment === 'LEFT' || block.labelAlignment === 'RIGHT';

              return (
              <div key={block.id} className={`${widthClass} bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex ${isHorizontal ? 'flex-row gap-8 items-start' : 'flex-col gap-4'}`}>
                {block.type === 'QUESTION' && (
                  <div className={`flex flex-col ${block.labelAlignment === 'RIGHT' ? 'items-end text-right w-1/3 shrink-0' : block.labelAlignment === 'LEFT' ? 'items-start text-left w-1/3 shrink-0' : 'w-full'}`}>
                    <label className="text-base font-medium text-slate-800">
                      {block.title || 'Untitled Question'}
                      {block.validation?.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {block.description && (
                      <p className="text-xs text-slate-500 mt-1">{block.description}</p>
                    )}
                  </div>
                )}
                
                {block.type === 'TITLE_DESCRIPTION' && (
                  <div className="w-full">
                    <h2 className="text-xl font-medium text-slate-800">{block.title}</h2>
                    {block.description && <p className="text-sm text-slate-600 mt-2">{block.description}</p>}
                  </div>
                )}

                {block.type === 'IMAGE' && (
                  <div className="w-full flex flex-col gap-2">
                    {block.title && block.title !== 'Image' && <h2 className={`text-base font-medium text-slate-800 ${block.labelAlignment === 'CENTER' ? 'text-center' : block.labelAlignment === 'RIGHT' ? 'text-right' : 'text-left'}`}>{block.title}</h2>}
                    {block.mediaUrl ? (
                      <div className={`flex ${block.labelAlignment === 'CENTER' ? 'justify-center' : block.labelAlignment === 'RIGHT' ? 'justify-end' : 'justify-start'}`}>
                        <img src={block.mediaUrl} alt={block.title || 'Image'} className="max-w-full rounded-md max-h-[400px] object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-sm border border-slate-200 border-dashed">
                        Image placeholder (upload an image in builder)
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'VIDEO' && (
                  <div className="w-full flex flex-col gap-2">
                    {block.title && block.title !== 'Video' && <h2 className={`text-base font-medium text-slate-800 ${block.labelAlignment === 'CENTER' ? 'text-center' : block.labelAlignment === 'RIGHT' ? 'text-right' : 'text-left'}`}>{block.title}</h2>}
                    {block.mediaUrl ? (
                      <div className={`flex ${block.labelAlignment === 'CENTER' ? 'justify-center' : block.labelAlignment === 'RIGHT' ? 'justify-end' : 'justify-start'}`}>
                        {youtubeEmbedUrl(block.mediaUrl) ? <iframe src={youtubeEmbedUrl(block.mediaUrl)!} title={block.title || 'Video'} className="w-full max-w-2xl aspect-video rounded-md bg-black" allowFullScreen /> : <video src={block.mediaUrl} controls preload="metadata" className="w-full max-w-2xl aspect-video rounded-md bg-black object-contain" />}
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-sm border border-slate-200 border-dashed">
                        Video placeholder (embed a video in builder)
                      </div>
                    )}
                  </div>
                )}

                {/* Render Inputs Based on Question Type */}
                <div className={`flex-1 ${isHorizontal ? 'mt-0' : 'mt-2'} w-full`}>
                  {['SHORT_TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'URL'].includes(block.questionType || '') && (
                    <input 
                      type={block.questionType === 'NUMBER' ? 'number' : block.questionType === 'EMAIL' ? 'email' : block.questionType === 'PHONE' ? 'tel' : block.questionType === 'URL' ? 'url' : 'text'} 
                      placeholder="Your answer" 
                      className={`w-1/2 border-b outline-none pb-1 text-sm transition-colors ${errors[block.id] ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-purple-600'}`}
                      value={responses[block.id] || ''}
                      onChange={(e) => {
                        handleResponseChange(block.id, e.target.value);
                        if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                      }}
                    />
                  )}
                  {block.questionType === 'LONG_TEXT' && (
                    <textarea 
                      placeholder="Your answer" 
                      className={`w-full border-b outline-none pb-1 text-sm transition-colors resize-none h-10 ${errors[block.id] ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-purple-600'}`}
                      value={responses[block.id] || ''}
                      onChange={(e) => {
                        handleResponseChange(block.id, e.target.value);
                        if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                      }}
                    />
                  )}
                  {block.questionType === 'MULTIPLE_CHOICE' && (
                    <div className="flex flex-col gap-3">
                      {block.options?.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name={`question-${block.id}`} 
                            value={opt.id}
                            checked={responses[block.id] === opt.id}
                            onChange={(e) => {
                              handleResponseChange(block.id, e.target.value);
                              if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                            }}
                            className={`w-4 h-4 text-purple-600 focus:ring-purple-600 ${errors[block.id] ? 'border-red-500' : 'border-slate-300'}`} 
                          />
                          <span className="text-sm text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {block.questionType === 'CHECKBOXES' && (
                    <div className="flex flex-col gap-3">
                      {block.options?.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-600" />
                          <span className="text-sm text-slate-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {block.questionType === 'DROPDOWN' && (
                    <select 
                      value={responses[block.id] || ''}
                      onChange={(e) => {
                        handleResponseChange(block.id, e.target.value);
                        if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                      }}
                      className={`w-[300px] p-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-600 text-sm bg-transparent ${errors[block.id] ? 'border-red-500' : 'border-slate-300'}`}
                    >
                      <option value="" disabled>Choose</option>
                      {block.options?.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                  {block.questionType === 'DATE' && (
                    <input type="date" value={responses[block.id] || ''} onChange={(event) => handleResponseChange(block.id, event.target.value)} className="p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-purple-600 text-sm" />
                  )}
                  {block.questionType === 'TIME' && (
                    <input type="time" value={responses[block.id] || ''} onChange={(event) => handleResponseChange(block.id, event.target.value)} className="p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-purple-600 text-sm" />
                  )}
                  {block.questionType === 'DATE_TIME' && (
                    <input type="datetime-local" value={responses[block.id] || ''} onChange={(event) => handleResponseChange(block.id, event.target.value)} className="p-2 border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-purple-600 text-sm" />
                  )}
                  {block.questionType === 'LINEAR_SCALE' && (
                    <div className="flex items-center gap-8 py-4">
                      <span className="text-sm font-medium text-slate-600">1</span>
                      <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} className="flex flex-col items-center gap-2">
                            <label className="cursor-pointer">
                              <input type="radio" name={`scale-${block.id}`} className="w-5 h-5 text-purple-600 border-slate-300 focus:ring-purple-600" />
                            </label>
                            <span className="text-xs text-slate-500">{n}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-600">5</span>
                    </div>
                  )}
                  {block.questionType === 'RATING' && (
                    <div className="flex items-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button type="button" key={n} className="text-slate-300 hover:text-purple-600 transition-colors focus:outline-none">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                  {['FILE_UPLOAD', 'IMAGE_UPLOAD', 'VIDEO_UPLOAD', 'AUDIO_UPLOAD'].includes(block.questionType || '') && (
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        multiple={(block.settings?.maxFiles || 1) > 1}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const maxFiles = block.settings?.maxFiles || 1;
                          const maxSize = block.settings?.maxFileSizeMB || (block.questionType === 'VIDEO_UPLOAD' ? 500 : block.questionType === 'AUDIO_UPLOAD' ? 100 : 10);
                          if (files.length > maxFiles) {
                            setErrors(prev => ({ ...prev, [block.id]: `You can upload up to ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}` }));
                            e.target.value = '';
                            return;
                          }
                          const oversizedFile = files.find(file => file.size > maxSize * 1024 * 1024);
                          if (oversizedFile) {
                            setErrors(prev => ({ ...prev, [block.id]: `${oversizedFile.name} must be smaller than ${maxSize} MB` }));
                            e.target.value = '';
                            return;
                          }
                          handleResponseChange(block.id, files.map(file => ({ name: file.name, size: file.size, type: file.type })));
                          setErrors(prev => ({ ...prev, [block.id]: '' }));
                        }}
                        className={`text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium hover:file:bg-purple-100 cursor-pointer ${errors[block.id] ? 'file:bg-red-50 file:text-red-700' : 'file:bg-purple-50 file:text-purple-700'}`}
                        accept={block.questionType === 'IMAGE_UPLOAD' ? 'image/*' : block.questionType === 'VIDEO_UPLOAD' ? 'video/*' : block.questionType === 'AUDIO_UPLOAD' ? 'audio/*' : block.settings?.allowSpecificFileTypes ? block.settings.allowedFileTypes?.join(',') : '*/*'}
                      />
                      {block.settings?.allowSpecificFileTypes && block.settings.allowedFileTypes?.length && (
                        <p className="text-xs text-slate-500 mt-1">
                          Allowed types: {block.settings.allowedFileTypes.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Up to {block.settings?.maxFiles || 1} {block.questionType === 'IMAGE_UPLOAD' ? 'image(s)' : block.questionType === 'VIDEO_UPLOAD' ? 'video(s)' : block.questionType === 'AUDIO_UPLOAD' ? 'audio file(s)' : 'file(s)'} · Max size per file: {block.settings?.maxFileSizeMB || (block.questionType === 'VIDEO_UPLOAD' ? 500 : block.questionType === 'AUDIO_UPLOAD' ? 100 : 10)} MB
                      </p>
                      {Array.isArray(responses[block.id]) && responses[block.id].length > 0 && (
                        <ul className="space-y-1 text-xs text-slate-600">
                          {responses[block.id].map((file: { name: string }, index: number) => <li key={`${file.name}-${index}`}>✓ {file.name}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  {block.questionType === 'SIGNATURE' && (
                    <SignaturePad value={responses[block.id]} error={Boolean(errors[block.id])} onChange={(value) => handleResponseChange(block.id, value)} />
                  )}

                  {errors[block.id] && (
                    <div className="text-sm text-red-500 flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {errors[block.id]}
                    </div>
                  )}

                  {block.subLabel && (
                    <div className={`text-xs text-slate-500 font-medium ${isHorizontal ? '' : 'mt-1'}`}>
                      {block.subLabel}
                    </div>
                  )}
                </div>
              </div>
              );
            })}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
            {history.length > 1 ? (
              <button type="button" onClick={handleBack} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                Back
              </button>
            ) : <div />}

            {currentSection?.isRepeatable && (
              <button 
                type="button" 
                onClick={() => alert("Repeatable section logic will add a new instance of this section.")} 
                className="mr-auto ml-4 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200"
              >
                + Add another
              </button>
            )}

            {currentSectionIndex < sections.length - 1 ? (
              <button type="button" onClick={handleNext} className="px-6 py-2 text-sm font-medium text-white rounded-md transition-colors" style={{ backgroundColor: theme.primaryColor }}>
                Next
              </button>
            ) : (
              <button type="submit" className="px-6 py-2 text-sm font-medium text-white rounded-md transition-colors" style={{ backgroundColor: theme.primaryColor }}>
                Submit
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  </div>
  );
};
