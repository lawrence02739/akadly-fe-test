import React, { useState } from 'react';
import {
  Plus,
  GripVertical,
  Search,
  Filter,
  ArrowUpDown,
  CheckSquare,
  FileText,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TestQuestionRef } from '../types';

interface SortableQuestionItemProps {
  question: TestQuestionRef;
  isSelected: boolean;
  onSelect: () => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  isSelected,
  onSelect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'SINGLE':
        return 'MCQ';
      case 'MULTIPLE':
        return 'Multi';
      case 'TRUE_FALSE':
        return 'T/F';
      case 'FILL_BLANK':
        return 'Blank';
      case 'NUMERIC':
      case 'INTEGER':
        return 'Num';
      case 'SHORT_ANSWER':
      case 'SUBJECTIVE':
        return 'Essay';
      default:
        return type || 'MCQ';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-teal-50/20 border-[#005963] ring-1 ring-[#005963] shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-400 hover:text-slate-700 cursor-grab active:cursor-grabbing p-0.5 mt-0.5 rounded transition-colors"
      >
        <GripVertical size={16} />
      </button>

      {/* Main card content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-bold text-[#005963]">
            Q{question.sequence}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {getTypeBadge(question.type)}
          </span>
        </div>
        <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-normal">
          {question.text || 'Untitled Question'}
        </p>
      </div>
    </div>
  );
};

interface QuestionListPanelProps {
  questions: TestQuestionRef[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onAddQuestion: (type: string) => void;
  onOpenImport: () => void;
  onReorder: (newOrderedIds: string[]) => void;
  totalMarks: number;
}

export const QuestionListPanel: React.FC<QuestionListPanelProps> = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onOpenImport,
  onReorder,
  totalMarks,
}) => {
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState('SINGLE');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(questions, oldIndex, newIndex);
      onReorder(newItems.map((q) => q.id));
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      !search.trim() ||
      (q.text || '').toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === 'ALL' || q.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[750px] overflow-hidden">
      {/* Top Header Controls matching Figma */}
      <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
        {/* Type selector dropdown */}
        <div>
          <select
            value={selectedTypeToAdd}
            onChange={(e) => {
              setSelectedTypeToAdd(e.target.value);
              setFilterType(e.target.value === 'SINGLE' ? 'ALL' : e.target.value);
            }}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#005963]"
          >
            <option value="SINGLE">Single Correct</option>
            <option value="MULTIPLE">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_BLANK">Fill in the Blank</option>
            <option value="SUBJECTIVE">Essay / Subjective</option>
            <option value="NUMERIC">Numerical Answer</option>
          </select>
        </div>

        {/* Search & Action icon bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#005963] outline-none"
            />
          </div>

          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Filter questions"
          >
            <Filter size={14} />
          </button>
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Sort questions"
          >
            <ArrowUpDown size={14} />
          </button>
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50"
            title="Select multiple"
          >
            <CheckSquare size={14} />
          </button>
        </div>

        {/* Add Question Button or empty state button row */}
        {questions.length === 0 ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAddQuestion(selectedTypeToAdd)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#005963] hover:bg-[#004a52] rounded-lg shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Add Question</span>
            </button>
            <button
              type="button"
              onClick={onOpenImport}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#005963] bg-white hover:bg-teal-50/40 border border-[#005963] rounded-lg transition-colors"
            >
              <Plus size={14} />
              <span>Import</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAddQuestion(selectedTypeToAdd)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#005963] hover:bg-[#004a52] rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Question</span>
          </button>
        )}
      </div>

      {/* Question List area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {questions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
            <FileText size={44} strokeWidth={1.2} className="text-slate-300 mb-3" />
            <p className="text-xs font-medium text-slate-500">No questions added yet.</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No matching questions found.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredQuestions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredQuestions.map((q) => (
                <SortableQuestionItem
                  key={q.id}
                  question={q}
                  isSelected={q.id === selectedQuestionId}
                  onSelect={() => onSelectQuestion(q.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Footer stats if questions exist */}
      {questions.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>{questions.length} questions • {totalMarks} total marks</span>
          <button
            type="button"
            onClick={onOpenImport}
            className="text-xs font-semibold text-[#005963] hover:underline"
          >
            + Import from Bank
          </button>
        </div>
      )}
    </div>
  );
};
