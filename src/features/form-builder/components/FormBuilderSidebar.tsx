import React from 'react';
import { PlusCircle, Type, Image as ImageIcon, Video, Copy, FileDown } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

export const FormBuilderSidebar: React.FC = () => {
  const { addBlock, addSection, activeSectionId, activeBlockId, sections, openImportModal } = useFormBuilderStore();

  const handleAddQuestion = () => {
    const targetSectionId = activeSectionId || sections[0].id;
    addBlock(targetSectionId, 'QUESTION', 'MULTIPLE_CHOICE', activeBlockId || undefined);
  };

  const handleAddTitle = () => {
    const targetSectionId = activeSectionId || sections[0].id;
    addBlock(targetSectionId, 'TITLE_DESCRIPTION', undefined, activeBlockId || undefined);
  };

  const handleAddSection = () => {
    addSection(activeSectionId || undefined);
  };

  const handleAddImage = () => {
    const targetSectionId = activeSectionId || sections[0].id;
    addBlock(targetSectionId, 'IMAGE', undefined, activeBlockId || undefined);
  };

  const handleAddVideo = () => {
    const targetSectionId = activeSectionId || sections[0].id;
    addBlock(targetSectionId, 'VIDEO', undefined, activeBlockId || undefined);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-2 border border-slate-200 flex flex-col gap-3">
      <button 
        onClick={handleAddQuestion}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
        title="Add question"
      >
        <PlusCircle className="w-5 h-5" />
      </button>
      
      <button 
        onClick={handleAddTitle}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
        title="Add title and description"
      >
        <Type className="w-5 h-5" />
      </button>

      <button 
        onClick={openImportModal}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
        title="Import questions"
      >
        <FileDown className="w-5 h-5" />
      </button>
      
      <button 
        onClick={handleAddImage}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
        title="Add image"
      >
        <ImageIcon className="w-5 h-5" />
      </button>

      <button 
        onClick={handleAddVideo}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
        title="Add video"
      >
        <Video className="w-5 h-5" />
      </button>

      <button 
        onClick={handleAddSection}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
        title="Add section"
      >
        <Copy className="w-5 h-5 rotate-90" />
      </button>
    </div>
  );
};
