import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, AlertCircle, X, BookOpen, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useQuestions, useDeleteQuestion, useCreateQuestion, useUpdateQuestion } from '../hooks/useQuestions';
import { QuestionModal } from './QuestionModal';
import type { Question, CreateQuestionDto } from '../../quizzes/types';
import toast from 'react-hot-toast';
import '../../quizzes/assets/quiz-studio.css';

const TYPE_LABELS: Record<string, string> = {
  // Basic
  SINGLE: 'Single',
  MULTIPLE: 'Multiple',
  NUMERIC: 'Numeric',
  TRUE_FALSE: 'True/False',
  FILL_BLANK: 'Fill Blank',
  // Advanced
  SHORT_ANSWER: 'Short Ans',
  SUBJECTIVE: 'Subjective',
  MATCH: 'Match',
  ASSERTION_REASON: 'Assert/Reason',
  ARRANGEMENT: 'Arrangement',
  // Specialized
  MAP_BASED: 'Map Based',
  DRAG_DROP: 'Drag & Drop',
  CODING: 'Coding',
};


const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HARD: 'bg-rose-100 text-rose-700 border-rose-200',
};

interface DeleteError {
  message: string;
  references: string[];
}

export default function QuestionBankPage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | ''>('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Question | null>(null);
  const [deleteError, setDeleteError] = useState<DeleteError | null>(null);

  const { data, isLoading } = useQuestions({
    search: search || undefined,
    difficulty: difficulty || undefined,
    page,
    pageSize,
  });

  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();

  const handleSave = async (dto: CreateQuestionDto) => {
    if (editingQuestion) {
      await updateMutation.mutateAsync({ id: editingQuestion.id, dto });
      toast.success('Question updated!');
    } else {
      await createMutation.mutateAsync(dto);
      toast.success('Question created!');
    }
    setQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setQuestionModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteMutation.mutateAsync(deleteCandidate.id);
      toast.success('Question deleted!');
      setDeleteCandidate(null);
      setDeleteError(null);
    } catch (err: any) {
      const body = err?.response?.data;
      setDeleteError({
        message: body?.message || 'Failed to delete question.',
        references: body?.references || [],
      });
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            Question Bank
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Centrally manage your questions. Questions linked to quizzes or tests cannot be deleted.
          </p>
        </div>
        <button
          onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}
          className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          New question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-4 text-sm overflow-x-auto shadow-sm">
        <div className="flex-1 min-w-[200px] relative px-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 focus:outline-none bg-transparent"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 shrink-0"></div>

        <div className="flex items-center gap-2 px-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={difficulty}
            onChange={e => { setDifficulty(e.target.value as any); setPage(1); }}
            className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {(search || difficulty) && (
          <>
            <div className="h-6 w-px bg-slate-200 shrink-0"></div>
            <button
              onClick={() => { setSearch(''); setDifficulty(''); setPage(1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-medium shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          </>
        )}

        <span className="ml-auto px-4 font-semibold text-slate-400 shrink-0">
          {data?.total || 0} total
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 w-12">#</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4 w-28">Type</th>
                <th className="px-6 py-4 w-32">Subject</th>
                <th className="px-6 py-4 w-28">Difficulty</th>
                <th className="px-6 py-4 w-20">Mark</th>
                <th className="px-6 py-4 w-28">Added</th>
                <th className="px-6 py-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Loading questions...
                  </td>
                </tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <p className="text-slate-600 font-semibold text-base">No questions found</p>
                      <p className="text-slate-500 text-sm">
                        {search || difficulty ? 'Try adjusting your filters to find what you are looking for.' : 'Click "New question" above to create your first question.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 max-w-md truncate" title={q.text}>
                        {q.text}
                      </div>
                      {q.topic && (
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-sm">
                          {q.topic}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {TYPE_LABELS[q.type] || q.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {q.subject || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {q.difficulty ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border ${DIFFICULTY_STYLES[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {q.mark ?? 1}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(q)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteCandidate(q); setDeleteError(null); }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Showing {data?.total ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, data?.total || 0)} of {data?.total || 0} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), page + 2)
                .map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${p === page
                        ? 'bg-primary-800 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {p}
                  </button>
                ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {questionModalOpen && (
        <div className="quiz-studio-root">
          <QuestionModal
            isOpen={questionModalOpen}
            onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); }}
            question={editingQuestion}
            nextOrder={(data?.total || 0) + 1}
            onSave={handleSave}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {deleteCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { setDeleteCandidate(null); setDeleteError(null); } }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Delete Question</h2>
              <button onClick={() => { setDeleteCandidate(null); setDeleteError(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {deleteError ? (
                <div className="space-y-4">
                  <div className="flex gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-700 m-0 text-sm">Cannot Delete</p>
                      <p className="mt-1 text-sm text-rose-600 leading-relaxed">{deleteError.message}</p>
                    </div>
                  </div>
                  {deleteError.references.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Linked to:</p>
                      <ul className="space-y-2">
                        {deleteError.references.map((ref, i) => (
                          <li key={i} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm text-slate-500">
                    To delete, first remove this question from all linked quizzes and tests.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-600">Are you sure you want to permanently delete this question?</p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl border-l-4 border-l-rose-500 italic text-slate-700 font-medium line-clamp-3">
                    "{deleteCandidate.text}"
                  </div>
                  <p className="text-sm text-slate-500 font-medium">This action cannot be undone.</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80">
              <button onClick={() => { setDeleteCandidate(null); setDeleteError(null); }} className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                {deleteError ? 'Close' : 'Cancel'}
              </button>
              {!deleteError && (
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}