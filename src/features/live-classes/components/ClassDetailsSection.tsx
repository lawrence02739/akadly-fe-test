import React, { useState } from 'react';
import { MultiSelect } from '../../../shared/components/MultiSelect';

export interface OptionItem {
  id: string;
  name: string;
  specialty?: string;
  enrolledCount?: number;
  capacity?: number;
}

export interface NodeItem {
  id: string;
  title: string;
}

interface ClassDetailsSectionProps {
  courseId: string;
  onCourseChange: (courseId: string) => void;
  batchId: string;
  onBatchChange: (batchId: string) => void;
  title: string;
  onTitleChange: (title: string, courseNodeId?: string) => void;
  instructorId: string;
  onInstructorChange: (id: string) => void;
  coInstructorIds: string[];
  onCoInstructorsChange: (ids: string[]) => void;
  supportStaffId: string;
  onSupportStaffChange: (id: string) => void;
  agenda: string;
  onAgendaChange: (agenda: string) => void;

  courses: OptionItem[];
  batches: OptionItem[];
  instructors: OptionItem[];
  supportStaffList: OptionItem[];
  liveClassNodes?: NodeItem[];
  isEditMode?: boolean;
  fieldErrors?: {
    course?: string;
    batch?: string;
    title?: string;
    instructor?: string;
  };
}

export const ClassDetailsSection: React.FC<ClassDetailsSectionProps> = ({
  courseId,
  onCourseChange,
  batchId,
  onBatchChange,
  title,
  onTitleChange,
  instructorId,
  onInstructorChange,
  coInstructorIds,
  onCoInstructorsChange,
  supportStaffId,
  onSupportStaffChange,
  agenda,
  onAgendaChange,
  courses,
  batches,
  instructors,
  supportStaffList,
  liveClassNodes = [],
  isEditMode = false,
  fieldErrors,
}) => {
  const [showNodeSuggestions, setShowNodeSuggestions] = useState(false);

  // Available co-instructors: exclude primary instructor
  const availableCoInstructors = instructors
    .filter((ins) => ins.id !== instructorId)
    .map((ins) => ({
      id: ins.id,
      name: `${ins.name}${ins.specialty ? ` (${ins.specialty})` : ''}`,
    }));

  const filteredNodes = liveClassNodes.filter((node) =>
    node.title.toLowerCase().includes(title.toLowerCase()),
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 uppercase tracking-wider text-xs">
        Class Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Course select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Course <span className="text-rose-500">*</span>
          </label>
          <select
            value={courseId}
            onChange={(e) => onCourseChange(e.target.value)}
            disabled={isEditMode}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer ${
              fieldErrors?.course ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
            }`}
          >
            <option value="">Select a course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors?.course && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.course}</p>
          )}
          {isEditMode && (
            <p className="text-[11px] text-slate-400 mt-1">
              Course cannot be changed in existing series
            </p>
          )}
        </div>

        {/* Batch select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Batch <span className="text-rose-500">*</span>
          </label>
          <select
            value={batchId}
            onChange={(e) => onBatchChange(e.target.value)}
            disabled={isEditMode || !courseId}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer ${
              fieldErrors?.batch ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
            }`}
          >
            <option value="">
              {!courseId ? 'Select a course first' : 'Select a batch...'}
            </option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}{' '}
                {b.enrolledCount !== undefined
                  ? `· ${b.enrolledCount} students`
                  : ''}
              </option>
            ))}
          </select>
          {fieldErrors?.batch && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.batch}</p>
          )}
        </div>
      </div>

      {/* Session Title with suggested LIVE_CLASS nodes */}
      <div className="relative">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Session Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            onTitleChange(e.target.value, undefined);
            setShowNodeSuggestions(true);
          }}
          onFocus={() => setShowNodeSuggestions(true)}
          onBlur={() => {
            // small timeout to allow clicking suggestion
            setTimeout(() => setShowNodeSuggestions(false), 200);
          }}
          placeholder="e.g. Prototyping & Usability Testing"
          className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${
            fieldErrors?.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
          }`}
        />
        {fieldErrors?.title && (
          <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.title}</p>
        )}

        {/* Suggested Live Class nodes from syllabus */}
        {showNodeSuggestions && filteredNodes.length > 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
              Suggested Syllabus Nodes
            </div>
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onMouseDown={() => {
                  onTitleChange(node.title, node.id);
                  setShowNodeSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors cursor-pointer"
              >
                {node.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructor & Co-instructors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Instructor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Instructor{' '}
            <span className="text-[11px] text-slate-400 font-normal">
              (Optional for draft)
            </span>
          </label>
          <select
            value={instructorId}
            onChange={(e) => onInstructorChange(e.target.value)}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
              fieldErrors?.instructor ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
            }`}
          >
            <option value="">Select instructor...</option>
            {instructors.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.name} {ins.specialty ? `(${ins.specialty})` : ''}
              </option>
            ))}
          </select>
          {fieldErrors?.instructor && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.instructor}</p>
          )}
        </div>

        {/* Co-instructors MultiSelect */}
        <div>
          <MultiSelect
            label="Co-instructors"
            items={availableCoInstructors}
            value={coInstructorIds}
            onChange={onCoInstructorsChange}
            placeholder="Select co-instructors..."
          />
        </div>
      </div>

      {/* Support Staff */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Support Staff Host{' '}
          <span className="text-[11px] text-slate-400 font-normal">
            (Active workspace user)
          </span>
        </label>
        <select
          value={supportStaffId}
          onChange={(e) => onSupportStaffChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">None (No support host)</option>
          {supportStaffList.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      {/* Agenda */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Agenda / Topics Covered
        </label>
        <textarea
          value={agenda}
          onChange={(e) => onAgendaChange(e.target.value)}
          rows={3}
          placeholder="Topics to discuss, preparation materials, interactive exercises..."
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>
    </div>
  );
};
