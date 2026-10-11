import { useEffect, useState } from 'react';
import { announcementsApi } from '../../../api/announcements';
import type { Announcement } from '../../../types/announcements';
import { AnnouncementStatus } from '../../../types/announcements';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | ''>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [statusFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementsApi.listTenantAnnouncements(1, 50, statusFilter as any);
      setAnnouncements(res || []);
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
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link 
          to="/partner/announcements/new" 
          className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["", AnnouncementStatus.PUBLISHED, AnnouncementStatus.DRAFT, AnnouncementStatus.SCHEDULED] as const).map((s) => (
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
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-600 font-medium">No announcements found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Audience</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {announcements
                .filter(a => search === '' || a.title.toLowerCase().includes(search.toLowerCase()))
                .map(a => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 group cursor-pointer" onClick={() => window.location.href = `/partner/announcements/${a.id}`}>
                  <td className="py-3 px-4 font-medium text-slate-900 text-sm">{a.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{a.audience.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{a.priority ? a.priority.charAt(0) + a.priority.slice(1).toLowerCase() : ''}</td>
                  <td className="py-3 px-4 text-sm text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/partner/announcements/${a.id}`} className="text-sm text-primary-600 hover:text-primary-800 opacity-0 group-hover:opacity-100 transition-opacity font-medium">View</Link>
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
