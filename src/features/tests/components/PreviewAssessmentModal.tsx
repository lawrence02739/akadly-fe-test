import React from 'react';
import { X, Clock, Award, HelpCircle } from 'lucide-react';
import type { Test } from '../types';

interface PreviewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: Test;
}

export const PreviewAssessmentModal: React.FC<PreviewAssessmentModalProps> = ({
  isOpen,
  onClose,
  test,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-teal-100 text-teal-800 uppercase tracking-wider">
                Assessment Preview
              </span>
              <h2 className="text-lg font-bold text-slate-900">{test.title}</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {test.timeLimitMinutes ? `${test.timeLimitMinutes} Minutes` : 'No time limit'}
              </span>
              <span className="flex items-center gap-1">
                <Award size={14} />
                {test.grading?.totalMarks || 0} Total Marks
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle size={14} />
                {test.questionCount} Questions
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Question list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {test.description && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Instructions: </span>
              {test.description}
            </div>
          )}

          {(!test.questions || test.questions.length === 0) ? (
            <div className="text-center py-12 text-slate-400">
              <HelpCircle size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No questions have been added to this test yet.</p>
            </div>
          ) : (
            test.questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200">
                      {q.sequence || idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-600 uppercase">
                      {q.type || 'MCQ'}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {q.marks} {q.marks === 1 ? 'Point' : 'Points'}
                    {q.negativeMarks > 0 && (
                      <span className="text-red-500 font-normal ml-1">
                        (-{q.negativeMarks})
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-900 leading-relaxed">
                  {q.text || 'Untitled Question'}
                </div>

                {/* Options if available */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt: any, optIdx: number) => (
                      <div
                        key={optIdx}
                        className={`px-3 py-2 text-xs rounded-lg border flex items-center gap-2 ${
                          opt.correct
                            ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 font-medium'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-slate-300 text-[10px] font-bold flex items-center justify-center bg-white text-slate-500">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt.text || opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
