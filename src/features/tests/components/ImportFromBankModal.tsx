import React, { useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuestions } from '../../questions/hooks/useQuestions';
import { useListCourses } from '../../courses/hooks/useCourses';
import type { Test } from '../types';
import { ImportConfirmModal } from './ImportConfirmModal';

interface ImportFromBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTest: Test;
  onImportConfirmed: (options: { marksOverride?: number; shuffleQuestions?: boolean }, selectedIds: string[]) => Promise<void>;
  isImporting?: boolean;
}

export const ImportFromBankModal: React.FC<ImportFromBankModalProps> = ({
  isOpen,
  onClose,
  targetTest,
  onImportConfirmed,
  isImporting = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedBlooms, setSelectedBlooms] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const { data: courses = [] } = useListCourses();

  const { data: questionData, isLoading } = useQuestions({
    search: search || undefined,
    courseId: selectedCourseId || undefined,
    type: selectedType || undefined,
    difficulty: (selectedDifficulty as any) || undefined,
    bloomsLevel: selectedBlooms || undefined,
    testId: targetTest.id,
    page,
    pageSize,
  });

  if (!isOpen) return null;

  const questions = questionData?.items || [];
  const total = questionData?.total || 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const toggleSelect = (id: string, inTest?: boolean) => {
    if (inTest) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = (checked: boolean) => {
    const next = new Set(selectedIds);
    for (const q of questions) {
      if ((q as any).inTest) continue;
      if (checked) next.add(q.id);
      else next.delete(q.id);
    }
    setSelectedIds(next);
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCourseId('');
    setSelectedType('');
    setSelectedDifficulty('');
    setSelectedBlooms('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    search || selectedCourseId || selectedType || selectedDifficulty || selectedBlooms,
  );

  const startEntry = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, total);

  const handleOpenConfirm = () => {
    if (selectedIds.size === 0) return;
    setConfirmModalOpen(true);
  };

  const handleExecuteImport = async (options: { marksOverride?: number; shuffleQuestions?: boolean }) => {
    await onImportConfirmed(options, Array.from(selectedIds));
    setConfirmModalOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Import from Question Library</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {startEntry}–{endEntry} of {total} questions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters Bar */}
          <div className="px-6 py-3.5 border-b border-slate-200 bg-white space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search question text..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-teal-600 outline-none"
                />
              </div>

              {/* Course filter */}
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none"
              >
                <option value="">Course: All Courses</option>
                {courses.map((c: any) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Type filter */}
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none"
              >
                <option value="">Type: All Types</option>
                <option value="SINGLE">Single Choice (MCQ)</option>
                <option value="MULTIPLE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="FILL_BLANK">Fill in Blank</option>
                <option value="NUMERIC">Numerical</option>
                <option value="SHORT_ANSWER">Short Answer</option>
                <option value="SUBJECTIVE">Subjective</option>
              </select>

              {/* Difficulty filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none"
              >
                <option value="">Difficulty: All</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>

              {/* Blooms Taxonomy */}
              <select
                value={selectedBlooms}
                onChange={(e) => {
                  setSelectedBlooms(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none"
              >
                <option value="">Bloom's Taxonomy: All</option>
                <option value="REMEMBER">Remember</option>
                <option value="UNDERSTAND">Understand</option>
                <option value="APPLY">Apply</option>
                <option value="ANALYZE">Analyze</option>
                <option value="EVALUATE">Evaluate</option>
                <option value="CREATE">Create</option>
              </select>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Active filters:</span>
                {selectedCourseId && (
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
                    Course: {courses.find((c: any) => (c.id || c._id) === selectedCourseId)?.title || selectedCourseId}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedCourseId('')} />
                  </span>
                )}
                {selectedType && (
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
                    Type: {selectedType}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedType('')} />
                  </span>
                )}
                {selectedDifficulty && (
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
                    Difficulty: {selectedDifficulty}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedDifficulty('')} />
                  </span>
                )}
                {selectedBlooms && (
                  <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
                    Bloom's: {selectedBlooms}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedBlooms('')} />
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-teal-700 hover:text-teal-900 font-semibold underline text-[11px] ml-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm font-medium">No questions found matching your filter criteria.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          checked={
                            questions.filter((q: any) => !q.inTest).length > 0 &&
                            questions.filter((q: any) => !q.inTest).every((q) => selectedIds.has(q.id))
                          }
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3 w-12 text-slate-400">No.</th>
                      <th className="p-3">Question</th>
                      <th className="p-3 w-28">Type</th>
                      <th className="p-3 w-20">Difficulty</th>
                      <th className="p-3 w-16 text-right">Points</th>
                      <th className="p-3 w-28">Subject</th>
                      <th className="p-3 w-28">Author</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q: any, idx) => {
                      const isAlreadyInTest = Boolean(q.inTest);
                      const isSelected = selectedIds.has(q.id);

                      return (
                        <tr
                          key={q.id}
                          onClick={() => !isAlreadyInTest && toggleSelect(q.id, isAlreadyInTest)}
                          className={`transition-colors ${
                            isAlreadyInTest
                              ? 'bg-slate-50/70 text-slate-400 cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-50/40 cursor-pointer'
                              : 'hover:bg-slate-50 cursor-pointer text-slate-800'
                          }`}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              disabled={isAlreadyInTest}
                              checked={isSelected}
                              onChange={() => toggleSelect(q.id, isAlreadyInTest)}
                              className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
                            />
                          </td>
                          <td className="p-3 text-slate-400 font-mono">
                            {(page - 1) * pageSize + idx + 1}
                          </td>
                          <td className="p-3 font-medium">
                            <div className="line-clamp-2">{q.text}</div>
                            {isAlreadyInTest && (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block mt-0.5">
                                Already in test
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {q.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                q.difficulty === 'EASY'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : q.difficulty === 'HARD'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-700">
                            {q.mark ?? 1}
                          </td>
                          <td className="p-3 text-slate-500 truncate max-w-[100px]">
                            {q.subject || '—'}
                          </td>
                          <td className="p-3 text-slate-500 truncate max-w-[100px]">
                            {q.authorName || 'Teacher'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer with pagination and Add action */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-600 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-700">
                {selectedIds.size} {selectedIds.size === 1 ? 'Question' : 'Questions'} Selected
              </span>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleOpenConfirm}
                disabled={selectedIds.size === 0 || isImporting}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Selected to Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ImportConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        targetTest={targetTest}
        selectedCount={selectedIds.size}
        onConfirm={handleExecuteImport}
        isSubmitting={isImporting}
      />
    </>
  );
};
