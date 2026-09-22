import React, { useEffect, useState } from 'react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import { getLogicActions } from '../utils/logicEvaluator';
import { Lock } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { API_BASE_URL } from '../../../shared/api/config';
import { uploadToS3 } from '../../courses/api/uploads.api';

const youtubeEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/').split('&')[0];
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0];
  return null;
};

export const PublicFormView: React.FC = () => {
  const { title, description, sections, theme, settings, formId, loadForm } = useFormBuilderStore();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<number[]>([0]);
  const [isSubmitted, setIsSubmitted] = useState(() => {
    if (settings.limitOneResponse && formId) {
      return localStorage.getItem(`form_submitted_${formId}`) === 'true';
    }
    return false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!settings.expiryDate) {
      return;
    }
    const expiryTime = new Date(settings.expiryDate).getTime();
    const checkExpiry = () => setExpired(Date.now() >= expiryTime);
    checkExpiry();
    const interval = window.setInterval(checkExpiry, 1000);
    return () => window.clearInterval(interval);
  }, [settings.expiryDate]);

  const currentSection = sections[currentSectionIndex];
  const isFirstSection = currentSectionIndex === 0;

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

  if (expired) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Form expired</h1>
          <p className="text-slate-600 mt-3">This form is no longer accepting responses.</p>
        </div>
      </div>
    );
  }

  // Access Control: Password Protection
  if (settings.requirePassword && !isPasswordVerified) {
    const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError('');
      try {
        if (!formId) throw new Error('Form is unavailable.');
        await loadForm(formId, true, password);
        setIsPasswordVerified(true);
      } catch {
        setPasswordError('Incorrect password. Please try again.');
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
        <form onSubmit={handlePasswordSubmit} className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Protected Form</h1>
          <p className="text-slate-600 text-sm mb-2">
            This form requires a password to view and submit.
          </p>
          <div className="w-full flex flex-col gap-2">
            <input 
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-700 focus:outline-none focus:border-purple-600"
            />
            {passwordError && <p className="text-xs text-red-500 text-left">{passwordError}</p>}
          </div>
          <button 
            type="submit"
            className="w-full py-2.5 mt-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition-colors"
          >
            Access Form
          </button>
        </form>
      </div>
    );
  }

  const handleResponseChange = (blockId: string, value: any) => {
    setResponses(prev => ({ ...prev, [blockId]: value }));
  };

  // ── Per-type validation helpers ──────────────────────────────────
  const validateFieldFormat = (questionType: string, val: any): string | null => {
    if (!val && val !== 0) return null; // empty handled by required check

    switch (questionType) {
      case 'EMAIL': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val))
          return 'Please enter a valid email address (e.g. name@example.com)';
        break;
      }
      case 'PHONE': {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{4,10}$/;
        if (!phoneRegex.test(val.replace(/\s/g, '')))
          return 'Please enter a valid phone number (digits, +, -, spaces only)';
        break;
      }
      case 'NUMBER': {
        if (isNaN(Number(val)))
          return 'Please enter a valid number';
        break;
      }
      case 'URL': {
        try {
          const url = new URL(val);
          if (!['http:', 'https:'].includes(url.protocol))
            return 'Please enter a valid URL starting with http:// or https://';
        } catch {
          return 'Please enter a valid URL (e.g. https://example.com)';
        }
        break;
      }
      case 'DATE': {
        if (isNaN(Date.parse(val)))
          return 'Please enter a valid date';
        break;
      }
      default:
        break;
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
        if (val === undefined || val === null || val === '' ||
          (Array.isArray(val) && val.length === 0)) {
          newErrors[block.id] = block.validation.customErrorMessage || 'This is a required question';
          isValid = false;
          return; // skip format check if empty
        }
      }

      // 2. Format / type check (even if not required, validate if filled)
      if (val !== undefined && val !== null && val !== '') {
        const formatError = validateFieldFormat(qt, val);
        if (formatError) {
          newErrors[block.id] = block.validation?.customErrorMessage || formatError;
          isValid = false;
          return;
        }
      }

      // 3. Min/Max length (for text fields)
      if (['SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'URL'].includes(qt) && val) {
        const len = String(val).length;
        if (block.validation?.minLength && len < block.validation.minLength) {
          newErrors[block.id] = `Minimum ${block.validation.minLength} characters required`;
          isValid = false;
          return;
        }
        if (block.validation?.maxLength && len > block.validation.maxLength) {
          newErrors[block.id] = `Maximum ${block.validation.maxLength} characters allowed`;
          isValid = false;
          return;
        }
      }

      // 4. Min/Max value (for number fields)
      if (qt === 'NUMBER' && val !== undefined && val !== '') {
        const num = Number(val);
        if (block.validation?.min !== undefined && num < block.validation.min) {
          newErrors[block.id] = `Value must be at least ${block.validation.min}`;
          isValid = false;
          return;
        }
        if (block.validation?.max !== undefined && num > block.validation.max) {
          newErrors[block.id] = `Value must be at most ${block.validation.max}`;
          isValid = false;
          return;
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
        handleSubmit(new Event('submit') as any);
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
      newHistory.pop();
      const previousIndex = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentSectionIndex(previousIndex);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSection()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the form ID from the store or URL. Since this is just a preview/mock right now, 
      // we'll just log it. But here is the exact API call structure:
      const formId = useFormBuilderStore.getState().formId;
      if (formId) {
        const payload = {
          responses,
          password: settings.requirePassword ? password : null,
          metadata: {
            userAgent: navigator.userAgent,
          }
        };

        const res = await fetch(`${API_BASE_URL}/form-builder/forms/${formId}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('Failed to submit');
        }
      }
      
      console.log('Form Responses Submitted:', responses);
      if (formId && settings.limitOneResponse) {
        localStorage.setItem(`form_submitted_${formId}`, 'true');
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">Thank You!</h1>
          <p className="text-slate-600 text-sm">Your submission has been received.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full overflow-y-auto custom-scrollbar flex flex-col items-center py-12 transition-all duration-300"
      style={{ fontFamily: theme.fontFamily, backgroundColor: theme.backgroundColor }}
    >
      <div 
        className={`transition-all duration-300 ${
          theme.formWidth === 'NARROW' ? 'w-[770px]' : theme.formWidth === 'WIDE' ? 'w-[1200px]' : 'w-[900px]'
        } max-w-full px-4 flex flex-col gap-4 pb-16`}
      >
        
        {theme.headerImageUrl && (
          <div className="w-full h-32 md:h-48 rounded-lg overflow-hidden mb-4 shadow-sm">
            <img src={theme.headerImageUrl} alt="Form header" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Form Header (Only show on first section) */}
        {isFirstSection && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 border-t-[10px]" style={{ borderTopColor: theme.primaryColor }}>
            <h1 className="text-3xl font-normal text-slate-800 mb-2">{title || 'Untitled Form'}</h1>
            {description && <p className="text-slate-600 text-sm whitespace-pre-wrap">{description}</p>}
          </div>
        )}

        {/* Section Blocks */}
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 items-start">
          {currentSection?.blocks.map((block) => {
            const widthMap: Record<string, string> = {
              full:    'col-span-12',
              half:    'col-span-12 md:col-span-6',
              third:   'col-span-12 md:col-span-4',
              quarter: 'col-span-12 md:col-span-3',
            };
            const blockWidth = block.width || 'full';
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
                    ) : <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">Image is not available.</p>}
                  </div>
                )}

                {block.type === 'VIDEO' && (
                  <div className="w-full flex flex-col gap-2">
                    {block.title && block.title !== 'Video' && <h2 className={`text-base font-medium text-slate-800 ${block.labelAlignment === 'CENTER' ? 'text-center' : block.labelAlignment === 'RIGHT' ? 'text-right' : 'text-left'}`}>{block.title}</h2>}
                    {block.mediaUrl ? (
                      <div className={`flex ${block.labelAlignment === 'CENTER' ? 'justify-center' : block.labelAlignment === 'RIGHT' ? 'justify-end' : 'justify-start'}`}>
                        {youtubeEmbedUrl(block.mediaUrl) ? <iframe src={youtubeEmbedUrl(block.mediaUrl)!} title={block.title || 'Video'} className="w-full max-w-2xl aspect-video rounded-md bg-black" allowFullScreen /> : <video src={block.mediaUrl} controls preload="metadata" className="w-full max-w-2xl aspect-video rounded-md bg-black object-contain">Your browser does not support this video.</video>}
                      </div>
                    ) : <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">Video is not available.</p>}
                  </div>
                )}

                <div className={`flex-1 ${isHorizontal ? 'mt-0' : 'mt-2'} w-full`}>
                  {/* Inputs */}
                  {['SHORT_TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'URL'].includes(block.questionType || '') && (
                    <input 
                      type={block.questionType === 'NUMBER' ? 'number' : block.questionType === 'EMAIL' ? 'email' : block.questionType === 'PHONE' ? 'tel' : block.questionType === 'URL' ? 'url' : 'text'} 
                      placeholder={block.settings?.placeholder || "Your answer"} 
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
                      placeholder={block.settings?.placeholder || "Your answer"} 
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
                      {block.options?.map((opt) => {
                        const isChecked = (responses[block.id] || []).includes(opt.id);
                        return (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={(e) => {
                                const current = responses[block.id] || [];
                                const next = e.target.checked ? [...current, opt.id] : current.filter((id: string) => id !== opt.id);
                                handleResponseChange(block.id, next);
                                if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                              }}
                              className={`w-4 h-4 text-purple-600 rounded focus:ring-purple-600 ${errors[block.id] ? 'border-red-500' : 'border-slate-300'}`} 
                            />
                            <span className="text-sm text-slate-700">{opt.label}</span>
                          </label>
                        );
                      })}
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
                  {['FILE_UPLOAD', 'IMAGE_UPLOAD', 'VIDEO_UPLOAD', 'AUDIO_UPLOAD'].includes(block.questionType || '') && (
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file" 
                        multiple={(block.settings?.maxFiles || 1) > 1}
                        disabled={Boolean(uploadingFields[block.id])}
                        onChange={async (e) => {
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
                          if (!formId || files.length === 0) return;
                          setUploadingFields(prev => ({ ...prev, [block.id]: true }));
                          try {
                            const presignResponse = await fetch(`${API_BASE_URL}/form-builder/forms/public/${formId}/uploads/presign`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                blockId: block.id,
                                files: files.map(file => ({ name: file.name, contentType: file.type, size: file.size })),
                              }),
                            });
                            const presignPayload = await presignResponse.json();
                            if (!presignResponse.ok) throw new Error(presignPayload?.message || 'Unable to prepare uploads.');
                            const uploads = presignPayload?.data?.uploads || [];
                            await Promise.all(uploads.map((upload: { uploadUrl: string }, index: number) => uploadToS3(upload.uploadUrl, files[index])));
                            handleResponseChange(block.id, uploads.map((upload: { name: string; size: number; contentType: string; fileKey: string }) => ({
                              name: upload.name,
                              size: upload.size,
                              type: upload.contentType,
                              fileKey: upload.fileKey,
                            })));
                            setErrors(prev => ({ ...prev, [block.id]: '' }));
                          } catch (error) {
                            setErrors(prev => ({ ...prev, [block.id]: error instanceof Error ? error.message : 'Upload failed. Please try again.' }));
                            e.target.value = '';
                          } finally {
                            setUploadingFields(prev => ({ ...prev, [block.id]: false }));
                          }
                        }}
                        className={`text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium hover:file:bg-purple-100 cursor-pointer ${errors[block.id] ? 'file:bg-red-50 file:text-red-700' : 'file:bg-purple-50 file:text-purple-700'}`}
                        accept={block.questionType === 'IMAGE_UPLOAD' ? 'image/*' : block.questionType === 'VIDEO_UPLOAD' ? 'video/*' : block.questionType === 'AUDIO_UPLOAD' ? 'audio/*' : block.settings?.allowSpecificFileTypes ? block.settings.allowedFileTypes?.join(',') : '*/*'}
                      />
                      {uploadingFields[block.id] && <p className="text-xs font-medium text-purple-600">Uploading files...</p>}
                      {block.settings?.allowSpecificFileTypes && block.settings.allowedFileTypes?.length && (
                        <p className="text-xs text-slate-500 mt-1">
                          Allowed types: {block.settings.allowedFileTypes.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Choose up to {block.settings?.maxFiles || 1} {block.questionType === 'IMAGE_UPLOAD' ? 'image(s)' : block.questionType === 'VIDEO_UPLOAD' ? 'video(s)' : block.questionType === 'AUDIO_UPLOAD' ? 'audio file(s)' : 'file(s)'} · Max size per file: {block.settings?.maxFileSizeMB || (block.questionType === 'VIDEO_UPLOAD' ? 500 : block.questionType === 'AUDIO_UPLOAD' ? 100 : 10)} MB
                      </p>
                      {Array.isArray(responses[block.id]) && responses[block.id].length > 0 && (
                        <ul className="space-y-1 text-xs text-slate-600">
                          {responses[block.id].map((file: { name: string }, index: number) => <li key={`${file.name}-${index}`}>✓ {file.name}</li>)}
                        </ul>
                      )}
                    </div>
                  )}
                  {block.questionType === 'SIGNATURE' && (
                    <SignaturePad value={responses[block.id]} error={Boolean(errors[block.id])} onChange={(value) => { handleResponseChange(block.id, value); if (errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' })); }}/>
                  )}
                  {['DATE', 'TIME', 'DATE_TIME'].includes(block.questionType || '') && (
                    <input 
                      type={block.questionType === 'DATE' ? 'date' : block.questionType === 'TIME' ? 'time' : 'datetime-local'}
                      className={`w-[200px] p-2 border rounded-md outline-none focus:ring-2 focus:ring-purple-600 text-sm ${errors[block.id] ? 'border-red-500' : 'border-slate-300'}`}
                      value={responses[block.id] || ''}
                      onChange={(e) => {
                        handleResponseChange(block.id, e.target.value);
                        if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                      }}
                    />
                  )}
                  {block.questionType === 'RATING' && (
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            handleResponseChange(block.id, star);
                            if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                          }}
                          className={`w-8 h-8 flex items-center justify-center text-3xl transition-colors ${(responses[block.id] || 0) >= star ? 'text-yellow-400' : 'text-slate-200 hover:text-yellow-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                  {block.questionType === 'LINEAR_SCALE' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600">{block.settings?.scaleMinLabel || 'Low'}</span>
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {Array.from({ length: (block.settings?.scaleMax || 5) - (block.settings?.scaleMin || 1) + 1 }, (_, i) => (block.settings?.scaleMin || 1) + i).map(num => (
                            <label key={num} className="flex flex-col items-center gap-2 cursor-pointer">
                              <span className="text-sm font-medium text-slate-700">{num}</span>
                              <input 
                                type="radio" 
                                name={`scale-${block.id}`}
                                value={num}
                                checked={responses[block.id] === num}
                                onChange={(e) => {
                                  handleResponseChange(block.id, Number(e.target.value));
                                  if(errors[block.id]) setErrors(prev => ({ ...prev, [block.id]: '' }));
                                }}
                                className={`w-4 h-4 text-purple-600 focus:ring-purple-600 ${errors[block.id] ? 'border-red-500' : 'border-slate-300'}`}
                              />
                            </label>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-slate-600">{block.settings?.scaleMaxLabel || 'High'}</span>
                      </div>
                    </div>
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
        </form>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-4">
          <div>
            {history.length > 1 && (
              <button 
                type="button" 
                onClick={handleBack}
                className="px-6 py-2.5 rounded text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div>
            {currentSectionIndex < sections.length - 1 ? (
              <button 
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded text-sm font-medium text-white transition-colors shadow-sm hover:brightness-110"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded text-sm font-bold text-white transition-colors shadow-sm hover:brightness-110 disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
