import React from 'react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import { FormSectionItem } from './FormSectionItem';
import { FormMediaModal } from './FormMediaModal';
import { FormImportModal } from './FormImportModal';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const FormBuilderCanvas: React.FC = () => {
  const { title, description, setTitle, setDescription, sections, theme, moveSection } = useFormBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && typeof active.id === 'string' && typeof over?.id === 'string') {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveSection(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full pb-[100px]">
      {/* Form Header Block (Top Title & Description) */}
      <div 
        className="bg-white p-6 rounded-lg shadow-sm border-t-8"
        style={{ borderTopColor: theme.primaryColor }}
      >
        <input 
          type="text"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full text-3xl font-normal border-b-2 border-transparent focus:outline-none py-2 mb-2 transition-colors"
          style={{ '--focus-border-color': theme.primaryColor } as any}
          onFocus={(e) => e.target.style.borderColor = theme.primaryColor}
          onBlur={(e) => e.target.style.borderColor = 'transparent'}
          placeholder="Form title"
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Form description" 
          className="w-full border-b border-transparent focus:border-slate-300 focus:outline-none py-1 resize-none min-h-[40px] transition-colors"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>

      {/* Sections and Blocks mapping */}
      <DndContext id="dnd-sections" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section, index) => (
            <FormSectionItem 
              key={section.id} 
              section={section} 
              index={index} 
              totalSections={sections.length} 
            />
          ))}
        </SortableContext>
      </DndContext>
      <FormMediaModal />
      <FormImportModal />
    </div>
  );
};
