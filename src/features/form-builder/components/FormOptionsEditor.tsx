import { GripVertical, X, Circle, Square } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import type { FormOption, QuestionType } from '../types/form-builder.types';

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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormOptionsEditorProps {
  sectionId: string;
  blockId: string;
  options: FormOption[];
  questionType: QuestionType;
}

interface SortableOptionProps {
  option: FormOption;
  index: number;
  sectionId: string;
  blockId: string;
  questionType: QuestionType;
  totalOptions: number;
  logicEnabled?: boolean;
}

const SortableOptionItem = ({
  option,
  index,
  sectionId,
  blockId,
  questionType,
  totalOptions,
  logicEnabled,
}: SortableOptionProps) => {
  const { updateOption, removeOption } = useFormBuilderStore();
  const sections = useFormBuilderStore((state) => state.sections);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 group relative bg-white py-1">
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 -ml-1">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Icon (Radio or Checkbox) */}
      <div className="text-slate-300">
        {questionType === 'MULTIPLE_CHOICE' ? (
          <Circle className="w-5 h-5" />
        ) : questionType === 'CHECKBOXES' ? (
          <Square className="w-5 h-5" />
        ) : (
          <span className="w-5 text-sm font-medium">{index + 1}.</span>
        )}
      </div>

      {/* Input Field */}
      {option.isOther ? (
        <span className="flex-1 text-sm border-b border-transparent py-1 text-slate-500 italic">
          Other...
        </span>
      ) : (
        <input
          type="text"
          value={option.label}
          onChange={(e) => updateOption(sectionId, blockId, option.id, e.target.value)}
          className="flex-1 text-sm border-b border-transparent hover:border-slate-300 focus:border-purple-600 focus:outline-none py-1 transition-colors"
          placeholder={`Option ${index + 1}`}
        />
      )}

      {/* Target Section (Logic Branching) */}
      {logicEnabled && (
        <select
          value={option.goToSectionId || ''}
          onChange={(e) => {
            // updateOption logic doesn't currently support goToSectionId. 
            // We should use a specialized updateOption handler or pass it through.
            // But wait, the standard updateOption in store only takes `label`.
            // Let's modify store's updateOption to take `updates: Partial<FormOption>`
            // For now, let's just trigger a store action we'll build next.
            useFormBuilderStore.getState().updateOptionProps(sectionId, blockId, option.id, { goToSectionId: e.target.value });
          }}
          className="ml-2 w-40 text-xs border border-slate-200 rounded p-1 bg-slate-50 text-slate-600 focus:outline-none focus:border-purple-500"
        >
          <option value="">Continue to next section</option>
          <option value="SUBMIT">Submit form</option>
          {sections.map((s, idx) => (
            <option key={s.id} value={s.id}>
              Go to section {idx + 1} ({s.title || 'Untitled'})
            </option>
          ))}
        </select>
      )}

      {/* Remove Button */}
      {totalOptions > 1 && (
        <button
          onClick={() => removeOption(sectionId, blockId, option.id)}
          className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export const FormOptionsEditor: React.FC<FormOptionsEditorProps> = ({
  sectionId,
  blockId,
  options,
  questionType,
}) => {
  const { addOption, reorderOption } = useFormBuilderStore();
  const block = useFormBuilderStore((state) => {
    const s = state.sections.find((sec) => sec.id === sectionId);
    return s?.blocks.find((b) => b.id === blockId);
  });
  const logicEnabled = block?.settings?.logicEnabled;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = options.findIndex((opt) => opt.id === active.id);
      const newIndex = options.findIndex((opt) => opt.id === over?.id);
      reorderOption(sectionId, blockId, oldIndex, newIndex);
    }
  };

  const handleAddOther = () => {
    // We add an option but flag it as `isOther: true`
    // Wait, the store doesn't have an explicit addOther action.
    // I can just call addOption, and then update it to be 'Other'.
    // Or I can add a specific action. Let's just do it directly using a custom store action or we update store later.
    // Let's create an option locally and dispatch a generic update block. No, the addOption action in store just creates a generic option.
    // Let's modify `useFormBuilderStore` to accept an `isOther` flag in `addOption`. For now, I'll update store later and pass it.
    addOption(sectionId, blockId, true);
  };

  const hasOther = options.some(o => o.isOther);

  return (
    <div className="flex flex-col gap-2 mt-4 ml-1">
      <DndContext id={`dnd-options-${blockId}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={options.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {options.map((option, index) => (
            <SortableOptionItem
              key={option.id}
              option={option}
              index={index}
              sectionId={sectionId}
              blockId={blockId}
              questionType={questionType}
              totalOptions={options.length}
              logicEnabled={logicEnabled}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add new option button */}
      <div className="flex items-center gap-3 mt-2 ml-7">
        <div className="text-slate-300">
          {questionType === 'MULTIPLE_CHOICE' ? (
            <Circle className="w-5 h-5" />
          ) : questionType === 'CHECKBOXES' ? (
            <Square className="w-5 h-5" />
          ) : (
            <span className="w-5 text-sm font-medium">{options.length + 1}.</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => addOption(sectionId, blockId)}
            className="text-slate-500 hover:text-slate-800 hover:border-b hover:border-slate-300 transition-all focus:outline-none"
          >
            Add option
          </button>
          {!hasOther && ['MULTIPLE_CHOICE', 'CHECKBOXES'].includes(questionType) && (
            <>
              <span className="text-slate-400 mx-1">or</span>
              <button
                onClick={handleAddOther}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 rounded transition-colors focus:outline-none"
              >
                add "Other"
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
