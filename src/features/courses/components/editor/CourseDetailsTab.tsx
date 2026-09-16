import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import CreatableDropdown from '../../../../shared/components/CreatableDropdown';
import { useCategories, useTags, useCreateCategory, useCreateTag, useInstructors } from '../../hooks/useMasterData';

export default function CourseDetailsTab({ courseData, onChange, onSave, isSaving }: { courseData: any, onChange: (field: string, value: any) => void, onSave: () => void, isSaving: boolean }) {
  const { mutateAsync: uploadFile, isPending } = useUpload();
  const [progress, setProgress] = useState(0);

  const { data: categories } = useCategories();
  const { data: tagsList } = useTags();
  const { data: instructors } = useInstructors();
  const { mutateAsync: createCategory, isPending: isCreatingCategory } = useCreateCategory();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const key = `courses/thumbnails/${Date.now()}-${file.name}`;
        const fileUrl = await uploadFile({
          file,
          key,
          onProgress: (p) => setProgress(p)
        });
        // Store the full S3 public URL
        onChange('thumbnail', fileUrl);
        toast.success('Thumbnail uploaded successfully!');
      } catch (err) {
        toast.error('Failed to upload thumbnail');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center justify-between">
          Course Information
          <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center">
            <span className="text-xs">✨</span>
          </div>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={courseData.title || ''}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Course Title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              value={courseData.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={5}
              placeholder="Describe your course..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
              <select
                value={courseData.level || ''}
                onChange={(e) => onChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
              <select
                value={courseData.language || ''}
                onChange={(e) => onChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CreatableDropdown
                label="Category"
                items={categories || []}
                value={courseData.category || ''}
                onChange={(val: any) => onChange('category', val)}
                onCreate={(name: string) => createCategory(name)}
                isCreating={isCreatingCategory}
                placeholder="Select or type a category..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
              <select
                value={courseData.instructor || ''}
                onChange={(e) => onChange('instructor', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Instructor</option>
                {instructors?.map((inst: any) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CreatableDropdown
                label="Tags"
                items={tagsList || []}
                value={courseData.tags || []}
                onChange={(val: any) => onChange('tags', val)}
                onCreate={(name: string) => createTag(name)}
                isCreating={isCreatingTag}
                multiple={true}
                placeholder="Select or type tags..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={courseData.status || 'DRAFT'}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Course Thumbnail</label>
            <div className="flex gap-6">
              <div className="w-64 h-36 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {courseData.thumbnail ? (
                  <img src={courseData.thumbnail} alt="Course Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-500">
                  Upload your course image here. It must meet our course image quality standards to be accepted.
                  Important guidelines: 750x422 pixels; .jpg, .jpeg, .gif, or .png. no text on the image.
                </p>
                <div>
                  <input type="file" id="thumbnail" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                  <label htmlFor="thumbnail" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </label>
                </div>
                {isPending && (
                  <div className="w-full max-w-xs mt-2">
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-900 border-t border-primary-800 px-6 py-4 flex items-center justify-end gap-4 z-10">
        <button className="px-6 py-2 border border-slate-400 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors">
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 bg-white text-primary-900 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
