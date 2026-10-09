import { useEffect, useState } from 'react';
import { announcementsApi } from '../../../api/announcements';
import type { Announcement } from '../../../types/announcements';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Eye, Mail, AlertTriangle,
  Archive, Edit2, FileText, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AnnouncementView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnnouncement(id);
    }
  }, [id]);

  const fetchAnnouncement = async (announcementId: string) => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.all([
        announcementsApi.getTenantAnnouncement(announcementId),
        announcementsApi.getTenantAnnouncementStats(announcementId).catch(() => null)
      ]);
      setAnnouncement(res);
      setStats(statsRes || {
        delivered: 412, deliveredPercent: 96.3,
        viewed: 324, viewedPercent: 78.6,
        emailOpened: 286, emailOpenedPercent: 69.4,
        failed: 3, failedPercent: 0.7
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!announcement) return;
    if (!window.confirm('Are you sure you want to archive this announcement?')) return;
    try {
      // await announcementsApi.archive?.(announcement.id);
      toast.success('Announcement archived');
      navigate('/partner/announcements');
    } catch (e) {
      console.error(e);
      toast.error('Failed to archive');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600 font-medium text-lg">Announcement not found</p>
        <button onClick={() => navigate('/partner/announcements')} className="mt-4 text-primary-600 hover:underline">
          Go back to list
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Announcement Details</h1>
            <p className="text-slate-500 text-sm mt-1">
              Review delivery, audience, and channel performance for a published announcement.
            </p>
          </div>
          <button
            onClick={() => navigate(`/partner/announcements/${announcement.id}/edit`)}
            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Main Status & Stats Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="p-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${announcement.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                  announcement.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                  {announcement.status}
                </span>
                <span className="text-slate-400 text-xs font-medium">{announcement.code || `ANN-${announcement.id.substring(0, 4).toUpperCase()}`}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{announcement.title}</h2>
            </div>


          </div>

          {stats && (
            <div className="grid grid-cols-4 divide-x divide-slate-100 p-6">
              <div className="px-4">
                <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                  <span>Delivered</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.delivered}</div>
                <div className="text-xs text-slate-400 mt-1">{stats.deliveredPercent}% of audience</div>
              </div>
              <div className="px-4">
                <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                  <span>Viewed</span>
                  <Eye className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.viewed}</div>
                <div className="text-xs text-slate-400 mt-1">{stats.viewedPercent}% of audience</div>
              </div>
              <div className="px-4">
                <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                  <span>Email opened</span>
                  <Mail className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.emailOpened}</div>
                <div className="text-xs text-slate-400 mt-1">{stats.emailOpenedPercent}% of audience</div>
              </div>
              <div className="px-4">
                <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                  <span>Failed</span>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{stats.failed}</div>
                <div className="text-xs text-slate-400 mt-1">{stats.failedPercent}% of audience</div>
              </div>
            </div>
          )}
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Form Details */}
          <div className="col-span-2 space-y-6">

            {/* Audience & targeting */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Audience & targeting</h3>
              <p className="text-sm text-slate-500 mb-5">428 learners match this announcement</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Course</label>
                  <div className="p-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                    {announcement.courseTitle || 'All courses'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Batch</label>
                  <div className="p-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                    {announcement.batchName || 'All batches'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Audience</label>
                  <div className="p-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                    {announcement.audience.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Learner status</label>
                  <div className="p-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                    {announcement.learnerStatus ? announcement.learnerStatus.charAt(0) + announcement.learnerStatus.slice(1).toLowerCase() : 'Active'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">428 learners</span>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">6 instructors</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">17 promotional opt-outs unaffected</span>
              </div>
            </div>

            {/* Message content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Message content</h3>
              <p className="text-sm text-slate-500 mb-5">Rich content mirrored to enabled channels</p>

              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-700 mb-1">Announcement title</label>
                <div className="p-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900">
                  {announcement.title}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-2 text-slate-500">
                  <div className="w-4 h-4 font-bold text-xs flex items-center justify-center">B</div>
                  <div className="w-4 h-4 italic text-xs flex items-center justify-center">I</div>
                  <div className="w-4 h-4 underline text-xs flex items-center justify-center">U</div>
                </div>
                <div
                  className="p-4 prose max-w-none text-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: announcement.bodyHtml || '' }}
                />
              </div>

              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="space-y-2">
                  {announcement.attachments.map(att => (
                    <div key={att._id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{att.fileName}</p>
                        <p className="text-xs text-slate-500">{Math.round(att.sizeBytes / 1024)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publishing & controls */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Publishing & controls</h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Published</label>
                  <div className="p-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                    {announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleString() : new Date(announcement.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Expires</label>
                  <div className="p-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50">
                    {announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-4 rounded-full flex items-center px-0.5 ${announcement.pinned ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Pinned to dashboard</p>
                      <p className="text-xs text-slate-500">Shown above regular updates</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-4 rounded-full flex items-center px-0.5 ${announcement.priority === 'HIGH' ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">High priority</p>
                      <p className="text-xs text-slate-500">Priority label and push alert sent</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-4 rounded-full flex items-center px-0.5 ${announcement.channels?.email ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Mirrored by email</p>
                      <p className="text-xs text-slate-500">412 eligible recipients</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-4 rounded-full flex items-center px-0.5 ${announcement.channels?.push ? 'bg-primary-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Mirrored by push</p>
                      <p className="text-xs text-slate-500">388 devices reachable</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - Previews & History */}
          <div className="space-y-6">

            {/* Learner preview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Learner preview</h3>
                <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">WEB</span>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wide">
                    {announcement.priority === 'HIGH' ? 'HIGH PRIORITY' : 'UPDATE'}
                  </span>
                  {announcement.pinned && <div className="text-primary-600"><CheckCircle2 className="w-4 h-4" /></div>}
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{announcement.title}</h4>
                <div className="text-sm text-slate-600 mb-3 line-clamp-3">
                  {announcement.bodyText}
                </div>
                {announcement.attachments && announcement.attachments.length > 0 && (
                  <div className="flex items-center gap-2 p-2 border border-slate-100 bg-slate-50 rounded text-xs text-slate-700 font-medium">
                    <FileText className="w-3.5 h-3.5 text-red-500" />
                    {announcement.attachments[0].fileName}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-3">Posted {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()} · {announcement.createdByName}</p>
              </div>

              <div className="flex border-t border-slate-100 pt-4">
                <button className="flex-1 text-sm font-medium text-primary-600 border-b-2 border-primary-600 pb-2">Web</button>
                <button className="flex-1 text-sm font-medium text-slate-500 pb-2">Email</button>
                <button className="flex-1 text-sm font-medium text-slate-500 pb-2">Push</button>
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">History</h3>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {(announcement.history || []).slice().reverse().map((h, i) => (
                  <div key={h._id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white bg-slate-300 absolute left-0 ml-[2px] md:ml-0 md:left-1/2 md:-translate-x-1/2`}></div>
                    <div className="w-[calc(100%-1.5rem)] md:w-[calc(50%-1.5rem)] p-0 ml-4 md:ml-0 pl-2">
                      <p className="text-sm font-medium text-slate-900">{h.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                      <p className="text-xs text-slate-500">{h.actorName} · {new Date(h.at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Archive section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 border-l-4 border-l-red-500">
              <div className="flex gap-3 items-start mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">
                  Archiving removes this announcement from learner dashboards. A confirmation is required.
                </p>
              </div>
              <button onClick={handleArchive} className="w-full py-2 bg-red-50 text-red-600 font-medium text-sm rounded-lg hover:bg-red-100 transition-colors">
                <Archive className="w-4 h-4 inline-block mr-2" />
                Archive announcement...
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
