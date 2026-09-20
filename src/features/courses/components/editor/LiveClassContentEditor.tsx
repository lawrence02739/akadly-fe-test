import { useState, useEffect } from 'react';
import { Loader2, Upload, X, Info } from 'lucide-react';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { slateToHTML, parseEditorValue } from '../../../../utils/editorUtils';
import { useUpload } from '../../hooks/useUpload';
import { useTags, useCreateTag } from '../../hooks/useMasterData';
import CreatableDropdown from '../../../../shared/components/CreatableDropdown';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PrePostInstructions {
  enabled: boolean;
  body: string;
}

interface NotifyOnStart {
  email: boolean;
  webPush: boolean;
  mobilePush: boolean;
}

interface LiveClassContent {
  tags: string[];
  /** ISO datetime — combined from scheduledDate + startTime in the UI */
  availableFrom?: string;
  durationMinutes: number;
  meetingUrl: string;
  useDifferentLearnerLink: boolean;
  learnerJoinUrl?: string;
  preClassInstructions: PrePostInstructions;
  postClassInstructions: PrePostInstructions;
  notifyOnStart: NotifyOnStart;
  reminderMinutesBefore?: number;
  thumbnail?: { fileUrl: string };
  autoRecordSession: boolean;
  freePreview: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
    </label>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
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

/** Combine a date string (YYYY-MM-DD) and time string (HH:mm) into an ISO datetime */
function combineDatetime(date: string, time: string): string | undefined {
  if (!date || !time) return undefined;
  return new Date(`${date}T${time}`).toISOString();
}

/** Split an ISO datetime into { date: 'YYYY-MM-DD', time: 'HH:MM' } */
function splitDatetime(iso?: string): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  try {
    const d = new Date(iso);
    const date = d.toISOString().slice(0, 10);
    const time = d.toTimeString().slice(0, 5);
    return { date, time };
  } catch {
    return { date: '', time: '' };
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  item: any;
  courseId: string;
  onSave: (content: LiveClassContent) => void;
  isSaving: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveClassContentEditor({ item, courseId, onSave, isSaving }: Props) {
  const { data: tagsList } = useTags();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload();

  // ─── State ────────────────────────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [useDiffLearnerLink, setUseDiffLearnerLink] = useState(false);
  const [learnerJoinUrl, setLearnerJoinUrl] = useState('');
  const [preInstructions, setPreInstructions] = useState<PrePostInstructions>({ enabled: false, body: '' });
  const [postInstructions, setPostInstructions] = useState<PrePostInstructions>({ enabled: false, body: '' });
  const [preRichText, setPreRichText] = useState<Descendant[]>(() => parseEditorValue(''));
  const [postRichText, setPostRichText] = useState<Descendant[]>(() => parseEditorValue(''));
  const [notifyOnStart, setNotifyOnStart] = useState<NotifyOnStart>({ email: true, webPush: false, mobilePush: false });
  const [reminderMinutes, setReminderMinutes] = useState<number | ''>('');
  const [thumbnail, setThumbnail] = useState<{ fileUrl: string } | undefined>(undefined);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [autoRecord, setAutoRecord] = useState(false);
  const [freePreview, setFreePreview] = useState(false);

  // ─── Reset on node switch ─────────────────────────────────────────────────
  useEffect(() => {
    const c = item.content ?? {};
    setTags(c.tags ?? []);
    const { date, time } = splitDatetime(c.availableFrom);
    setScheduledDate(date);
    setStartTime(time);
    setDurationMinutes(c.durationMinutes ?? 60);
    setMeetingUrl(c.meetingUrl ?? '');
    setUseDiffLearnerLink(c.useDifferentLearnerLink ?? false);
    setLearnerJoinUrl(c.learnerJoinUrl ?? '');
    const pre = c.preClassInstructions ?? { enabled: false, body: '' };
    const post = c.postClassInstructions ?? { enabled: false, body: '' };
    setPreInstructions(pre);
    setPostInstructions(post);
    setPreRichText(parseEditorValue(pre.body));
    setPostRichText(parseEditorValue(post.body));
    setNotifyOnStart(c.notifyOnStart ?? { email: true, webPush: false, mobilePush: false });
    setReminderMinutes(c.reminderMinutesBefore ?? '');
    setThumbnail(c.thumbnail ?? undefined);
    setThumbnailPreview(c.thumbnail?.fileUrl ?? '');
    setThumbnailFile(null);
    setAutoRecord(c.autoRecordSession ?? false);
    setFreePreview(c.freePreview ?? false);
  }, [item.id, item.content]);

  // ─── Thumbnail upload ─────────────────────────────────────────────────────
  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) return;
    try {
      const key = `courses/live-class-thumbs/${courseId}/${Date.now()}-${thumbnailFile.name}`;
      const fileUrl = await uploadFile({ file: thumbnailFile, key });
      setThumbnail({ fileUrl: fileUrl as string });
      setThumbnailPreview(fileUrl as string);
      setThumbnailFile(null);
      toast.success('Thumbnail uploaded!');
    } catch {
      toast.error('Thumbnail upload failed. Please try again.');
    }
  };

  // ─── Save / Cancel ────────────────────────────────────────────────────────
  const buildContent = (): LiveClassContent => ({
    tags,
    availableFrom: combineDatetime(scheduledDate, startTime),
    durationMinutes,
    meetingUrl,
    useDifferentLearnerLink: useDiffLearnerLink,
    learnerJoinUrl: useDiffLearnerLink ? learnerJoinUrl : undefined,
    preClassInstructions: { enabled: preInstructions.enabled, body: slateToHTML(preRichText) },
    postClassInstructions: { enabled: postInstructions.enabled, body: slateToHTML(postRichText) },
    notifyOnStart,
    reminderMinutesBefore: reminderMinutes !== '' ? Number(reminderMinutes) : undefined,
    thumbnail,
    autoRecordSession: autoRecord,
    freePreview,
  });

  const handleSave = () => onSave(buildContent());

  const handleCancel = () => {
    const c = item.content ?? {};
    setTags(c.tags ?? []);
    const { date, time } = splitDatetime(c.availableFrom);
    setScheduledDate(date);
    setStartTime(time);
    setDurationMinutes(c.durationMinutes ?? 60);
    setMeetingUrl(c.meetingUrl ?? '');
    setUseDiffLearnerLink(c.useDifferentLearnerLink ?? false);
    setLearnerJoinUrl(c.learnerJoinUrl ?? '');
    const pre = c.preClassInstructions ?? { enabled: false, body: '' };
    const post = c.postClassInstructions ?? { enabled: false, body: '' };
    setPreInstructions(pre);
    setPostInstructions(post);
    setPreRichText(parseEditorValue(pre.body));
    setPostRichText(parseEditorValue(post.body));
    setNotifyOnStart(c.notifyOnStart ?? { email: true, webPush: false, mobilePush: false });
    setReminderMinutes(c.reminderMinutesBefore ?? '');
    setThumbnail(c.thumbnail ?? undefined);
    setThumbnailPreview(c.thumbnail?.fileUrl ?? '');
    setThumbnailFile(null);
    setAutoRecord(c.autoRecordSession ?? false);
    setFreePreview(c.freePreview ?? false);
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
        onCreate={async (name) => createTag(name)}
        isCreating={isCreatingTag}
        multiple
        placeholder="Add tags..."
      />

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Scheduled Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          value={durationMinutes}
          onChange={e => setDurationMinutes(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Meeting URL */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Meeting URL <span className="text-red-500">*</span>
        </label>
        <div className="flex items-start gap-2 p-3 mb-2 bg-rose-50 border border-rose-200 rounded-lg">
          <Info className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <p className="text-xs text-rose-700">
            Paste your Zoom, Google Meet, or any custom meeting URL. Learners will use this link to join the session.
          </p>
        </div>
        <input
          type="url"
          value={meetingUrl}
          onChange={e => setMeetingUrl(e.target.value)}
          placeholder="https://meet.google.com/xxx-yyyy-zzz"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Use Different Learner Link */}
      <ToggleRow
        label="Use Different Link for Learners"
        description="Provide a separate join URL for learners"
        checked={useDiffLearnerLink}
        onChange={setUseDiffLearnerLink}
      />

      {useDiffLearnerLink && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Learner Join URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={learnerJoinUrl}
            onChange={e => setLearnerJoinUrl(e.target.value)}
            placeholder="https://meet.google.com/xxx-yyyy-zzz"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
        </div>
      )}

      {/* Pre-class instructions */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Add Pre-Class Instructions</p>
            <p className="text-xs text-slate-500">Share materials for students prior to class</p>
          </div>
          <Toggle
            checked={preInstructions.enabled}
            onChange={v => setPreInstructions(p => ({ ...p, enabled: v }))}
          />
        </div>
        {preInstructions.enabled && (
          <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
            <RichTextEditor
              initialValue={preRichText}
              className="min-h-[120px] text-sm bg-white"
              placeholder="Pre-class preparation materials..."
              onChange={(val: Descendant[]) => setPreRichText(val)}
            />
          </div>
        )}
      </div>

      {/* Post-class instructions */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Add Post-Class Instructions</p>
            <p className="text-xs text-slate-500">Write a summary or final instructions post-class</p>
          </div>
          <Toggle
            checked={postInstructions.enabled}
            onChange={v => setPostInstructions(p => ({ ...p, enabled: v }))}
          />
        </div>
        {postInstructions.enabled && (
          <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
            <RichTextEditor
              initialValue={postRichText}
              className="min-h-[120px] text-sm bg-white"
              placeholder="Post-class summary or next steps..."
              onChange={(val: Descendant[]) => setPostRichText(val)}
            />
          </div>
        )}
      </div>

      {/* Notify on Start */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Notify Learners on Class Start</label>
        <div className="flex gap-5">
          {([
            { key: 'email', label: 'Email' },
            { key: 'webPush', label: 'Web Push' },
            { key: 'mobilePush', label: 'Mobile Push' },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
              <input
                type="checkbox"
                checked={notifyOnStart[key]}
                onChange={e => setNotifyOnStart(n => ({ ...n, [key]: e.target.checked }))}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Reminder */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Remind Learners Before Start
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={reminderMinutes}
            onChange={e => setReminderMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 15"
            className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-sm text-slate-500">minutes before start</span>
        </div>
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Thumbnail <span className="text-xs text-slate-400 font-normal">(Recommended: 600×400px)</span>
        </label>

        {thumbnailPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200">
            <img src={thumbnailPreview} alt="thumbnail preview" className="w-full h-36 object-cover" />
            <button
              onClick={() => { setThumbnail(undefined); setThumbnailPreview(''); }}
              className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded-full shadow text-slate-500 hover:text-red-600"
              title="Remove thumbnail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-slate-50 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              id={`thumb-upload-${item.id}`}
              accept="image/*"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  setThumbnailFile(f);
                  setThumbnailPreview(URL.createObjectURL(f));
                }
              }}
            />
            {thumbnailFile ? (
              <button
                onClick={handleThumbnailUpload}
                disabled={isUploading}
                className="px-4 py-1.5 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {isUploading ? 'Uploading…' : 'Upload Thumbnail'}
              </button>
            ) : (
              <label htmlFor={`thumb-upload-${item.id}`} className="cursor-pointer">
                <span className="text-sm text-teal-600 font-medium hover:underline">Choose image</span>
                <span className="text-sm text-slate-500"> or drag & drop</span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <ToggleRow
          label="Auto Record Session"
          description="Automatically start recording when the class begins"
          checked={autoRecord}
          onChange={setAutoRecord}
        />
        <ToggleRow
          label="Free Preview Lesson"
          description="Non-enrolled learners can view this session's details"
          checked={freePreview}
          onChange={setFreePreview}
        />
      </div>

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
