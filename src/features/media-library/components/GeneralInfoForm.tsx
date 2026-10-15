import { useState } from 'react';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import type { MediaAsset, MediaLinkedCourse, MediaStatus } from '../types';
import { MediaCategorySelect } from './MediaCategorySelect';
import { MediaTagSelect } from './MediaTagSelect';
import { CourseNodeSelect } from './CourseNodeSelect';
import { useUpdateMediaAsset } from '../hooks/useMediaLibrary';

interface Props {
  asset: MediaAsset;
  linkedCourses?: MediaLinkedCourse[];
}

export function GeneralInfoForm({ asset, linkedCourses = [] }: Props) {
  const firstCourse = linkedCourses[0];
  const firstNode = firstCourse?.nodes?.[0];
  const initialCourseId = firstCourse?.courseId || '';
  const initialNodeId = firstNode?.nodeId || '';
  const initialCourseTitle = firstCourse?.courseTitle || '';
  const initialNodeTitle = firstNode?.nodeTitle || '';

  const [title, setTitle] = useState(asset.title);
  const [description, setDescription] = useState(asset.description || '');
  const [categoryId, setCategoryId] = useState(asset.category?.id || '');
  const [subject, setSubject] = useState(asset.subject || '');
  const [topicTag, setTopicTag] = useState(asset.topicTag || '');
  const [tags, setTags] = useState<string[]>(asset.tags || []);
  const [status, setStatus] = useState<MediaStatus>(asset.status);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [nodeId, setNodeId] = useState(initialNodeId);

  const { mutateAsync: updateAsset, isPending: isSaving } =
    useUpdateMediaAsset();

  const [prevAssetId, setPrevAssetId] = useState(asset.id);
  const [prevLinkedCourseId, setPrevLinkedCourseId] = useState(initialCourseId);
  const [prevLinkedNodeId, setPrevLinkedNodeId] = useState(initialNodeId);

  if (
    asset.id !== prevAssetId ||
    initialCourseId !== prevLinkedCourseId ||
    initialNodeId !== prevLinkedNodeId
  ) {
    setPrevAssetId(asset.id);
    setPrevLinkedCourseId(initialCourseId);
    setPrevLinkedNodeId(initialNodeId);
    setTitle(asset.title);
    setDescription(asset.description || '');
    setCategoryId(asset.category?.id || '');
    setSubject(asset.subject || '');
    setTopicTag(asset.topicTag || '');
    setTags(asset.tags || []);
    setStatus(asset.status);
    setCourseId(initialCourseId);
    setNodeId(initialNodeId);
  }

  const isDirty =
    title !== asset.title ||
    description !== (asset.description || '') ||
    categoryId !== (asset.category?.id || '') ||
    subject !== (asset.subject || '') ||
    topicTag !== (asset.topicTag || '') ||
    status !== asset.status ||
    courseId !== initialCourseId ||
    nodeId !== initialNodeId ||
    JSON.stringify(tags) !== JSON.stringify(asset.tags || []);

  const handleReset = () => {
    setTitle(asset.title);
    setDescription(asset.description || '');
    setCategoryId(asset.category?.id || '');
    setSubject(asset.subject || '');
    setTopicTag(asset.topicTag || '');
    setTags(asset.tags || []);
    setStatus(asset.status);
    setCourseId(initialCourseId);
    setNodeId(initialNodeId);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await updateAsset({
      id: asset.id,
      data: {
        title: title.trim(),
        description: description.trim() || null,
        categoryId: categoryId || null,
        subject: subject.trim() || null,
        topicTag: topicTag.trim() || null,
        tags,
        status,
        ...(courseId !== initialCourseId || nodeId !== initialNodeId
          ? { linkCourseId: courseId || null, linkNodeId: nodeId || null }
          : {}),
      },
    });
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          General Information
        </h3>
        {isDirty && (
          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
            Unsaved changes
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add a detailed description for this media asset..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <MediaCategorySelect
              label="Category"
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MediaStatus)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Subject & Topic Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Organic Chemistry"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Topic Tag
            </label>
            <input
              type="text"
              value={topicTag}
              onChange={(e) => setTopicTag(e.target.value)}
              placeholder="e.g. Hydrocarbons"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <MediaTagSelect label="Tags" value={tags} onChange={setTags} />
        </div>

        {/* Course & Node Linking */}
        <div className="pt-3 border-t border-slate-100">
          <CourseNodeSelect
            courseId={courseId}
            nodeId={nodeId}
            initialCourseTitle={initialCourseTitle}
            initialNodeTitle={initialNodeTitle}
            onCourseChange={setCourseId}
            onNodeChange={setNodeId}
            courseLabel="Link to Course (Optional)"
            nodeLabel="Link to Lesson / Node (Optional)"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        {isDirty && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Discard
          </button>
        )}
        <button
          type="submit"
          disabled={!isDirty || isSaving || !title.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
