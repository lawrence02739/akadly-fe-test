import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, CheckCircle, X } from 'lucide-react';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { slateToHTML, parseEditorValue } from '../../../../utils/editorUtils';
import { useUpload } from '../../hooks/useUpload';
import { useTags, useCreateTag } from '../../hooks/useMasterData';
import CreatableDropdown from '../../../../shared/components/CreatableDropdown';
import toast from 'react-hot-toast';

// ─── Types (duplicated from BE — no shared types package) ─────────────────────
interface TemplateFile {
  fileUrl: string;
  fileName: string;
}

interface AssignmentContent {
  tags: string[];
  instructions: string;
  availability: 'ALWAYS' | 'SCHEDULED';
  availableFrom?: string;
  dueDate?: string;
  maxScore: number;
  allowLateSubmission: boolean;
  fileUploadRequired: boolean;
  emailNotificationOnSubmission: boolean;
  templateFile?: TemplateFile;
  confirmationMessage: string;
  freePreview: boolean;
}

// ─── Reusable Toggle ──────────────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
    </label>
  );
}

// ─── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  item: any;
  courseId: string;
  onSave: (content: AssignmentContent) => void;
  isSaving: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AssignmentContentEditor({ item, courseId, onSave, isSaving }: Props) {
  const { data: tagsList } = useTags();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();

  // ─── State ────────────────────────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<Descendant[]>(() => parseEditorValue(item.content?.instructions));
  const [availability, setAvailability] = useState<'ALWAYS' | 'SCHEDULED'>('ALWAYS');
  const [availableFrom, setAvailableFrom] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState(0);
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [fileUploadRequired, setFileUploadRequired] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);
  const [templateFile, setTemplateFile] = useState<TemplateFile | undefined>(undefined);
  const [confirmationMessage, setConfirmationMessage] = useState<Descendant[]>(() =>
    parseEditorValue(item.content?.confirmationMessage)
  );
  const [freePreview, setFreePreview] = useState(false);

  // Template file upload local state
  const [templateUploadFile, setTemplateUploadFile] = useState<File | null>(null);
  const templateFileRef = useRef<HTMLInputElement>(null);

  // ─── Reset on node switch ─────────────────────────────────────────────────
  useEffect(() => {
    const c = item.content ?? {};
    setTags(c.tags ?? []);
    setInstructions(parseEditorValue(c.instructions));
    setAvailability(c.availability ?? 'ALWAYS');
    setAvailableFrom(c.availableFrom ?? '');
    setDueDate(c.dueDate ?? '');
    setMaxScore(c.maxScore ?? 0);
    setAllowLateSubmission(c.allowLateSubmission ?? false);
    setFileUploadRequired(c.fileUploadRequired ?? false);
    setEmailNotification(c.emailNotificationOnSubmission ?? false);
    setTemplateFile(c.templateFile ?? undefined);
    setConfirmationMessage(parseEditorValue(c.confirmationMessage));
    setFreePreview(c.freePreview ?? false);
    setTemplateUploadFile(null);
  }, [item.id, item.content]);

  // ─── Template file upload ─────────────────────────────────────────────────
  const handleTemplateUpload = async () => {
    if (!templateUploadFile) return;
    try {
      const key = `courses/assignments/${courseId}/${Date.now()}-${templateUploadFile.name}`;
      const fileUrl = await uploadFile({ file: templateUploadFile, key });
      setTemplateFile({ fileUrl: fileUrl as string, fileName: templateUploadFile.name });
      setTemplateUploadFile(null);
      toast.success('Template uploaded!');
    } catch {
      toast.error('Template upload failed. Please try again.');
    }
  };

  // ─── Save / Cancel ────────────────────────────────────────────────────────
  const handleSave = () => {
    onSave({
      tags,
      instructions: slateToHTML(instructions),
      availability,
      availableFrom: availability === 'SCHEDULED' ? availableFrom : undefined,
      dueDate: availability === 'SCHEDULED' ? dueDate : undefined,
      maxScore,
      allowLateSubmission,
      fileUploadRequired,
      emailNotificationOnSubmission: emailNotification,
      templateFile,
      confirmationMessage: slateToHTML(confirmationMessage),
      freePreview,
    });
  };

  const handleCancel = () => {
    const c = item.content ?? {};
    setTags(c.tags ?? []);
    setInstructions(parseEditorValue(c.instructions));
    setAvailability(c.availability ?? 'ALWAYS');
    setAvailableFrom(c.availableFrom ?? '');
    setDueDate(c.dueDate ?? '');
    setMaxScore(c.maxScore ?? 0);
    setAllowLateSubmission(c.allowLateSubmission ?? false);
    setFileUploadRequired(c.fileUploadRequired ?? false);
    setEmailNotification(c.emailNotificationOnSubmission ?? false);
    setTemplateFile(c.templateFile ?? undefined);
    setConfirmationMessage(parseEditorValue(c.confirmationMessage));
    setFreePreview(c.freePreview ?? false);
    setTemplateUploadFile(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Tags */}
      <CreatableDropdown
        label="Tags"
        items={tagsList ?? []}
        value={tags}
        onChange={setTags}
        onCreate={async (name) => {
          const tag = await createTag(name);
          return tag;
        }}
        isCreating={isCreatingTag}
        multiple
        placeholder="Add tags..."
      />

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Instructions <span className="text-red-500">*</span>
        </label>
        <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <RichTextEditor
            initialValue={instructions}
            className="min-h-[160px] text-sm bg-white"
            placeholder="Describe what learners need to do..."
            onChange={(val: Descendant[]) => setInstructions(val)}
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Availability Settings <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-6">
          {(['ALWAYS', 'SCHEDULED'] as const).map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`availability-${item.id}`}
                value={opt}
                checked={availability === opt}
                onChange={() => setAvailability(opt)}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-700">
                {opt === 'ALWAYS' ? 'Always Available' : 'Time Based'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Scheduled dates */}
      {availability === 'SCHEDULED' && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Available From <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={availableFrom}
              onChange={e => setAvailableFrom(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      )}

      {/* Max Score */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Score</label>
        <input
          type="number"
          min={0}
          value={maxScore}
          onChange={e => setMaxScore(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <ToggleRow
          label="Allow Late Submission"
          description="Learners can submit after the due date"
          checked={allowLateSubmission}
          onChange={setAllowLateSubmission}
        />
        <ToggleRow
          label="File Upload Required"
          description="Learner must attach a file to submit"
          checked={fileUploadRequired}
          onChange={setFileUploadRequired}
        />
        <ToggleRow
          label="Email Notification on Submission"
          description="You'll receive an email when someone submits"
          checked={emailNotification}
          onChange={setEmailNotification}
        />
      </div>

      {/* Upload Template */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Upload Template</label>
        <p className="text-xs text-slate-500 mb-2">
          A template for your learners — they can download it and write their answers
        </p>

        {templateFile ? (
          <div className="flex items-center justify-between p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <p className="text-sm font-medium text-teal-700 truncate max-w-[180px]">
                {templateFile.fileName}
              </p>
            </div>
            <button
              onClick={() => setTemplateFile(undefined)}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Remove template"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-slate-50 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <input
              ref={templateFileRef}
              type="file"
              id={`template-upload-${item.id}`}
              className="hidden"
              onChange={e => e.target.files?.[0] && setTemplateUploadFile(e.target.files[0])}
            />
            {templateUploadFile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">{templateUploadFile.name}</p>
                <button
                  onClick={handleTemplateUpload}
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {isUploading ? 'Uploading…' : 'Upload Template'}
                </button>
              </div>
            ) : (
              <label htmlFor={`template-upload-${item.id}`} className="cursor-pointer">
                <span className="text-sm text-teal-600 font-medium hover:underline">Choose file</span>
                <span className="text-sm text-slate-500"> or drag & drop</span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Message */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Confirmation Message <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">Shown to the learner after they submit</p>
        <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <RichTextEditor
            initialValue={confirmationMessage}
            className="min-h-[100px] text-sm bg-white"
            placeholder="Thank you for submitting the assignment."
            onChange={(val: Descendant[]) => setConfirmationMessage(val)}
          />
        </div>
      </div>

      {/* Free Preview */}
      <ToggleRow
        label="Free Preview Lesson"
        description="Non-enrolled learners can preview this assignment"
        checked={freePreview}
        onChange={setFreePreview}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
