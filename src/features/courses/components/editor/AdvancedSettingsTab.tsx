import { useState } from 'react';
import { Loader2, Sparkles, Bold, Italic, Underline, Strikethrough, ChevronDown, Type } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeleteCourse } from '../../hooks/useCourses';
import { toast } from 'react-hot-toast';

export default function AdvancedSettingsTab({ courseData, onChange, onSave, isSaving }: { courseData: any, onChange: (field: string, value: any) => void, onSave: () => void, isSaving: boolean }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { mutateAsync: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const insertVariable = (variable: string) => {
    const current = courseData.welcomeEmailContent || '';
    onChange('welcomeEmailContent', current + variable);
  };

  return (
    <div className="space-y-6 relative h-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Course Welcome Email */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Course Welcome Email</h3>
            <p className="text-sm text-slate-500 mb-6">Send welcome email to learner immediately upon enrollment</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseData.welcomeEmailSubject || ''}
                  onChange={(e) => onChange('welcomeEmailSubject', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Welcome to React.js Fundamentals! Set up your workspace"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Add CC</label>
                <input
                  type="text"
                  value={courseData.welcomeEmailCc || ''}
                  onChange={(e) => onChange('welcomeEmailCc', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="academic-admins@yourdomain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Content</label>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  {/* Fake Editor Toolbar */}
                  <div className="bg-slate-50 border-b border-slate-300 px-3 py-2 flex flex-wrap gap-4 items-center text-sm font-medium text-slate-600">
                    <span className="cursor-pointer hover:text-primary-600">File</span>
                    <span className="cursor-pointer hover:text-primary-600">Edit</span>
                    <span className="cursor-pointer hover:text-primary-600">View</span>
                    <span className="cursor-pointer hover:text-primary-600">Insert</span>
                    <span className="cursor-pointer hover:text-primary-600">Format</span>
                    <span className="cursor-pointer hover:text-primary-600">Tools</span>
                    <span className="cursor-pointer hover:text-primary-600">Help</span>
                  </div>
                  <div className="bg-white border-b border-slate-300 px-3 py-1.5 flex items-center gap-4 text-slate-600 overflow-x-auto">
                    <div className="flex items-center gap-1 cursor-pointer px-1 py-0.5 hover:bg-slate-100 rounded">
                      <span className="text-xl leading-none -mt-1 font-serif">↺</span>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer px-1 py-0.5 hover:bg-slate-100 rounded">
                      <span className="text-xl leading-none -mt-1 font-serif scale-x-[-1]">↺</span>
                    </div>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <div className="flex items-center gap-1 cursor-pointer px-1 py-0.5 hover:bg-slate-100 rounded">
                      <span>100%</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <Bold className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                    <Italic className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                    <Underline className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                    <Strikethrough className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <div className="w-4 h-4 rounded bg-blue-900 cursor-pointer flex items-center justify-center border border-slate-300"></div>
                    <ChevronDown className="w-3 h-3 -ml-2 text-slate-400 cursor-pointer" />
                    <Type className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                  </div>

                  <textarea
                    rows={6}
                    value={courseData.welcomeEmailContent || ''}
                    onChange={(e) => onChange('welcomeEmailContent', e.target.value)}
                    className="w-full px-4 py-3 border-none focus:ring-0 resize-y text-slate-700"
                    placeholder="Clarence and Carlette may offset their $95,000 income with the full amount of their $75,000 real estate loss..."
                  />

                  <div className="bg-white border-t border-slate-300 px-3 py-1.5 flex justify-between text-xs text-slate-400">
                    <span>{courseData.welcomeEmailContent ? courseData.welcomeEmailContent.split(' ').filter((w: string) => w.length > 0).length : 0} words</span>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-slate-400"></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Template Variables</label>
                <div className="flex flex-wrap gap-2">
                  {['{{firstName}}', '{{courseName}}', '{{loginUrl}}', '{{instructorName}}', '{{supportEmail}}'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#f0faeb] rounded-xl border border-[#d6f0cb] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-emerald-800 text-sm uppercase">AI Email Writer</h3>
            </div>
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
              Your welcome email can be optimized to boost early module engagement. We suggest embedding a direct link to Week 1 workspace setup in the first paragraph.
            </p>
            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
              Regenerate Optimized Email
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Copy & Clone Course</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Create a carbon duplicate of this module structure, curriculum plans, content resources, and core configurations.
            </p>
            <button className="px-4 py-2 border border-emerald-600 text-emerald-600 font-medium text-sm rounded-lg hover:bg-emerald-50 transition-colors">
              Copy Course
            </button>
          </div>

          <div className="bg-rose-50/30 rounded-xl shadow-sm border border-rose-300 p-5">
            <h3 className="text-sm font-bold text-rose-600 mb-3">Danger Zone</h3>
            <p className="text-xs text-rose-500 mb-4 leading-relaxed">
              Deleting this course permanently purges all course metrics, blueprints, curriculum content, and student access configurations. This action cannot be reversed.
            </p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-500 text-white font-medium text-sm rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </button>
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Course?</h3>
            <p className="text-slate-600 mb-6 text-sm">
              Are you sure you want to delete this course? This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteCourse(courseId!);
                    toast.success('Course deleted successfully');
                    navigate('/partner/courses');
                  } catch (e) {
                    toast.error('Failed to delete course');
                    setShowDeleteModal(false);
                  }
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
