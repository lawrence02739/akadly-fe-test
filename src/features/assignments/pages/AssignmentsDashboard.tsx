import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentApi } from '../api/assignments.api';
import type { AssignmentListResponse } from '../types';
import { Plus, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AssignmentsDashboard() {
  const [data, setData] = useState<AssignmentListResponse | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchAssignments = async (searchQuery: string = '') => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        assignmentApi.list({ limit: 50, q: searchQuery }),
        assignmentApi.stats()
      ]);
      setData(listRes);
      setStats(statsRes);
    } catch (e) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssignments(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PUBLISHED') return 'bg-green-50 text-green-700 ring-green-600/20';
    if (s === 'DRAFT') return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    if (s === 'CLOSED') return 'bg-orange-50 text-orange-700 ring-orange-600/20';
    if (s === 'ARCHIVED') return 'bg-gray-100 text-gray-500 ring-gray-500/10';
    return 'bg-blue-50 text-blue-700 ring-blue-700/10';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage assignments across your courses and batches.
          </p>
        </div>
        <button
          onClick={() => navigate('/partner/assignments/create')}
          className="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Assignment
        </button>
      </div>

      {/* Widgets */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText size={16} />
              Active assignments
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold tracking-tight text-gray-900">{stats.activeAssignments?.count || 0}</div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {stats.activeAssignments?.dueThisWeek || 0} due this week
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText size={16} />
              Awaiting grading
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold tracking-tight text-gray-900">{stats.awaitingGrading?.count || 0}</div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Across {stats.awaitingGrading?.assignmentCount || 0} assignments
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText size={16} />
              Late submissions
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold tracking-tight text-gray-900">{stats.lateSubmissions?.count || 0}</div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {stats.lateSubmissions?.needReview || 0} need review
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText size={16} />
              Average score
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-3xl font-semibold tracking-tight text-gray-900">{stats.averageScore?.percent != null ? `${stats.averageScore.percent}%` : '-'}</div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Across all graded assignments
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">Loading assignments...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No assignments found</h3>
            <p className="mt-2 text-sm text-gray-500">Get started by creating a new assignment.</p>
            <button
              onClick={() => navigate('/partner/assignments/create')}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              <Plus size={16} className="-ml-0.5" />
              New Assignment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Assignment
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Batch
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Due Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    Submitted
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    Needs Review
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                    Avg. Score
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-6 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data?.items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{item.courseTitle || 'No Course Linked'}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {item.batchName || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={clsx('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset', getStatusBadge(item.status))}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {item.dueAt ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(item.dueAt)) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      <span className="font-medium text-gray-900">{item.progress?.submitted || '0'}</span>
                      <span className="text-gray-500"> / {item.progress?.total || '-'}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                      {item.review?.pending ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                          {item.review.pending}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-gray-500">
                      {item.avgScorePercent != null ? `${item.avgScorePercent}%` : '-'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/partner/assignments/${item.id}/edit`)}
                          className="text-teal-600 hover:text-teal-900 font-semibold"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
