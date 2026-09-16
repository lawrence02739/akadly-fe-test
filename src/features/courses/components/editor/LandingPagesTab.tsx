import { Loader2, Sparkles } from 'lucide-react';

export default function LandingPagesTab({ courseData, onChange, onSave, isSaving }: { courseData: any, onChange: (field: string, value: any) => void, onSave: () => void, isSaving: boolean }) {

  const handleCopyDeepLink = () => {
    if (courseData.appDeepLink) {
      navigator.clipboard.writeText(courseData.appDeepLink);
    }
  };

  return (
    <div className="space-y-6 relative h-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Course Landing Page */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Course Landing Page</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course Page URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseData.seoPageUrl || ''}
                  onChange={(e) => onChange('seoPageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="reactjs-fundamentals-masterclass"
                />
                <p className="text-xs text-slate-500 mt-1">SEO Best Practice: include Course Name and main keywords. Keep it clean with hyphens.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={courseData.canonicalUrl || ''}
                  onChange={(e) => onChange('canonicalUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://yourdomain.com/courses/reactjs-fundamentals"
                />
                <p className="text-xs text-slate-500 mt-1">Specifies the preferred URL for search engine indexing.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">App Deep Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={courseData.appDeepLink || ''}
                    onChange={(e) => onChange('appDeepLink', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="akad.ly/deep/reactjs-prod-blueprint"
                  />
                  <button
                    type="button"
                    onClick={handleCopyDeepLink}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">SEO Metadata</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseData.seoTitle || ''}
                  onChange={(e) => onChange('seoTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Master React.js: Clean Code & High-Performance Patterns"
                />
                <p className="text-xs text-slate-500 mt-1">Target 50-60 characters for peak Google CTR.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Page Description</label>
                <textarea
                  rows={3}
                  value={courseData.seoDescription || ''}
                  onChange={(e) => onChange('seoDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Build production-grade web apps with modern React.js. Learn architectural patterns, optimization, custom hooks, and state management models."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Category</label>
                <input
                  type="text"
                  value={courseData.seoCategory || ''}
                  onChange={(e) => onChange('seoCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Software Engineering & Web Development"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#f0faeb] rounded-xl border border-[#d6f0cb] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800 text-sm uppercase">AI SEO Optimizer</h3>
            </div>
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
              We analyzed competitive organic search signals for 'React JS'. Changing your title to include 'Build Production Ready Apps' will capture <strong>35%</strong> more high-intent organic search volume.
            </p>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              Apply Suggestion
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Open Graph Social Preview</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <div className="h-32 bg-slate-800 relative">
                {courseData.thumbnail ? (
                  <img src={courseData.thumbnail} alt="OG Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center opacity-70 border-b border-slate-700">
                    <span className="text-xs text-white">No cover image</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#f2f4f7]">
                <div className="text-[10px] text-slate-500 font-semibold mb-1 uppercase tracking-wide">AKAD.LY/COURSES</div>
                <div className="text-sm font-bold text-slate-900 leading-tight mb-1 truncate">
                  {courseData.seoTitle || courseData.title || 'Course Title'}
                </div>
                <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {courseData.seoDescription || courseData.description || 'Course description...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-900 border-t border-primary-800 px-6 py-4 flex items-center justify-end gap-4 z-50">
        <button className="px-6 py-2 border border-slate-400 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 bg-white text-primary-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
