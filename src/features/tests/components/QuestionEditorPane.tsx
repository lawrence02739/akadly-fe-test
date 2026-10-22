import React, { useState, useEffect } from 'react';
import {
  Save,
  Trash2,
  Plus,
  Paperclip,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';
import type { TestQuestionRef } from '../types';

interface QuestionEditorPaneProps {
  question: TestQuestionRef | null;
  onUpdatePlacement: (marks: number, negativeMarks: number) => Promise<void>;
  onSaveContent: (
    contentUpdates: Record<string, any>,
    scope: 'THIS_TEST' | 'EVERYWHERE',
  ) => Promise<void>;
  onDeleteQuestion: (deleteFromBank: boolean) => Promise<void>;
  isSaving?: boolean;
}

export const QuestionEditorPane: React.FC<QuestionEditorPaneProps> = ({
  question,
  onUpdatePlacement,
  onSaveContent,
  onDeleteQuestion,
  isSaving = false,
}) => {
  if (!question) {
    return null;
  }

  // Placement state
  const [marks, setMarks] = useState<number>(question.marks || 1);
  const [negativeMarks, setNegativeMarks] = useState<number>(
    question.negativeMarks || 0,
  );
  const [difficulty, setDifficulty] = useState<string>(
    (question as any).difficulty || 'Medium',
  );
  const [placementDirty, setPlacementDirty] = useState(false);

  // Content state
  const [text, setText] = useState<string>(question.text || '');
  const [topicTag, setTopicTag] = useState<string>(
    (question as any).topic || "3' → 5' exonuclease activity logic",
  );
  const [tags, setTags] = useState<string[]>(
    (question as any).tags || ['Biology', 'Genetics'],
  );
  const [options, setOptions] = useState<{ text: string; correct: boolean }[]>(
    question.options || [
      { text: 'Synthesizing RNA primers on the lagging strand', correct: false },
      { text: "Adding nucleotides to the 3' end of the growing DNA strand", correct: true },
      { text: 'Unwinding the double helix structure', correct: false },
      { text: 'Ligating Okazaki fragments together', correct: false },
    ],
  );
  const [contentDirty, setContentDirty] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteFromBank, setDeleteFromBank] = useState(false);

  useEffect(() => {
    setMarks(question.marks || 1);
    setNegativeMarks(question.negativeMarks || 0);
    setDifficulty((question as any).difficulty || 'Medium');
    setPlacementDirty(false);

    setText(question.text || '');
    setTopicTag((question as any).topic || "3' → 5' exonuclease activity logic");
    setTags((question as any).tags?.length ? (question as any).tags : ['Biology', 'Genetics']);
    setOptions(
      question.options?.length
        ? question.options
        : [
            { text: 'Option A', correct: true },
            { text: 'Option B', correct: false },
          ],
    );
    setContentDirty(false);
  }, [question.id]);

  const handleSavePlacement = async () => {
    if (marks <= 0) return;
    await onUpdatePlacement(marks, negativeMarks);
    setPlacementDirty(false);
  };

  const handleSaveContent = async () => {
    await onSaveContent(
      {
        text,
        options,
        tags,
        topic: topicTag,
        difficulty,
      },
      'THIS_TEST',
    );
    setContentDirty(false);
  };

  const handleAddOption = () => {
    setOptions([
      ...options,
      { text: `Option ${String.fromCharCode(65 + options.length)}`, correct: false },
    ]);
    setContentDirty(true);
  };

  const handleOptionTextChange = (idx: number, val: string) => {
    const next = [...options];
    next[idx] = { ...next[idx], text: val };
    setOptions(next);
    setContentDirty(true);
  };

  const handleOptionCorrectToggle = (idx: number) => {
    const isSingle = question.type === 'SINGLE' || !question.type;
    const next = options.map((opt, i) => {
      if (isSingle) {
        return { ...opt, correct: i === idx };
      }
      return i === idx ? { ...opt, correct: !opt.correct } : opt;
    });
    setOptions(next);
    setContentDirty(true);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
    setContentDirty(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs h-[750px] flex flex-col overflow-hidden">
      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {(question as any).courseLink?.courseTitle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
            <BookOpen size={14} className="text-indigo-600 shrink-0" />
            <span className="font-semibold">Linked Course:</span>
            <span className="truncate">
              {(question as any).courseLink.courseTitle}
              {(question as any).courseLink.nodeTitle ? ` › ${(question as any).courseLink.nodeTitle}` : ''}
            </span>
          </div>
        )}

        {/* Question Text */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">
            Question Text
          </label>
          <div className="border border-slate-300 rounded-xl p-3.5 focus-within:ring-2 focus-within:ring-teal-200 focus-within:border-[#005963] transition-all bg-white">
            <textarea
              rows={3}
              placeholder="Enter question text here..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setContentDirty(true);
              }}
              className="w-full text-sm text-slate-900 border-none outline-none resize-none placeholder:text-slate-400"
            />
            {topicTag && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {topicTag}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-800">
            Answer Options
          </label>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  opt.correct
                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-1 ring-emerald-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Radio / Check button */}
                <button
                  type="button"
                  onClick={() => handleOptionCorrectToggle(idx)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    opt.correct
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 text-transparent hover:border-slate-400'
                  }`}
                  title="Mark as correct option"
                >
                  <CheckCircle2 size={14} className={opt.correct ? 'block' : 'hidden'} />
                </button>

                {/* Option Label */}
                <span
                  className={`text-xs font-bold shrink-0 ${
                    opt.correct ? 'text-emerald-900' : 'text-slate-800'
                  }`}
                >
                  Option {String.fromCharCode(65 + idx)}:
                </span>

                {/* Option Text Input */}
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                  className={`flex-1 text-xs outline-none bg-transparent ${
                    opt.correct
                      ? 'text-emerald-950 font-medium'
                      : 'text-slate-800 font-normal'
                  }`}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                />

                {/* Delete cross button */}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-[#005963] pt-1"
          >
            <Plus size={14} />
            <span>Add Choice Option</span>
          </button>
        </div>

        {/* Metadata row: Points Value | Difficulty | Negative Marking | Tags */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Points Value */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Points Value
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={marks}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setMarks(val);
                setPlacementDirty(true);
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-lg border border-slate-300 focus:ring-1 focus:ring-[#005963] outline-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setContentDirty(true);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-[#005963] outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Negative Marking */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Negative Marking
            </label>
            <select
              value={negativeMarks}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setNegativeMarks(val);
                setPlacementDirty(true);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-900 rounded-lg border border-slate-300 bg-white focus:ring-1 focus:ring-[#005963] outline-none"
            >
              <option value="0">0</option>
              <option value="0.25">-0.25</option>
              <option value="0.33">-0.33</option>
              <option value="0.5">-0.5</option>
              <option value="1">-1</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-300 bg-white">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-[#005963] border border-teal-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action row: Media Attachments & Delete Question */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Paperclip size={14} />
            <span>Media Attachments</span>
          </button>

          <div className="flex items-center gap-2">
            {(placementDirty || contentDirty) && (
              <button
                type="button"
                onClick={async () => {
                  if (placementDirty) await handleSavePlacement();
                  if (contentDirty) await handleSaveContent();
                }}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#005963] hover:bg-[#004a52] rounded-lg shadow-2xs transition-colors"
              >
                <Save size={14} />
                <span>Save Changes</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ea384c] hover:bg-red-700 rounded-lg shadow-2xs transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Remove Question from Test
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this question from this test?
            </p>

            <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteFromBank}
                onChange={(e) => setDeleteFromBank(e.target.checked)}
                className="rounded text-[#005963] focus:ring-[#005963]"
              />
              <span>Also delete from question bank (if unused elsewhere)</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteQuestion(deleteFromBank);
                  setDeleteModalOpen(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
