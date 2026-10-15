import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useListCourses } from '../../courses/hooks/useCourses';
import { fetchCourseStructure } from '../../courses/api/courses.api';

export interface FlatCourseNode {
  id: string;
  title: string;
  type: string;
  indent: number;
}

export interface CourseNodeSelectProps {
  courseId: string;
  nodeId?: string;
  initialCourseTitle?: string;
  initialNodeTitle?: string;
  onCourseChange: (courseId: string) => void;
  onNodeChange: (nodeId: string) => void;
  disabled?: boolean;
  required?: boolean;
  courseLabel?: string;
  nodeLabel?: string;
  className?: string;
  allowEntireCourse?: boolean;
}

export function CourseNodeSelect({
  courseId,
  nodeId = '',
  initialCourseTitle = '',
  initialNodeTitle = '',
  onCourseChange,
  onNodeChange,
  disabled = false,
  required = false,
  courseLabel = 'Course',
  nodeLabel = 'Lesson',
  className = 'space-y-3',
  allowEntireCourse = true,
}: CourseNodeSelectProps) {
  const { data: rawCourses, isLoading: isLoadingCourses } = useListCourses();
  const [flatNodes, setFlatNodes] = useState<FlatCourseNode[]>([]);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);

  const courses: any[] = Array.isArray(rawCourses)
    ? rawCourses
    : Array.isArray((rawCourses as any)?.items)
      ? (rawCourses as any).items
      : Array.isArray((rawCourses as any)?.data)
        ? (rawCourses as any).data
        : [];

  useEffect(() => {
    let isMounted = true;
    if (!courseId) {
      setFlatNodes([]);
      setIsLoadingNodes(false);
      return;
    }

    setIsLoadingNodes(true);
    fetchCourseStructure(courseId)
      .then((tree) => {
        if (!isMounted) return;
        let list = tree;
        if (!Array.isArray(list) && Array.isArray(list?.data)) {
          list = list.data;
        }
        if (!Array.isArray(list)) {
          list = [];
        }

        const flat: FlatCourseNode[] = [];
        const flatten = (nodes: any[], depth: number = 0) => {
          nodes.forEach((n) => {
            flat.push({
              id: String(n.id || n._id),
              title: n.title,
              type: n.type,
              indent: depth,
            });
            if (n.children && Array.isArray(n.children)) {
              flatten(n.children, depth + 1);
            }
          });
        };
        flatten(list);
        setFlatNodes(flat);
      })
      .catch((err) => {
        console.error('Failed to fetch course structure', err);
        if (isMounted) setFlatNodes([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingNodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const handleCourseSelect = (newCourseId: string) => {
    onCourseChange(newCourseId);
    onNodeChange('');
  };

  const hasSelectedCourseInList = courses.some(
    (c: any) => String(c.id || c._id) === courseId,
  );
  const hasSelectedNodeInList = flatNodes.some((l) => l.id === nodeId);

  return (
    <div className={className}>
      {/* Course Select Field */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          {courseLabel} {required && <span className="text-rose-500">*</span>}
        </label>
        {isLoadingCourses && courses.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
            Loading courses...
          </div>
        ) : (
          <select
            value={courseId}
            disabled={disabled}
            required={required}
            onChange={(e) => handleCourseSelect(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select a course...</option>
            {courseId && !hasSelectedCourseInList && (
              <option value={courseId}>
                {initialCourseTitle || 'Current Linked Course'}
              </option>
            )}
            {courses.map((c: any) => {
              const id = String(c.id || c._id);
              return (
                <option key={id} value={id}>
                  {c.title}
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Lesson / Node Tree Select Field */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          {nodeLabel}
        </label>
        {isLoadingNodes && flatNodes.length === 0 ? (
          <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
            Loading course structure...
          </div>
        ) : (
          <select
            value={nodeId}
            disabled={disabled || !courseId}
            onChange={(e) => onNodeChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-400 font-mono"
          >
            <option value="">
              {!courseId
                ? 'Select a course first'
                : allowEntireCourse
                  ? 'Select a lesson node (or entire course)'
                  : 'Select a lesson node'}
            </option>
            {nodeId && !hasSelectedNodeInList && (
              <option value={nodeId}>
                📄 {initialNodeTitle || 'Current Linked Lesson / Node'}
              </option>
            )}
            {flatNodes.map((l) => (
              <option key={l.id} value={l.id}>
                {'\u00A0'.repeat(l.indent * 4)}
                {l.type === 'MODULE' ? '📁 ' : '📄 '}
                {l.title}
              </option>
            ))}
          </select>
        )}
        <p className="text-[11px] text-slate-400 mt-1">
          Select the specific lesson node or attach to the course.
        </p>
      </div>
    </div>
  );
}
