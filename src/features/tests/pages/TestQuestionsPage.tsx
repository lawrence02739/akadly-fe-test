import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Pencil, BookOpen, Sparkles } from 'lucide-react';
import { TestWizardLayout } from '../components/TestWizardLayout';
import { QuestionListPanel } from '../components/QuestionListPanel';
import { QuestionEditorPane } from '../components/QuestionEditorPane';
import { ImportFromBankModal } from '../components/ImportFromBankModal';
import { PreviewAssessmentModal } from '../components/PreviewAssessmentModal';
import {
  useTest,
  useAddTestQuestion,
  useImportTestQuestions,
  useReorderTestQuestions,
  useUpdateTestPlacement,
  useEditTestQuestionContent,
  useRemoveTestQuestion,
} from '../hooks/useTests';

export const TestQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();

  const { data: test, isLoading } = useTest(testId);

  const addQuestionMutation = useAddTestQuestion();
  const importQuestionsMutation = useImportTestQuestions();
  const reorderQuestionsMutation = useReorderTestQuestions();
  const updatePlacementMutation = useUpdateTestPlacement();
  const editContentMutation = useEditTestQuestionContent();
  const removeQuestionMutation = useRemoveTestQuestion();

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const questions = test?.questions || [];

  // Auto-select first question if none selected and questions exist
  useEffect(() => {
    if (questions.length > 0) {
      if (!selectedQuestionId || !questions.some((q) => q.id === selectedQuestionId)) {
        setSelectedQuestionId(questions[0].id);
      }
    } else {
      setSelectedQuestionId(null);
    }
  }, [questions, selectedQuestionId]);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  const handleAddQuestion = async (type: string = 'SINGLE') => {
    if (!testId) return;
    try {
      const defaultOptions =
        type === 'BOOLEAN' || type === 'TRUE_FALSE'
          ? [
              { text: 'True', correct: true },
              { text: 'False', correct: false },
            ]
          : [
              { text: 'Option A', correct: true },
              { text: 'Option B', correct: false },
              { text: 'Option C', correct: false },
              { text: 'Option D', correct: false },
            ];

      const res = await addQuestionMutation.mutateAsync({
        testId,
        dto: {
          type,
          text: 'New Question',
          options: defaultOptions,
          marks: 1,
          negativeMarks: 0,
        },
      });
      toast.success('Question added');
      if (res.test?.questions && res.test.questions.length > 0) {
        const lastQ = res.test.questions[res.test.questions.length - 1];
        setSelectedQuestionId(lastQ.id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to add question');
    }
  };

  const handleImport = async (
    options: { marksOverride?: number; shuffleQuestions?: boolean },
    questionIds: string[],
  ) => {
    if (!testId || questionIds.length === 0) return;
    try {
      await importQuestionsMutation.mutateAsync({
        testId,
        dto: {
          items: questionIds.map((id) => ({
            questionId: id,
            marks: options.marksOverride,
          })),
          shuffleQuestions: options.shuffleQuestions,
        },
      });
      toast.success(`Imported ${questionIds.length} question(s) from bank`);
      setImportModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to import questions');
    }
  };

  const handleReorder = async (newOrderedIds: string[]) => {
    if (!testId) return;
    try {
      await reorderQuestionsMutation.mutateAsync({
        testId,
        dto: {
          orderedQuestionIds: newOrderedIds,
          expectedRevision: test?.revision ?? 0,
        },
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to reorder questions');
    }
  };

  const handleUpdatePlacement = async (marks: number, negativeMarks: number) => {
    if (!testId || !selectedQuestionId) return;
    try {
      await updatePlacementMutation.mutateAsync({
        testId,
        questionId: selectedQuestionId,
        dto: { marks, negativeMarks },
      });
      toast.success('Marks updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update marks');
      throw err;
    }
  };

  const handleSaveContent = async (
    contentUpdates: Record<string, any>,
    scope: 'THIS_TEST' | 'EVERYWHERE',
  ) => {
    if (!testId || !selectedQuestionId) return;
    try {
      const res = await editContentMutation.mutateAsync({
        testId,
        questionId: selectedQuestionId,
        dto: { contentUpdates, scope },
      });
      toast.success('Question content saved');
      const createdEffect = res.effects?.find(
        (e) => e.collection === 'tenant_questions' && e.op === 'CREATED',
      );
      if (createdEffect?.id) {
        setSelectedQuestionId(createdEffect.id);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save question content');
      throw err;
    }
  };

  const handleDeleteQuestion = async (deleteFromBank: boolean) => {
    if (!testId || !selectedQuestionId) return;
    try {
      await removeQuestionMutation.mutateAsync({
        testId,
        questionId: selectedQuestionId,
        deleteFromBank,
      });
      toast.success(
        deleteFromBank
          ? 'Question deleted from test and Question Bank'
          : 'Question removed from test',
      );
      setSelectedQuestionId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to remove question');
      throw err;
    }
  };

  const handleNext = () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question before proceeding.');
      return;
    }
    navigate(`/partner/test-studio/${testId}/settings`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <TestWizardLayout
      currentStep={2}
      test={test}
      onNext={handleNext}
      onPreview={() => setPreviewOpen(true)}
      nextButtonLabel="Next : Add Settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question List (4.5 cols on lg) */}
        <div className="lg:col-span-4 xl:col-span-4">
          <QuestionListPanel
            questions={questions}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={(id) => setSelectedQuestionId(id)}
            onAddQuestion={handleAddQuestion}
            onOpenImport={() => setImportModalOpen(true)}
            onReorder={handleReorder}
            totalMarks={test?.grading?.totalMarks || 0}
          />
        </div>

        {/* Right Column: Question Editor or Empty State (8 cols on lg) */}
        <div className="lg:col-span-8 xl:col-span-8">
          {questions.length === 0 ? (
            /* Empty State matching Test Builder - add question.png */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs h-[750px] flex flex-col items-center justify-center p-8 text-center">
              {/* Sparkle icon badge */}
              <div className="w-14 h-14 rounded-full bg-teal-50 text-[#005963] flex items-center justify-center mb-5 border border-teal-100">
                <Sparkles size={26} />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Start Building Tests
              </h2>
              <p className="text-xs text-slate-500 max-w-md mb-8 leading-relaxed">
                Add questions manually, or import from question bank. Get started by selecting one of the methods below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                {/* Add Manually Card */}
                <button
                  type="button"
                  onClick={() => handleAddQuestion('SINGLE')}
                  className="p-5 text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2 mb-2 text-[#005963]">
                    <Pencil size={18} />
                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#005963]">
                      Add Manually
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Create multiple choice, essay, true/false, or fill-in-the-blank questions from scratch.
                  </p>
                </button>

                {/* Import from Bank Card */}
                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="p-5 text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2 mb-2 text-[#005963]">
                    <BookOpen size={18} />
                    <span className="text-sm font-bold text-slate-900 group-hover:text-[#005963]">
                      Import from Bank
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Search and reuse questions from your saved cohorts, subjects, and previous assessments.
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <QuestionEditorPane
              question={selectedQuestion}
              onUpdatePlacement={handleUpdatePlacement}
              onSaveContent={handleSaveContent}
              onDeleteQuestion={handleDeleteQuestion}
              isSaving={
                updatePlacementMutation.isPending ||
                editContentMutation.isPending ||
                removeQuestionMutation.isPending
              }
            />
          )}
        </div>
      </div>

      {/* Import from Bank Modal */}
      {importModalOpen && test && (
        <ImportFromBankModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          targetTest={test}
          onImportConfirmed={handleImport}
          isImporting={importQuestionsMutation.isPending}
        />
      )}

      {/* Preview Assessment Modal */}
      {previewOpen && test && (
        <PreviewAssessmentModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          test={test}
        />
      )}
    </TestWizardLayout>
  );
};
