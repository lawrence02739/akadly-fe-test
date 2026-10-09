import { useEffect, useState } from 'react';
import { announcementsApi } from '../../../api/announcements';
import type { Announcement } from '../../../types/announcements';

export function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementsApi.listStudentAnnouncements(1, 50);
      setAnnouncements(res?.data || res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading announcements...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      
      {announcements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">You're all caught up! No new announcements.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className={`bg-white p-6 rounded-xl shadow-sm border transition-all ${a.isRead ? 'border-gray-100 opacity-80' : 'border-blue-100 shadow-md ring-1 ring-blue-50'}`}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {a.title}
                  {!a.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                </h3>
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                  {new Date(a.publishedAt || a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <div 
                className="prose prose-sm max-w-none text-gray-600 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: a.bodyHtml || '' }}
              />
              
              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                 <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Read more →
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
