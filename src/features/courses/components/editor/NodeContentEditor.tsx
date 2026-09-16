import { useState, useEffect } from 'react';
import { Upload, Video, FileText, Headphones, File, Link as LinkIcon, Loader2, CheckCircle } from 'lucide-react';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { useUpload } from '../../hooks/useUpload';
import { useUpdateCourseNode } from '../../hooks/useCourseNodes';
import { slateToHTML, parseEditorValue } from '../../../../utils/editorUtils';
import toast from 'react-hot-toast';

// ─── Type Configs ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string; accept?: string; hint?: string }> = {
  VIDEO: { icon: Video,     color: 'text-blue-600',   bgColor: 'bg-blue-50',   label: 'Video',   accept: 'video/*',                   hint: 'MP4, WebM or OGG (max 2GB)' },
  AUDIO: { icon: Headphones,color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Audio',   accept: 'audio/*',                   hint: 'MP3, WAV or M4A (max 500MB)' },
  PDF:   { icon: FileText,  color: 'text-red-600',    bgColor: 'bg-red-50',    label: 'PDF',     accept: 'application/pdf',           hint: 'PDF only (max 100MB)' },
  FILE:  { icon: File,      color: 'text-slate-600',  bgColor: 'bg-slate-100', label: 'File',    accept: '*/*',                       hint: 'Any file type (max 1GB)' },
  MODULE:{ icon: File,      color: 'text-teal-600',   bgColor: 'bg-teal-50',   label: 'Module' },
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

  useEffect(() => {
    setTitle(item.title ?? '');
    setTextContent(parseEditorValue(item.content?.text));
    setHeadingText(item.content?.heading ?? '');
    setHeadingLevel(item.content?.level ?? 'H2');
    setLinkUrl(item.content?.url ?? '');
    setLinkLabel(item.content?.label ?? '');
    setOpenInNewTab(item.content?.newTab ?? true);
  }, [item.id]);

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

  const typesThatAreComingSoon = ['QUIZ', 'TEST', 'CODING', 'ASSIGNMENT', 'FORM', 'LIVE'];

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
    </div>
  );
}
