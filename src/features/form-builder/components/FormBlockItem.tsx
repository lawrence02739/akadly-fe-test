import { Trash2, Copy, MoreVertical, GripHorizontal, Video, UploadCloud } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const QUESTION_TYPE_LABELS: Partial<Record<QuestionType, string>> = {
  SHORT_TEXT: 'Short Answer', LONG_TEXT: 'Long Answer', EMAIL: 'Email Address', PHONE: 'Phone Number',
  URL: 'Website URL', DATE_TIME: 'Date & Time', FILE_UPLOAD: 'File Upload', IMAGE_UPLOAD: 'Image Upload',
  VIDEO_UPLOAD: 'Video Upload', AUDIO_UPLOAD: 'Audio Upload', MULTIPLE_CHOICE: 'Multiple Choice',
  LINEAR_SCALE: 'Linear Scale', GRID_MCQ: 'Multiple Choice Grid', GRID_CHECKBOX: 'Checkbox Grid',
};
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import type { FormBlock, QuestionType } from '../types/form-builder.types';
import { FormOptionsEditor } from './FormOptionsEditor';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  block: FormBlock;
  sectionId: string;
  index?: number;
}

type FormBlockItemProps = Props;

export const FormBlockItem: React.FC<FormBlockItemProps> = ({ block, sectionId }) => {
  const {
    activeBlockId,
    setActiveBlock,
    updateBlock,
    deleteBlock,
    addBlock,
    openMediaModal
  } = useFormBuilderStore();



  const isActive = activeBlockId === block.id;

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    addBlock(sectionId, block.type, block.questionType, block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(sectionId, block.id);
  };



  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };



  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as QuestionType;
    const isChoiceType = ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(newType);

    // Initialize options if switching to a choice type and it has no options
    const previousDefault = block.questionType
      ? QUESTION_TYPE_LABELS[block.questionType] || block.questionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
      : '';
    const nextDefault = QUESTION_TYPE_LABELS[newType] || newType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
    const updates: Partial<FormBlock> = {
      questionType: newType,
      ...(!block.title.trim() || block.title === previousDefault ? { title: nextDefault } : {}),
    };
    if (isChoiceType && (!block.options || block.options.length === 0)) {
      updates.options = [{ id: uuidv4(), label: 'Option 1' }];
    }
    updateBlock(sectionId, block.id, updates);
  };

  const widthMap: Record<string, string> = {
    full: 'col-span-12',
    half: 'col-span-6',
    third: 'col-span-4',
    quarter: 'col-span-3',
  };
  const blockWidth = block.width || 'full';
  const widthClass = widthMap[blockWidth];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${widthClass} bg-white rounded-lg p-6 shadow-sm border transition-all relative group ${isActive ? 'border-purple-600 ring-1 ring-purple-600' : 'border-slate-200 hover:border-purple-300'
        } ${block.isHidden ? 'opacity-60 bg-slate-50/50' : ''}`}
      onClick={(e) => { e.stopPropagation(); setActiveBlock(block.id, sectionId); }}
    >
      {block.isHidden && (
        <div className="absolute top-2 right-2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider z-10">
          Hidden
        </div>
      )}
      {/* Drag Handle Top Center (visible on hover) */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}
      >
        <GripHorizontal className="w-5 h-5" />
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {isActive ? (
          <div className="flex gap-4 items-start">
            <input
              type="text"
              value={block.title}
              onChange={(e) => updateBlock(sectionId, block.id, { title: e.target.value })}
              placeholder={block.type === 'IMAGE' ? "Image title" : block.type === 'VIDEO' ? "Video title" : block.type === 'TITLE_DESCRIPTION' ? "Heading text" : "Enter question text"}
              className="flex-1 bg-slate-50 p-4 border-b-2 border-slate-300 focus:border-purple-600 focus:bg-slate-100 focus:outline-none text-lg transition-colors"
            />
            {block.type === 'QUESTION' && (
              <select
                value={block.questionType}
                onChange={handleTypeChange}
                className="w-[250px] p-3 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm font-medium"
              >
                <option value="SHORT_TEXT">Short answer</option>
                <option value="LONG_TEXT">Paragraph</option>
                <option disabled>──────</option>
                <option value="MULTIPLE_CHOICE">Multiple choice</option>
                <option value="CHECKBOXES">Checkboxes</option>
                <option value="DROPDOWN">Dropdown</option>
                <option disabled>──────</option>
                <option value="FILE_UPLOAD">File upload</option>
                <option value="IMAGE_UPLOAD">Image upload</option>
                <option value="VIDEO_UPLOAD">Video upload</option>
                <option value="AUDIO_UPLOAD">Audio upload</option>
                <option disabled>──────</option>
                <option value="LINEAR_SCALE">Linear scale</option>
                <option value="RATING">Rating</option>
                <option value="GRID_MCQ">Multiple choice grid</option>
                <option value="GRID_CHECKBOX">Checkbox grid</option>
                <option disabled>──────</option>
                <option value="DATE">Date</option>
                <option value="TIME">Time</option>
                <option value="DATE_TIME">Date & Time</option>
                <option disabled>──────</option>
                <option value="SIGNATURE">Signature</option>
              </select>
            )}
          </div>
        ) : (
          <div className={`flex flex-col ${block.labelAlignment === 'RIGHT' ? 'items-end' : block.labelAlignment === 'LEFT' ? 'items-start' : ''}`}>
            <span className="text-[15px] font-semibold text-slate-800 flex items-center gap-1">
              {block.title || <span className="italic text-slate-400">Click to add question text</span>}
              {block.validation?.required && <span className="text-red-500">*</span>}
            </span>
          </div>
        )}

        {/* Placeholder for question options/input area */}
        <div className={`py-2 flex ${block.labelAlignment === 'LEFT' || block.labelAlignment === 'RIGHT' ? 'flex-row gap-4 items-start w-full' : 'flex-col w-full'}`}>
          {/* We only apply horizontal flex layout in preview realistically, but we can fake it here too if needed. For builder simplicity, we keep it mostly vertical, but let's implement true layout mapping. */}
          {block.type === 'TITLE_DESCRIPTION' ? (
            <input
              type="text"
              value={block.description || ''}
              onChange={(e) => updateBlock(sectionId, block.id, { description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full border-b border-slate-300 bg-transparent outline-none pb-1 text-slate-500 text-sm mt-2 focus:border-purple-600 focus:border-b-2 transition-colors"
              disabled={!isActive}
            />
          ) : block.type === 'IMAGE' ? (
            <div className="flex flex-col gap-2 mt-2">
              {block.mediaUrl ? (
                <img src={block.mediaUrl} alt={block.title} className="max-w-full rounded-md max-h-[400px] object-contain border border-slate-200" />
              ) : (
                <div
                  onClick={() => openMediaModal('IMAGE', block.id, sectionId)}
                  className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <span className="text-sm font-medium">Click to upload image</span>
                </div>
              )}
            </div>
          ) : block.type === 'VIDEO' ? (
            <div className="flex flex-col gap-2 mt-2">
              {block.mediaUrl ? (
                <iframe src={block.mediaUrl.replace('watch?v=', 'embed/')} title={block.title} className="w-full max-w-2xl aspect-video rounded-md border border-slate-200" allowFullScreen />
              ) : (
                <div
                  onClick={() => openMediaModal('VIDEO', block.id, sectionId)}
                  className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 gap-2 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <Video className="w-8 h-8 text-slate-400" />
                  <span className="text-sm font-medium">Click to embed video</span>
                </div>
              )}
            </div>
          ) : ['SHORT_TEXT', 'LONG_TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'URL'].includes(block.questionType || '') ? (
            <input
              type="text"
              className="w-[60%] border-b border-slate-300 border-dashed bg-transparent outline-none pb-1 text-slate-500"
              placeholder={`${block.questionType?.toLowerCase().replace('_', ' ')} answer text`}
              disabled
            />
          ) : ['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(block.questionType || '') ? (
            isActive ? (
              <FormOptionsEditor
                sectionId={sectionId}
                blockId={block.id}
                options={block.options || []}
                questionType={block.questionType!}
              />
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {block.options?.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-3 text-slate-600">
                    {block.questionType === 'MULTIPLE_CHOICE' ? (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    ) : block.questionType === 'CHECKBOXES' ? (
                      <div className="w-4 h-4 rounded-sm border-2 border-slate-300" />
                    ) : (
                      <span className="w-4 text-sm">{i + 1}.</span>
                    )}
                    <span className="text-sm">{opt.label}</span>
                  </div>
                ))}
              </div>
            )
          ) : block.questionType === 'LINEAR_SCALE' ? (
            <div className="flex items-center gap-8 justify-center text-slate-500 py-4">
              <span className="text-sm">1</span>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} className="flex flex-col items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  </div>
                ))}
              </div>
              <span className="text-sm">5</span>
            </div>
          ) : block.questionType === 'RATING' ? (
            <div className="flex items-center gap-2 text-slate-300 py-2">
              {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          ) : ['FILE_UPLOAD', 'IMAGE_UPLOAD', 'VIDEO_UPLOAD', 'AUDIO_UPLOAD'].includes(block.questionType || '') ? (
            <div className="flex flex-col gap-4 py-2">
              {isActive ? (
                <div className="flex flex-col gap-4 p-4 border border-slate-200 rounded-md bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Allow only specific file types</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={block.settings?.allowSpecificFileTypes || false}
                        onChange={(e) => updateBlock(sectionId, block.id, {
                          settings: { ...block.settings, allowSpecificFileTypes: e.target.checked }
                        })}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {block.settings?.allowSpecificFileTypes && (
                    <div className="grid grid-cols-2 gap-3 pl-2">
                      {(block.questionType === 'IMAGE_UPLOAD' ? ['Image'] : block.questionType === 'VIDEO_UPLOAD' ? ['Video'] : block.questionType === 'AUDIO_UPLOAD' ? ['Audio'] : ['Document', 'Presentation', 'Spreadsheet', 'Drawing', 'PDF', 'Image', 'Video', 'Audio']).map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-purple-600 rounded border-slate-300"
                            checked={block.settings?.allowedFileTypes?.includes(type) || false}
                            onChange={(e) => {
                              const current = block.settings?.allowedFileTypes || [];
                              const updated = e.target.checked
                                ? [...current, type]
                                : current.filter(t => t !== type);
                              updateBlock(sectionId, block.id, {
                                settings: { ...block.settings, allowedFileTypes: updated }
                              });
                            }}
                          />
                          <span className="text-sm text-slate-600">{type}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-slate-700">Maximum number of files</span>
                    <select
                      className="p-1.5 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-purple-600 w-24"
                      value={block.settings?.maxFiles || 1}
                      onChange={(e) => updateBlock(sectionId, block.id, {
                        settings: { ...block.settings, maxFiles: Number(e.target.value) }
                      })}
                    >
                      {Array.from({ length: 10 }, (_, index) => index + 1).map(count => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Maximum file size</span>
                    <select
                      className="p-1.5 border border-slate-300 rounded text-sm outline-none focus:ring-1 focus:ring-purple-600 w-24"
                      value={block.settings?.maxFileSizeMB || (block.questionType === 'VIDEO_UPLOAD' ? 500 : block.questionType === 'AUDIO_UPLOAD' ? 100 : 10)}
                      onChange={(e) => updateBlock(sectionId, block.id, {
                        settings: { ...block.settings, maxFileSizeMB: Number(e.target.value) }
                      })}
                    >
                      <option value={1}>1 MB</option>
                      <option value={10}>10 MB</option>
                      <option value={100}>100 MB</option>
                      <option value={500}>500 MB</option>
                      <option value={1024}>1 GB</option>
                      <option value={10240}>10 GB</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 border-dashed rounded bg-slate-50 px-4 py-8 flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <span className="text-sm font-medium">Choose {block.questionType === 'IMAGE_UPLOAD' ? 'image' : block.questionType === 'VIDEO_UPLOAD' ? 'video' : block.questionType === 'AUDIO_UPLOAD' ? 'audio' : 'file'}</span>
                  {block.settings?.allowSpecificFileTypes && block.settings.allowedFileTypes?.length && (
                    <span className="text-xs text-slate-400">Allows: {block.settings.allowedFileTypes.join(', ')}</span>
                  )}
                </div>
              )}
            </div>
          ) : block.questionType === 'GRID_MCQ' || block.questionType === 'GRID_CHECKBOX' ? (
            <div className="flex flex-col gap-2 text-slate-500 py-2">
              <span className="text-sm italic">Grid rows and columns editor</span>
            </div>
          ) : ['DATE', 'TIME', 'DATE_TIME'].includes(block.questionType || '') ? (
            <div className="py-2">
              <input
                type={block.questionType === 'DATE' ? 'date' : block.questionType === 'TIME' ? 'time' : 'datetime-local'}
                className="w-[200px] border-b border-slate-300 border-dashed bg-transparent outline-none pb-1 text-slate-400 cursor-not-allowed"
                disabled
              />
            </div>
          ) : block.questionType === 'SIGNATURE' ? (
            <div className="py-2">
              <div className="w-[300px] h-[100px] border-b-2 border-slate-300 border-dashed flex items-end justify-center pb-2 text-slate-400">
                Sign here
              </div>
            </div>
          ) : (
            <span className="italic text-slate-400 text-sm">Preview for {block.questionType} will be implemented</span>
          )}
        </div>

        {/* Sub-label Rendering */}
        {block.subLabel && (
          <div className={`text-xs text-slate-500 font-medium ${block.labelAlignment === 'LEFT' || block.labelAlignment === 'RIGHT' ? 'ml-auto mt-1' : 'mt-1'}`}>
            {block.subLabel}
          </div>
        )}

        {isActive && (
          <>
            <hr className="my-2 border-slate-200" />
            <div className="flex justify-end items-center gap-4">
              <button onClick={handleDuplicate} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Duplicate">
                <Copy className="w-5 h-5" />
              </button>
              <button onClick={handleDelete} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Delete">
                <Trash2 className="w-5 h-5" />
              </button>

              <div className="h-8 border-l border-slate-300"></div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm font-medium text-slate-700">Required</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={block.validation?.required || false}
                    onChange={(e) => updateBlock(sectionId, block.id, {
                      validation: { ...block.validation, required: e.target.checked }
                    })}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
              </label>

              <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="More options">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
        {/* Bottom Toolbar (Only visible when active) */}
        {isActive && (
          <div className="flex justify-end items-center gap-2 pt-4 border-t border-slate-100 mt-2">
            <button onClick={handleDuplicate} className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100" title="Duplicate">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}



      </div>
    </div>
  );
};
