import { useState } from 'react';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { CourseNodeSelect } from './CourseNodeSelect';
import { useUpdateMediaAsset } from '../hooks/useMediaLibrary';

interface Props {
  isOpen: boolean;
  assetIds: string[];
  initialCourseId?: string;
  initialNodeId?: string;
  initialCourseTitle?: string;
  initialNodeTitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LinkToCourseModal({
  isOpen,
  assetIds,
  initialCourseId = '',
  initialNodeId = '',
  initialCourseTitle = '',
  initialNodeTitle = '',
  onClose,
  onSuccess,
}: Props) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedNodeId, setSelectedNodeId] = useState(initialNodeId);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setSelectedCourseId(initialCourseId);
    setSelectedNodeId(initialNodeId);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: updateAsset } = useUpdateMediaAsset();

  if (!isOpen) return null;

  const handleLink = async () => {
    if (!selectedCourseId || assetIds.length === 0) return;
    setIsSubmitting(true);
    try {
      for (const id of assetIds) {
        await updateAsset({
          id,
          data: {
            linkCourseId: selectedCourseId,
            linkNodeId: selectedNodeId || null,
          },
        });
      }
      setSelectedCourseId('');
      setSelectedNodeId('');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to link media asset(s)', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 space-y-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Link to Course
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach {assetIds.length} asset(s) to a course
            </p>
          </div>
        </div>

        <CourseNodeSelect
          courseId={selectedCourseId}
          nodeId={selectedNodeId}
          initialCourseTitle={initialCourseTitle}
          initialNodeTitle={initialNodeTitle}
          onCourseChange={setSelectedCourseId}
          onNodeChange={setSelectedNodeId}
          disabled={isSubmitting}
          courseLabel="Select Course"
          nodeLabel="Select Lesson / Node"
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLink}
            disabled={!selectedCourseId || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:bg-slate-300 transition-colors shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Confirm Link
          </button>
        </div>
      </div>
    </div>
  );
}
