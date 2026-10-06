import { useEffect, useState } from "react";
import { studentApi } from "../api/student-api.client";

type Update = {
  batchId: string;
  batchName: string;
  courseTitle: string;
  content: Array<{ id: string; title: string; type: string; url?: string; resourceUrl?: string; text?: string; courseNodeId?: string }>;
  announcements: Array<{ id: string; message: string; publishedAt: string }>;
};

export default function MyBatchUpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void studentApi.get("/student/batches/updates")
      .then(({ data }) => setUpdates(data.data ?? data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold text-slate-900">My cohorts</h1><p className="text-sm text-slate-500">Announcements and content shared with your batches.</p></div>
    {loading && <p className="text-sm text-slate-500">Loading cohorts...</p>}
    {error && <p role="alert" className="text-sm text-rose-700">Could not load cohort updates. Please refresh the page.</p>}
    {!loading && !error && updates.length === 0 && <p className="rounded-xl border bg-white p-5 text-sm text-slate-500">No cohort updates yet.</p>}
    {updates.map((batch) => <section key={batch.batchId} className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold text-slate-900">{batch.batchName}</h2><p className="text-xs text-slate-500">{batch.courseTitle}</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div><h3 className="text-sm font-semibold">Announcements</h3><div className="mt-2 space-y-2">{batch.announcements.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="whitespace-pre-wrap text-sm">{item.message}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.publishedAt).toLocaleString()}</p></div>)}{!batch.announcements.length && <p className="text-sm text-slate-500">No announcements yet.</p>}</div></div>
        <div><h3 className="text-sm font-semibold">Linked content</h3><div className="mt-2 space-y-2">{batch.content.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="text-sm font-medium">{item.title}</p><p className="text-xs capitalize text-slate-500">{item.type}</p>{item.text && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.text}</p>}{(item.resourceUrl || item.url) && <a href={item.resourceUrl || item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#0C5A69] underline">Open resource</a>}{item.courseNodeId && !item.resourceUrl && !item.text && <p className="text-xs text-slate-500">This course item is not available yet.</p>}</div>)}{!batch.content.length && <p className="text-sm text-slate-500">No content shared yet.</p>}</div></div>
      </div>
    </section>)}
  </div>;
}
