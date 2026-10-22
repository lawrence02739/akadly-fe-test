import React, { useState } from 'react';
import { Link2, Unlink, BookOpen, Layers, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Test } from '../types';
import { useLinkCourse, useUnlinkCourse } from '../hooks/useTests';
import { useListCourses } from '../../courses/hooks/useCourses';
import { useCourseStructure } from '../../courses/hooks/useCourseNodes';

interface CourseLinkCardProps {
  test: Test;
}

export const CourseLinkCard: React.FC<CourseLinkCardProps> = ({ test }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  const linkMutation = useLinkCourse();
  const unlinkMutation = useUnlinkCourse();

  const { data: courses = [], isLoading: isLoadingCourses } = useListCourses();
  const { data: flatNodes = [], isLoading: isLoadingStructure } = useCourseStructure(selectedCourseId);

  const isLinked = Boolean(test.courseLink?.courseId);

  const handleOpenLinkModal = () => {
    setSelectedCourseId(test.courseLink?.courseId || '');
    setSelectedNodeId(test.courseLink?.nodeId || '');
    setModalOpen(true);
  };

  const handleLinkSubmit = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course to link.');
      return;
    }
    try {
      await linkMutation.mutateAsync({
        id: test.id,
        dto: {
          courseId: selectedCourseId,
          nodeId: selectedNodeId || undefined,
        },
      });
      toast.success('Test successfully linked to course');
      setModalOpen(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to link course',
      );
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkMutation.mutateAsync(test.id);
      toast.success('Test unlinked from course');
      setUnlinkConfirmOpen(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || 'Failed to unlink course',
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Link2 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Course Node Link (Optional)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mirror this assessment as an interactive test node in a curriculum
            </p>
          </div>
        </div>

        {isLinked ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check size={13} />
            <span>Linked</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Standalone Library Test
          </span>
        )}
      </div>

      <div className="p-5">
        {isLinked ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                <BookOpen size={15} className="text-indigo-600" />
                <span>{test.courseLink?.courseTitle || 'Course: ' + test.courseLink?.courseId}</span>
              </div>
              {test.courseLink?.nodeTitle && (
                <div className="flex items-center gap-2 text-xs text-slate-600 pl-6">
                  <Layers size={13} className="text-slate-400" />
                  <span>Module: {test.courseLink.nodeTitle}</span>
                </div>
              )}
              <p className="text-2xs text-slate-400 mt-1">
                Mirrored node automatically reflects test duration and questions count.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenLinkModal}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Change Link
              </button>
              <button
                type="button"
                onClick={() => setUnlinkConfirmOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Unlink
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
            <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-xs font-semibold text-slate-700">Not linked to any course node</h4>
            <p className="text-2xs text-slate-400 mt-1 max-w-sm mx-auto">
              You can keep this test standalone or link it into any course curriculum as an assessment module.
            </p>
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Link2 size={14} />
              <span>Link to Course Node</span>
            </button>
          </div>
        )}
      </div>

      {/* Link / Change Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Link2 size={18} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isLinked ? 'Change Course Link' : 'Link Test to Course'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Target Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedNodeId('');
                  }}
                  disabled={isLoadingCourses}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map((c: any) => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourseId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course Node (Lesson / Section) <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={selectedNodeId}
                    onChange={(e) => setSelectedNodeId(e.target.value)}
                    disabled={isLoadingStructure}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-1 focus:ring-indigo-500 font-mono"
                  >
                    <option value="">
                      {isLoadingStructure
                        ? 'Loading course structure...'
                        : 'Select Course Node (Optional)'}
                    </option>
                    {selectedNodeId && !flatNodes.some((n) => n.id === selectedNodeId) && (
                      <option value={selectedNodeId}>
                        📄 {test.courseLink?.nodeTitle || 'Current Linked Node'}
                      </option>
                    )}
                    {flatNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {'\u00A0'.repeat((n.indent || 0) * 4)}
                        {n.type === 'MODULE' ? '📁 ' : n.type === 'ASSIGNMENT' ? '📝 ' : n.type === 'QUIZ' || n.type === 'TEST' ? '⚡ ' : '📄 '}
                        {n.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-2xs text-slate-400 mt-1">
                    Link this test directly to a course lesson, topic, or module
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedCourseId || linkMutation.isPending}
                onClick={handleLinkSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50 transition-colors"
              >
                {linkMutation.isPending ? 'Linking...' : isLinked ? 'Update Link' : 'Confirm Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlink Confirmation Modal */}
      {unlinkConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-5 space-y-4 animate-scale-up">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Unlink size={20} />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900">Unlink from Course?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This removes the mirrored assessment node from the course curriculum. The test itself and all questions in this library are kept safe.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnlinkConfirmOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Keep Link
              </button>
              <button
                type="button"
                disabled={unlinkMutation.isPending}
                onClick={handleUnlink}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {unlinkMutation.isPending ? 'Unlinking...' : 'Yes, Unlink Node'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
