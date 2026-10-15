import { BookOpen, ExternalLink, Link2Off, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MediaLinkedCourse } from '../types';
import { useUnlinkMedia } from '../hooks/useMediaLibrary';

interface Props {
  assetId: string;
  linkedCourses: MediaLinkedCourse[];
  onOpenLinkModal: () => void;
}

export function LinkedCoursesCard({
  assetId,
  linkedCourses,
  onOpenLinkModal,
}: Props) {
  const navigate = useNavigate();
  const { mutate: unlink, isPending: isUnlinking } = useUnlinkMedia();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Linked Courses ({linkedCourses.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onOpenLinkModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Link to Course
        </button>
      </div>

      {linkedCourses.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-600">
            Not linked to any courses yet
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            You can link this asset to courses, or select it directly inside the
            Course Builder.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {linkedCourses.map((lc) => (
            <div key={lc.courseId} className="py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4
                    onClick={() =>
                      navigate(
                        `/partner/courses/${lc.courseId}/structure`,
                      )
                    }
                    className="text-xs font-semibold text-slate-800 hover:text-primary-600 cursor-pointer flex items-center gap-1.5 group"
                  >
                    {lc.courseTitle}
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary-600" />
                  </h4>

                  {/* Nodes listing */}
                  {lc.nodes.length > 0 ? (
                    <div className="mt-2 pl-3 border-l-2 border-slate-200 space-y-1">
                      {lc.nodes.map((node) => (
                        <div
                          key={node.nodeId}
                          className="text-[11px] text-slate-600 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                          <span>
                            {node.moduleTitle
                              ? `${node.moduleTitle} › `
                              : ''}
                            <span className="font-medium text-slate-700">
                              {node.nodeTitle}
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({node.usageType.toLowerCase().replace('_', ' ')})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1 pl-3">
                      Course library reference (not attached to specific lesson node)
                    </p>
                  )}
                </div>

                {/* Unlink button */}
                <button
                  type="button"
                  onClick={() =>
                    unlink({ assetId, courseId: lc.courseId })
                  }
                  disabled={isUnlinking}
                  title="Unlink from this course"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                >
                  <Link2Off className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
