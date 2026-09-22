import React from 'react';
import { Type, CheckSquare, Image as ImageIcon, Video, Calendar, Clock, AlignLeft, List, GripHorizontal, MinusSquare, CalendarDays, Star, PenTool, Hash, Link as LinkIcon, Mail, Phone, FileUp, Music } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import type { QuestionType, BlockType } from '../types/form-builder.types';

type ElementCategory = 'Basic' | 'Advanced' | 'Layout';

interface FormElementDef {
  id: string;
  label: string;
  icon: React.ElementType;
  category: ElementCategory;
  blockType: BlockType;
  questionType?: QuestionType;
}

const ELEMENTS: FormElementDef[] = [
  // Basic
  { id: 'short_text', label: 'Short Text', icon: Type, category: 'Basic', blockType: 'QUESTION', questionType: 'SHORT_TEXT' },
  { id: 'long_text', label: 'Long Text', icon: AlignLeft, category: 'Basic', blockType: 'QUESTION', questionType: 'LONG_TEXT' },
  { id: 'email', label: 'Email', icon: Mail, category: 'Basic', blockType: 'QUESTION', questionType: 'EMAIL' },
  { id: 'phone', label: 'Phone', icon: Phone, category: 'Basic', blockType: 'QUESTION', questionType: 'PHONE' },
  { id: 'number', label: 'Number', icon: Hash, category: 'Basic', blockType: 'QUESTION', questionType: 'NUMBER' },
  { id: 'url', label: 'Website URL', icon: LinkIcon, category: 'Basic', blockType: 'QUESTION', questionType: 'URL' },
  { id: 'date', label: 'Date Picker', icon: Calendar, category: 'Basic', blockType: 'QUESTION', questionType: 'DATE' },
  { id: 'time', label: 'Time', icon: Clock, category: 'Basic', blockType: 'QUESTION', questionType: 'TIME' },
  { id: 'datetime', label: 'Date & Time', icon: CalendarDays, category: 'Basic', blockType: 'QUESTION', questionType: 'DATE_TIME' },

  // Advanced (Selection & Special)
  { id: 'single_choice', label: 'Single Choice', icon: CheckSquare, category: 'Advanced', blockType: 'QUESTION', questionType: 'MULTIPLE_CHOICE' },
  { id: 'multiple_choice', label: 'Multiple Choice', icon: List, category: 'Advanced', blockType: 'QUESTION', questionType: 'CHECKBOXES' },
  { id: 'dropdown', label: 'Dropdown', icon: MinusSquare, category: 'Advanced', blockType: 'QUESTION', questionType: 'DROPDOWN' },
  { id: 'rating', label: 'Star Rating', icon: Star, category: 'Advanced', blockType: 'QUESTION', questionType: 'RATING' },
  { id: 'scale', label: 'Scale', icon: GripHorizontal, category: 'Advanced', blockType: 'QUESTION', questionType: 'LINEAR_SCALE' },
  { id: 'signature', label: 'Signature', icon: PenTool, category: 'Advanced', blockType: 'QUESTION', questionType: 'SIGNATURE' },
  { id: 'file_upload', label: 'File Upload', icon: FileUp, category: 'Advanced', blockType: 'QUESTION', questionType: 'FILE_UPLOAD' },
  { id: 'image_upload', label: 'Image Upload', icon: ImageIcon, category: 'Advanced', blockType: 'QUESTION', questionType: 'IMAGE_UPLOAD' },
  { id: 'video_upload', label: 'Video Upload', icon: Video, category: 'Advanced', blockType: 'QUESTION', questionType: 'VIDEO_UPLOAD' },
  { id: 'audio_upload', label: 'Audio Upload', icon: Music, category: 'Advanced', blockType: 'QUESTION', questionType: 'AUDIO_UPLOAD' },

  // Layout
  { id: 'header', label: 'Heading', icon: Type, category: 'Layout', blockType: 'TITLE_DESCRIPTION' },

];

export const FormElementsPanel: React.FC = () => {
  const { addBlock, activeSectionId, activeBlockId, sections } = useFormBuilderStore();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleAddElement = (element: FormElementDef) => {
    const targetSectionId = activeSectionId || sections[0].id;
    addBlock(targetSectionId, element.blockType, element.questionType, activeBlockId || undefined);
  };

  const filteredElements = ELEMENTS.filter(el => el.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const categories: ElementCategory[] = ['Basic', 'Advanced', 'Layout'];

  return (
    <div className="w-[300px] h-full bg-white text-slate-800 border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 bg-white border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Add Elements</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700 focus:outline-none focus:border-purple-600 focus:bg-white placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {categories.map(category => {
          const categoryElements = filteredElements.filter(el => el.category === category);
          if (categoryElements.length === 0) return null;

          return (
            <div key={category} className="mb-2">
              <h3 className="px-4 py-2 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase tracking-wider">{category}</h3>
              <div className="flex flex-col">
                {categoryElements.map(el => (
                  <button
                    key={el.id}
                    onClick={() => handleAddElement(el)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 transition-colors border-l-4 border-transparent hover:border-purple-600 w-full text-left"
                  >
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center shrink-0">
                      <el.icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-[13px] font-medium">{el.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filteredElements.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-400">
            No fields found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};
