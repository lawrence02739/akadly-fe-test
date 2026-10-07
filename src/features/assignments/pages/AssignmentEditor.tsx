import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assignmentApi } from '../api/assignments.api';
import { listCourses } from '../../courses/api/courses.api';
import { listBatches } from '../../batches/api/batches.api';
import { teamApi } from '../../team/api/team.api';
import { getPresignedUploadUrl, uploadToS3 } from '../../courses/api/uploads.api';
import toast from 'react-hot-toast';
import { ArrowLeft, Eye, ArrowRight, Upload, AlignLeft, Link as LinkIcon, Paperclip, FileText, Trash2, Calendar } from 'lucide-react';
import clsx from 'clsx';

export default function AssignmentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for Assignment Details
  const [title, setTitle] = useState('');
  const [instructionsHtml, setInstructionsHtml] = useState('');
  
  // State for Submission Settings
  const [submissionTypes, setSubmissionTypes] = useState<string[]>(['FILE', 'TEXT', 'LINK']);
  const [acceptedFileTypes, setAcceptedFileTypes] = useState('PDF, DOC, DOCX, RTF');
  const [maxFileSize, setMaxFileSize] = useState('50 MB');
  const [attemptLimit, setAttemptLimit] = useState('2 attempts');
  const [allowReplacement, setAllowReplacement] = useState(true);

  // State for Availability
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [graderUserId, setGraderUserId] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Dynamic Options
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [graders, setGraders] = useState<any[]>([]);

  // Attachments
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      listCourses().then(res => setCourses(res)),
      listBatches({ pageSize: 100 }).then(res => setBatches(res.items)),
      teamApi.members({ pageSize: 100 }).then(res => setGraders(res.data))
    ]).catch(() => console.error('Failed to load form options'));

    if (id) {
      setLoading(true);
      assignmentApi.get(id)
        .then(data => {
          setTitle(data.title);
          setInstructionsHtml(data.instructionsHtml);
          if (data.availability) {
            setCourseId(data.availability.courseId || '');
            setBatchId(data.availability.batchId || '');
            if (data.availability.publishAt) setPublishDate(new Date(data.availability.publishAt).toISOString().slice(0, 16));
            if (data.availability.dueAt) setDueDate(new Date(data.availability.dueAt).toISOString().slice(0, 16));
            setTimezone(data.availability.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
          }
          if (data.grading?.defaultGraderUserId) setGraderUserId(data.grading.defaultGraderUserId);
          if (data.attachments) setAttachments(data.attachments);
        })
        .catch(() => toast.error('Failed to load assignment'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const toggleSubmissionType = (type: string) => {
    setSubmissionTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { uploadUrl, fileKey } = await getPresignedUploadUrl(file.name, file.type);
      await uploadToS3(uploadUrl, file);
      
      setAttachments(prev => [...prev, {
        key: fileKey,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size
      }]);
      toast.success('File attached');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleSave = async (publish = false) => {
    if (!title) {
      toast.error('Assignment title is required');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title,
        instructionsHtml,
        attachments,
        submission: {
          allowedTypes: submissionTypes as any[],
          file: { acceptedExtensions: acceptedFileTypes.split(',').map(s => s.trim()), maxFileSizeMb: parseInt(maxFileSize) || 50 },
          attemptLimit: attemptLimit === 'Unlimited' ? null : parseInt(attemptLimit) || 1,
          allowReplacementBeforeDue: allowReplacement,
        },
        availability: {
          courseId: courseId || undefined,
          batchId: batchId || undefined,
          publishAt: publishDate ? new Date(publishDate).toISOString() : undefined,
          dueAt: dueDate ? new Date(dueDate).toISOString() : undefined,
          timezone,
        },
        grading: {
          maxScore: 100,
          defaultGraderUserId: graderUserId || undefined
        }
      };
      
      let savedId = id;
      if (id) {
        await assignmentApi.update(id, payload);
        toast.success('Assignment updated');
      } else {
        const res = await assignmentApi.create(payload);
        savedId = res.id;
        toast.success('Assignment created');
      }

      if (publish && savedId) {
        await assignmentApi.publish(savedId);
        toast.success('Assignment published');
      }

      if (!id && savedId) {
        navigate(`/partner/assignments/${savedId}/edit`, { replace: true });
      }
    } catch (e) {
      toast.error('Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/partner/assignments')}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Assignment</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure the learning activity, submission experience, grading, and late-work policy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-teal-600 font-medium mr-2">✓ Saved 10:42 AM</span>
          <button
            className="flex items-center justify-center whitespace-nowrap w-36 gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex items-center justify-center whitespace-nowrap w-36 gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex items-center justify-center whitespace-nowrap w-40 gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            Review & publish
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="space-y-6">
        {/* Card A: Assignment Details */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-5">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Assignment details</h3>
            <p className="mt-1 text-sm text-gray-500">Give learners clear context and expectations.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                Assignment title *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                  placeholder="e.g. Research Essay: Digital Citizenship"
                />
              </div>
            </div>

            <div>
              <label htmlFor="instructions" className="block text-sm font-medium leading-6 text-gray-900">
                Instructions *
              </label>
              <div className="mt-2">
                <div className="rounded-md ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-teal-600">
                  <div className="flex border-b border-gray-200 p-2 gap-1 bg-gray-50 rounded-t-md">
                    {['B', 'I', 'U'].map(format => (
                      <button key={format} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded font-serif font-bold text-sm w-8 h-8">{format}</button>
                    ))}
                    <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><AlignLeft size={16} /></button>
                    <button className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"><LinkIcon size={16} /></button>
                  </div>
                  <textarea
                    id="instructions"
                    rows={8}
                    value={instructionsHtml}
                    onChange={e => setInstructionsHtml(e.target.value)}
                    className="block w-full border-0 py-3 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 bg-transparent"
                    placeholder="Write a 1,500–1,800 word research essay..."
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Rich text · {instructionsHtml.split(/\s+/).filter(w => w.length > 0).length} words · Learners see this exactly as formatted
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium leading-6 text-gray-900">Instruction attachments</h4>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg max-w-sm">
                    <div className="p-2 bg-red-50 text-red-600 rounded">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{att.fileName}</p>
                      <p className="text-xs text-gray-500">{(att.mimeType || '').split('/')[1]?.toUpperCase() || 'FILE'} · {(att.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <label className={clsx("flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors cursor-pointer", uploading && "opacity-50 pointer-events-none")}>
                  <Paperclip size={16} />
                  {uploading ? 'Uploading...' : 'Add attachment'}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card B: Submission Settings */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Submission settings</h3>
              <p className="mt-1 text-sm text-gray-500">Choose how learners can submit their work.</p>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'FILE', label: 'File upload', icon: Upload, sub: 'PDF, DOCX' },
                  { id: 'TEXT', label: 'Text entry', icon: AlignLeft, sub: 'Rich text' },
                  { id: 'LINK', label: 'Website link', icon: LinkIcon, sub: 'One URL' },
                ].map(type => {
                  const selected = submissionTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleSubmissionType(type.id)}
                      className={clsx(
                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                        selected ? "border-cyan-500 bg-cyan-50/10" : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                      <type.icon className={clsx("w-6 h-6 mb-2", selected ? "text-cyan-600" : "text-gray-400")} />
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                      <span className="text-xs text-gray-500 mt-0.5">{type.sub}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Accepted file types</label>
                  <input
                    type="text"
                    value={acceptedFileTypes}
                    onChange={e => setAcceptedFileTypes(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated extensions</p>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Maximum file size</label>
                  <select
                    value={maxFileSize}
                    onChange={e => setMaxFileSize(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  >
                    <option>10 MB</option>
                    <option>25 MB</option>
                    <option>50 MB</option>
                    <option>100 MB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Attempt limit</label>
                  <select
                    value={attemptLimit}
                    onChange={e => setAttemptLimit(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  >
                    <option>1 attempt</option>
                    <option>2 attempts</option>
                    <option>3 attempts</option>
                    <option>Unlimited</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Most recent submission is graded</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <button
                  role="switch"
                  aria-checked={allowReplacement}
                  onClick={() => setAllowReplacement(!allowReplacement)}
                  className={clsx(
                    allowReplacement ? 'bg-teal-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2'
                  )}
                >
                  <span className={clsx(allowReplacement ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out')} />
                </button>
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow replacement before due date</span>
                  <p className="text-xs text-gray-500">Learners may overwrite an ungraded attempt.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Card C: Availability */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-base font-semibold leading-6 text-gray-900">Availability</h3>
              <p className="mt-1 text-sm text-gray-500">Assign the activity to the right learning group.</p>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Course</label>
                  <select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Batch</label>
                  <select
                    value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Batch</option>
                    {batches.filter(b => !courseId || b.courseId === courseId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Grader</label>
                  <select
                    value={graderUserId}
                    onChange={e => setGraderUserId(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Grader</option>
                    {graders.map(g => (
                      <option key={g.userId || g.id} value={g.userId || g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Publish date *</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={publishDate}
                      onChange={e => setPublishDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Due date *</label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Timezone</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-teal-600 sm:text-sm sm:leading-6"
                  >
                    <option>America/New_York (EDT)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
