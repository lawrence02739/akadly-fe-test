import { useEffect, useState } from 'react';
import { qaApi } from '../../../api/qa';
import type { LessonQuestion } from '../../../types/qa';
import { QuestionStatus } from '../../../types/qa';
import { Link } from 'react-router-dom';

export function QuestionInbox() {
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | ''>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [statusFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await qaApi.listTenantQuestions(1, 50, statusFilter as any);
      setQuestions(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Q&A Inbox</h1>
          <p className="text-slate-500 text-sm mt-1">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["", QuestionStatus.OPEN, QuestionStatus.ANSWERED, QuestionStatus.ESCALATED, QuestionStatus.RESOLVED] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${statusFilter === s ? "bg-primary-800 text-white border-primary-800" : "text-slate-600 border-slate-200 hover:bg-slate-50 bg-white"}`}
            >
              {s === "" ? "All Statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[300px]">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-600 font-medium">No questions found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Course / Lesson</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Question</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Activity</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {questions
                .filter(q => search === '' || q.title.toLowerCase().includes(search.toLowerCase()) || q.studentName?.toLowerCase().includes(search.toLowerCase()))
                .map(q => (
                <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 group cursor-pointer" onClick={() => window.location.href = `/partner/qa/${q.id}`}>
                  <td className="py-3 px-4 text-sm font-medium text-slate-900">{q.studentName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    <div className="font-medium">{q.courseTitle}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{q.lessonTitle}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700 max-w-[200px] truncate" title={q.title}>{q.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : q.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {q.status.charAt(0) + q.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">{new Date(q.lastActivityAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/partner/qa/${q.id}`} className="text-sm text-primary-600 hover:text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Reply</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
