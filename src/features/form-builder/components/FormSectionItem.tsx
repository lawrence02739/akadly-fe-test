import React from 'react';
import { Trash2, GripHorizontal } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import type { FormSection } from '../types/form-builder.types';
import { FormBlockItem } from './FormBlockItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  section: FormSection;
  index: number;
  totalSections: number;
}

export const FormSectionItem: React.FC<Props> = ({ section, index, totalSections }) => {
  const { updateSection, deleteSection, activeSectionId, setActiveBlock, moveBlock } = useFormBuilderStore();
  
  const isActive = activeSectionId === section.id;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = section.blocks.findIndex((b) => b.id === active.id);
      const newIndex = section.blocks.findIndex((b) => b.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(section.id, oldIndex, newIndex);
      }
    }
  };

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/section">
      {totalSections > 1 && (
        <div 
          className={`bg-white p-4 mb-2 rounded-md shadow-sm border-l-4 cursor-pointer transition-colors relative ${isActive ? 'border-purple-600' : 'border-transparent'}`}
          onClick={() => setActiveBlock('', section.id)}
        >
          {/* Section Drag Handle (Top Center, visible on hover) */}
          <div 
            {...attributes} 
            {...listeners}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 opacity-0 transition-opacity ${isActive ? 'opacity-100' : 'group-hover/section:opacity-100'}`}
          >
            <GripHorizontal className="w-5 h-5" />
          </div>

          <div className="flex justify-between items-center mb-2 mt-2">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              Section {index + 1} of {totalSections}
            </span>
            {isActive && totalSections > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <input 
            type="text"
            value={section.title} 
            onChange={(e) => updateSection(section.id, { title: e.target.value })} 
            className="text-xl w-full border-b-2 border-transparent focus:border-purple-600 focus:outline-none py-2 transition-colors"
          />
          {isActive && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input 
                  type="checkbox" 
                  checked={section.isRepeatable || false}
                  onChange={(e) => updateSection(section.id, { isRepeatable: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300"
                />
                Make this section repeatable (e.g. "Add another member")
              </label>
            </div>
          )}
        </div>
      )}

      {/* Render Blocks in this section - grid layout */}
      <div className="grid grid-cols-12 gap-4 w-full items-start">
        <DndContext id={`dnd-blocks-${section.id}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={section.blocks.map(b => b.id)} strategy={rectSortingStrategy}>
            {section.blocks.map((block) => (
              <FormBlockItem key={block.id} block={block} sectionId={section.id} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
