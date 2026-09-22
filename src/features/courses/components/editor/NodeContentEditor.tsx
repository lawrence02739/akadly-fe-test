import { useState, useEffect } from 'react';
import { Upload, Video, FileText, Headphones, File, Link as LinkIcon, Loader2, CheckCircle, HelpCircle, ExternalLink, Trash2, ClipboardCheck, Radio, Code2 } from 'lucide-react';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { useUpload } from '../../hooks/useUpload';
import { useUpdateCourseNode } from '../../hooks/useCourseNodes';
import { slateToHTML, parseEditorValue } from '../../../../utils/editorUtils';
import toast from 'react-hot-toast';
import AssessmentLibraryModal from './AssessmentLibraryModal';
import AssignmentContentEditor from './AssignmentContentEditor';
import LiveClassContentEditor from './LiveClassContentEditor';
import CodingContentEditor from './CodingContentEditor';
import FormContentEditor from './FormContentEditor';
// ─── Type Configs ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string; accept?: string; hint?: string }> = {
  VIDEO: { icon: Video, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Video', accept: 'video/*', hint: 'MP4, WebM or OGG (max 2GB)' },
  AUDIO: { icon: Headphones, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Audio', accept: 'audio/*', hint: 'MP3, WAV or M4A (max 500MB)' },
  PDF: { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-50', label: 'PDF', accept: 'application/pdf', hint: 'PDF only (max 100MB)' },
  FILE: { icon: File, color: 'text-slate-600', bgColor: 'bg-slate-100', label: 'File', accept: '*/*', hint: 'Any file type (max 1GB)' },
  MODULE: { icon: File, color: 'text-teal-600', bgColor: 'bg-teal-50', label: 'Module' },
  QUIZ: { icon: HelpCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Quiz' },
  ASSIGNMENT: { icon: ClipboardCheck, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Assignment' },
  LIVE_CLASS: { icon: Radio, color: 'text-rose-600', bgColor: 'bg-rose-50', label: 'Live Class' },
  CODING: { icon: Code2, color: 'text-indigo-600', bgColor: 'bg-indigo-50', label: 'Coding' },
};

// ─── Shared Upload UI ─────────────────────────────────────────────────────────
function FileUploadPanel({
  type, courseId, nodeId, content, onSave
}: { type: string; courseId: string; nodeId: string; content?: any; onSave: (content: any) => void }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg?.icon ?? File;

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(content?.sourceType === 'upload' ? content?.fileUrl : '');
  const [externalUrl, setExternalUrl] = useState(content?.sourceType === 'url' ? content?.fileUrl : '');
  const [tab, setTab] = useState<'upload' | 'url'>(content?.sourceType === 'url' ? 'url' : 'upload');

  useEffect(() => {
    setUploadedUrl(content?.sourceType === 'upload' ? content?.fileUrl : '');
    setExternalUrl(content?.sourceType === 'url' ? content?.fileUrl : '');
    setTab(content?.sourceType === 'url' ? 'url' : 'upload');
    setFile(null);
    setProgress(0);
  }, [content, nodeId]);

  const { mutateAsync: uploadFile, isPending } = useUpload();

  const handleUpload = async () => {
    if (!file) return;
    try {
      const prefix = `courses/${type.toLowerCase()}s`;
      const key = `${prefix}/${courseId}/${Date.now()}-${file.name}`;
      const fileUrl = await uploadFile({ file, key, onProgress: setProgress });
      setUploadedUrl(fileUrl as string);
      toast.success(`${cfg?.label ?? type} uploaded!`);
    } catch {
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleSave = () => {
    const url = tab === 'url' ? externalUrl : uploadedUrl;
    onSave({ fileUrl: url, sourceType: tab });
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600'}`}
        >
          <Upload className="w-4 h-4" /> Upload File
        </button>
        <button
          onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'url' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600'}`}
        >
          <LinkIcon className="w-4 h-4" /> External URL
        </button>
      </div>

      {tab === 'upload' ? (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center text-center hover:bg-slate-50 transition-colors">
          <div className={`w-12 h-12 rounded-full ${cfg?.bgColor ?? 'bg-slate-100'} ${cfg?.color ?? 'text-slate-600'} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6" />
          </div>
          {uploadedUrl ? (
            <>
              <CheckCircle className="w-6 h-6 text-teal-600 mb-2" />
              <p className="text-sm font-medium text-teal-700 mb-1">Uploaded successfully!</p>
              <p className="text-xs text-slate-400 break-all">{uploadedUrl}</p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Click to upload or drag & drop</h3>
              <p className="text-xs text-slate-500 mb-4">{cfg?.hint}</p>
              <input type="file" id={`file-upload-${nodeId}`} accept={cfg?.accept} className="hidden"
                onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
              <label htmlFor={`file-upload-${nodeId}`} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                Select {cfg?.label ?? 'File'}
              </label>
              {file && <p className="mt-3 text-sm font-medium text-slate-700">{file.name}</p>}
              {isPending && (
                <div className="w-full max-w-xs mt-4">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${cfg?.bgColor ?? 'bg-slate-400'} transition-all duration-300`} style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{progress}% uploaded</p>
                </div>
              )}
              {file && !isPending && (
                <button onClick={handleUpload} className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800">
                  Start Upload
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">External URL</label>
          <input
            type="url"
            value={externalUrl}
            onChange={e => setExternalUrl(e.target.value)}
            placeholder="https://example.com/file.mp4"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={tab === 'upload' ? !uploadedUrl : !externalUrl}
        className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Save Content
      </button>
    </div>
  );
}

// ─── Main Dispatcher Component ────────────────────────────────────────────────
export default function NodeContentEditor({
  item,
  courseId,
}: {
  item: any;
  courseId: string;
  onClose?: () => void;
}) {
  const { mutate: updateNode, isPending: isSaving } = useUpdateCourseNode();

  const [title, setTitle] = useState(item.title ?? '');
  const [textContent, setTextContent] = useState<Descendant[]>(() => parseEditorValue(item.content?.text));
  const [headingText, setHeadingText] = useState(item.content?.heading ?? '');
  const [headingLevel, setHeadingLevel] = useState(item.content?.level ?? 'H2');
  const [linkUrl, setLinkUrl] = useState(item.content?.url ?? '');
  const [linkLabel, setLinkLabel] = useState(item.content?.label ?? '');
  const [openInNewTab, setOpenInNewTab] = useState(item.content?.newTab ?? true);

  // Quiz/Test specific state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [linkedQuiz, setLinkedQuiz] = useState<any>(item.content?.linkedQuiz ?? null);
  const [quizSettings, setQuizSettings] = useState({
    timeLimitMinutes: item.content?.timeLimitMinutes ?? 0,
    passScore: item.content?.passScore ?? 0,
    randomize: item.content?.randomize ?? false,
    showCorrectAnswers: item.content?.showCorrectAnswers ?? false,
    freePreview: item.content?.freePreview ?? false,
  });

  useEffect(() => {
    setTitle(item.title ?? '');
    setTextContent(parseEditorValue(item.content?.text));
    setHeadingText(item.content?.heading ?? '');
    setHeadingLevel(item.content?.level ?? 'H2');
    setLinkUrl(item.content?.url ?? '');
    setLinkLabel(item.content?.label ?? '');
    setOpenInNewTab(item.content?.newTab ?? true);
    setLinkedQuiz(item.content?.linkedQuiz ?? null);
    setQuizSettings({
      timeLimitMinutes: item.content?.timeLimitMinutes ?? 0,
      passScore: item.content?.passScore ?? 0,
      randomize: item.content?.randomize ?? false,
      showCorrectAnswers: item.content?.showCorrectAnswers ?? false,
      freePreview: item.content?.freePreview ?? false,
    });
  }, [item.id, item.content]);

  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg?.icon ?? File;

  const handleSaveContent = (content: any) => {
    updateNode(
      { courseId, nodeId: item.id, dto: { title, content } },
      {
        onSuccess: () => toast.success('Content saved!'),
        onError: () => toast.error('Failed to save content.'),
      }
    );
  };

  const handleSaveTextual = (content: any) => {
    updateNode(
      { courseId, nodeId: item.id, dto: { title, content } },
      {
        onSuccess: () => toast.success('Saved!'),
        onError: () => toast.error('Failed to save.'),
      }
    );
  };

  const handleSaveQuiz = () => {
    const content = {
      linkedQuiz,
      ...quizSettings
    };
    updateNode(
      { courseId, nodeId: item.id, dto: { title, content } },
      {
        onSuccess: () => toast.success('Quiz settings saved!'),
        onError: () => toast.error('Failed to save quiz settings.'),
      }
    );
  };

  const typesThatAreComingSoon: string[] = [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 shrink-0">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          {cfg ? (
            <div className={`w-8 h-8 rounded ${cfg.bgColor} ${cfg.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
              <File className="w-4 h-4" />
            </div>
          )}
          <span className="truncate">{item.title}</span>
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{item.type}</span>
        </h2>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Title (always shown) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Type-specific content */}
        {['VIDEO', 'AUDIO', 'PDF', 'FILE'].includes(item.type) && (
          <FileUploadPanel type={item.type} courseId={courseId} nodeId={item.id} content={item.content} onSave={handleSaveContent} />
        )}

        {item.type === 'TEXT' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Body Text</label>
              <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
                <RichTextEditor
                  initialValue={textContent}
                  className="min-h-[250px] text-sm bg-white"
                  placeholder="Write your lesson text here..."
                  onChange={(val: Descendant[]) => setTextContent(val)}
                />
              </div>
            </div>
            <button
              onClick={() => handleSaveTextual({ text: slateToHTML(textContent) })}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Content
            </button>
          </>
        )}

        {item.type === 'HEADING' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heading Text</label>
              <input
                type="text"
                value={headingText}
                onChange={e => setHeadingText(e.target.value)}
                placeholder="Enter heading text..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Heading Level</label>
              <select
                value={headingLevel}
                onChange={e => setHeadingLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="H1">H1 — Large Title</option>
                <option value="H2">H2 — Section Title</option>
                <option value="H3">H3 — Subsection</option>
                <option value="H4">H4 — Small Heading</option>
              </select>
            </div>
            {headingText && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Preview</p>
                {headingLevel === 'H1' && <h1 className="text-2xl font-bold text-slate-800">{headingText}</h1>}
                {headingLevel === 'H2' && <h2 className="text-xl font-bold text-slate-800">{headingText}</h2>}
                {headingLevel === 'H3' && <h3 className="text-lg font-semibold text-slate-800">{headingText}</h3>}
                {headingLevel === 'H4' && <h4 className="text-base font-semibold text-slate-700">{headingText}</h4>}
              </div>
            )}
            <button
              onClick={() => handleSaveTextual({ heading: headingText, level: headingLevel })}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Heading
            </button>
          </>
        )}

        {item.type === 'LINK' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link Label (Optional)</label>
              <input
                type="text"
                value={linkLabel}
                onChange={e => setLinkLabel(e.target.value)}
                placeholder="Click here"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Open in New Tab</p>
                <p className="text-xs text-slate-500">Link opens in a new browser tab</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={openInNewTab} onChange={e => setOpenInNewTab(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
            <button
              onClick={() => handleSaveTextual({ url: linkUrl, label: linkLabel, newTab: openInNewTab })}
              disabled={isSaving || !linkUrl}
              className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Link
            </button>
          </>
        )}

        {item.type === 'MODULE' && (
          <button
            onClick={() => updateNode({ courseId, nodeId: item.id, dto: { title } }, { onSuccess: () => toast.success('Module saved!') })}
            disabled={isSaving}
            className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Module
          </button>
        )}

        {(item.type === 'QUIZ' || item.type === 'TEST') && (
          <div className="space-y-4">
            {!linkedQuiz ? (
              <button
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-sm font-semibold text-teal-600 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                + Link {item.type === 'QUIZ' ? 'Quiz' : 'Test'} from Library
              </button>
            ) : (
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{linkedQuiz.title}</h3>
                  <p className="text-xs text-slate-500">{linkedQuiz.questionCount || (linkedQuiz.questionIds ? linkedQuiz.questionIds.length : 0)} Questions</p>
                </div>
                <button onClick={() => setLinkedQuiz(null)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit (Min)</label>
                <input
                  type="number"
                  value={quizSettings.timeLimitMinutes}
                  onChange={e => setQuizSettings(s => ({ ...s, timeLimitMinutes: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
                <input
                  type="number"
                  value={quizSettings.passScore}
                  onChange={e => setQuizSettings(s => ({ ...s, passScore: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={quizSettings.randomize} onChange={e => setQuizSettings(s => ({ ...s, randomize: e.target.checked }))} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                Randomize Questions
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={quizSettings.showCorrectAnswers} onChange={e => setQuizSettings(s => ({ ...s, showCorrectAnswers: e.target.checked }))} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                Show Correct Answers after submission
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={quizSettings.freePreview} onChange={e => setQuizSettings(s => ({ ...s, freePreview: e.target.checked }))} className="rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                Free Preview Lesson
              </label>
            </div>

            {linkedQuiz && (
              <a href={item.type === 'QUIZ' ? `/partner/quiz-studio?quizId=${linkedQuiz.id}` : `/partner/test-studio?testId=${linkedQuiz.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                Open Fullscreen Editor <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={handleSaveQuiz}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        )}

        {item.type === 'ASSIGNMENT' && (
          <AssignmentContentEditor
            item={item}
            courseId={courseId}
            onSave={handleSaveContent}
            isSaving={isSaving}
          />
        )}

        {item.type === 'LIVE_CLASS' && (
          <LiveClassContentEditor
            item={item}
            courseId={courseId}
            onSave={handleSaveContent}
            isSaving={isSaving}
          />
        )}

        {item.type === 'CODING' && (
          <CodingContentEditor
            item={item}
            courseId={courseId}
            onSave={handleSaveContent}
            isSaving={isSaving}
          />
        )}

        {item.type === 'FORM' && (
          <FormContentEditor
            item={item}
            isSaving={isSaving}
            onSaveContent={handleSaveContent}
            onCancel={() => {}}
          />
        )}

        {typesThatAreComingSoon.includes(item.type) && (
          <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
            <div className="text-4xl">🚧</div>
            <p className="text-slate-600 font-semibold">Coming Soon</p>
            <p className="text-sm text-slate-400 max-w-[200px]">
              The <span className="font-bold">{item.type}</span> editor will be available in a future update.
            </p>
          </div>
        )}
      </div>

      <AssessmentLibraryModal
        isOpen={isQuizModalOpen}
        type={item.type === 'TEST' ? 'TEST' : 'QUIZ'}
        onClose={() => setIsQuizModalOpen(false)}
        onSelect={(q) => setLinkedQuiz(q)}
      />
    </div>
  );
}
