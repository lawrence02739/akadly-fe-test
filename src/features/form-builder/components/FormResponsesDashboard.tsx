import React from 'react';
import { ChevronLeft, ChevronRight, FileText, Loader2, Users } from 'lucide-react';
import api from '../../../shared/api/axios';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

type FormResponse = {
  id: string;
  responses: Record<string, unknown>;
  metadata?: { submittedAt?: string };
  createdAt: string;
};

type ResponsePage = {
  items: FormResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const formatAnswer = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'No answer';
  if (Array.isArray(value)) return value.map(formatAnswer).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const submittedAt = (response: FormResponse): string => {
  const date = response.metadata?.submittedAt ?? response.createdAt;
  return new Date(date).toLocaleString();
};

export const FormResponsesDashboard: React.FC = () => {
  const { formId, sections } = useFormBuilderStore();
  const [data, setData] = React.useState<ResponsePage | null>(null);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const questions = React.useMemo(
    () =>
      sections.flatMap((section) =>
        section.blocks
          .filter((block) => block.type === 'QUESTION')
          .map((block) => ({
            id: block.id,
            title: block.title || 'Untitled question',
          })),
      ),
    [sections],
  );

  React.useEffect(() => {
    if (!formId) {
      setData(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    api
      .get(`/form-builder/forms/${formId}/submissions`, {
        params: { page, limit: 20 },
      })
      .then((response) => {
        if (active) setData(response.data?.data ?? response.data);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ??
              'Unable to load form responses. Please try again.',
          );
        }
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [formId, page]);

  if (!formId) {
    return (
      <div className="flex-1 grid place-items-center bg-slate-50 p-8">
        <div className="max-w-md text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">Save the form first</h2>
          <p className="mt-2 text-sm text-slate-500">Responses are available after this form has been saved and shared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-700"><Users className="h-5 w-5" /></div>
            <div><h2 className="text-xl font-semibold text-slate-900">Responses</h2><p className="text-sm text-slate-500">Submitted responses for this form.</p></div>
          </div>
          <div className="mt-4 text-2xl font-semibold text-slate-900 sm:mt-0">{data?.total ?? 0}</div>
        </section>

        {loading && <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading responses...</div>}
        {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {!loading && !error && data?.items.length === 0 && <div className="rounded-xl border border-slate-200 bg-white py-16 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-800">No responses yet</h3><p className="mt-1 text-sm text-slate-500">Responses will appear here after people submit this form.</p></div>}

        {!loading && !error && data?.items.map((response, index) => (
          <article key={response.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-semibold text-slate-900">Response {(page - 1) * data.limit + index + 1}</h3><p className="mt-1 text-xs text-slate-500">Submitted {submittedAt(response)}</p></div></header>
            <dl className="divide-y divide-slate-100">
              {questions.map((question) => <div key={question.id} className="px-5 py-4"><dt className="text-sm font-medium text-slate-800">{question.title}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{formatAnswer(response.responses?.[question.id])}</dd></div>)}
            </dl>
          </article>
        ))}

        {!loading && !error && data && data.totalPages > 1 && (
          <nav className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3" aria-label="Response pages">
            <p className="text-sm text-slate-500">Page {data.page} of {data.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((value) => value - 1)} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Previous</button>
              <button onClick={() => setPage((value) => value + 1)} disabled={page >= data.totalPages} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};
