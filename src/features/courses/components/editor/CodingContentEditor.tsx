import { useState, useEffect } from 'react';
import { Loader2, Trash2, Plus } from 'lucide-react';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { slateToHTML, parseEditorValue } from '../../../../utils/editorUtils';
import { useTags, useCreateTag } from '../../hooks/useMasterData';
import CreatableDropdown from '../../../../shared/components/CreatableDropdown';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TestCase {
  input: string;
  output: string;
}

interface CodingContent {
  tags: string[];
  problemStatement: string;
  allowEditingAfterSubmission: boolean;
  availability: 'ALWAYS' | 'SCHEDULED';
  availableFrom?: string;
  availableTill?: string;
  emailNotificationOnSubmission: boolean;
  testCasesEnabled: boolean;
  testCases: TestCase[];
  minTestCasesToPass: number;
  maxScore: number;
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

function RadioYesNo({
  id,
  value,
  onChange,
}: {
  id: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex gap-6">
      {[true, false].map(opt => (
        <label key={String(opt)} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
          <input
            type="radio"
            name={id}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="text-teal-600 focus:ring-teal-500"
          />
          {opt ? 'Yes' : 'No'}
        </label>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  item: any;
  courseId: string;
  onSave: (content: CodingContent) => void;
  isSaving: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CodingContentEditor({ item, courseId: _courseId, onSave, isSaving }: Props) {
  const { data: tagsList } = useTags();
  const { mutateAsync: createTag, isPending: isCreatingTag } = useCreateTag();

  // ─── State ────────────────────────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>([]);
  const [problemStatement, setProblemStatement] = useState<Descendant[]>(() =>
    parseEditorValue(item.content?.problemStatement)
  );
  const [allowEditing, setAllowEditing] = useState(false);
  const [availability, setAvailability] = useState<'ALWAYS' | 'SCHEDULED'>('ALWAYS');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTill, setAvailableTill] = useState('');
  const [emailNotification, setEmailNotification] = useState(false);
  const [testCasesEnabled, setTestCasesEnabled] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', output: '' }]);
  const [minTestCasesToPass, setMinTestCasesToPass] = useState(1);
  const [maxScore, setMaxScore] = useState(0);
  const [freePreview, setFreePreview] = useState(false);

  // ─── Reset on node switch ─────────────────────────────────────────────────
  useEffect(() => {
    const c = item.content ?? {};
    setTags(c.tags ?? []);
    setProblemStatement(parseEditorValue(c.problemStatement));
    setAllowEditing(c.allowEditingAfterSubmission ?? false);
    setAvailability(c.availability ?? 'ALWAYS');
    setAvailableFrom(c.availableFrom ?? '');
    setAvailableTill(c.availableTill ?? '');
    setEmailNotification(c.emailNotificationOnSubmission ?? false);
    setTestCasesEnabled(c.testCasesEnabled ?? false);
    setTestCases(c.testCases?.length ? c.testCases : [{ input: '', output: '' }]);
    setMinTestCasesToPass(c.minTestCasesToPass ?? 1);
    setMaxScore(c.maxScore ?? 0);
    setFreePreview(c.freePreview ?? false);
  }, [item.id, item.content]);

  // ─── Test case helpers ────────────────────────────────────────────────────
  const updateTestCase = (index: number, field: 'input' | 'output', value: string) => {
    setTestCases(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addTestCase = () => setTestCases(prev => [...prev, { input: '', output: '' }]);

  const removeTestCase = (index: number) => {
    setTestCases(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Clamp minTestCasesToPass to valid range
      setMinTestCasesToPass(m => Math.min(m, Math.max(1, next.length)));
      return next;
    });
  };

  // ─── Save / Cancel ────────────────────────────────────────────────────────
  const buildContent = (): CodingContent => ({
    tags,
    problemStatement: slateToHTML(problemStatement),
    allowEditingAfterSubmission: allowEditing,
    availability,
    availableFrom: availability === 'SCHEDULED' ? availableFrom : undefined,
    availableTill: availability === 'SCHEDULED' ? availableTill : undefined,
    emailNotificationOnSubmission: emailNotification,
    testCasesEnabled,
    testCases: testCasesEnabled ? testCases : [],
    minTestCasesToPass: testCasesEnabled ? Math.min(minTestCasesToPass, testCases.length) : 1,
    maxScore,
    freePreview,
  });

  const handleSave = () => onSave(buildContent());

  const handleCancel = () => {
    const c = item.content ?? {};
    setTags(c.tags ?? []);
    setProblemStatement(parseEditorValue(c.problemStatement));
    setAllowEditing(c.allowEditingAfterSubmission ?? false);
    setAvailability(c.availability ?? 'ALWAYS');
    setAvailableFrom(c.availableFrom ?? '');
    setAvailableTill(c.availableTill ?? '');
    setEmailNotification(c.emailNotificationOnSubmission ?? false);
    setTestCasesEnabled(c.testCasesEnabled ?? false);
    setTestCases(c.testCases?.length ? c.testCases : [{ input: '', output: '' }]);
    setMinTestCasesToPass(c.minTestCasesToPass ?? 1);
    setMaxScore(c.maxScore ?? 0);
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

      {/* Problem Statement */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Problem Statement <span className="text-red-500">*</span>
        </label>
        <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <RichTextEditor
            initialValue={problemStatement}
            className="min-h-[160px] text-sm bg-white"
            placeholder="Describe the coding problem..."
            onChange={(val: Descendant[]) => setProblemStatement(val)}
          />
        </div>
      </div>

      {/* Allow Editing After Submission */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Allow Editing After Submission
        </label>
        <RadioYesNo
          id={`allow-editing-${item.id}`}
          value={allowEditing}
          onChange={setAllowEditing}
        />
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
        <div className="grid grid-cols-2 gap-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
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
              Available Till <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={availableTill}
              onChange={e => setAvailableTill(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      )}

      {/* Email Notification on Submission */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email Notification on Submission
        </label>
        <RadioYesNo
          id={`email-notif-${item.id}`}
          value={emailNotification}
          onChange={setEmailNotification}
        />
      </div>

      {/* Test Cases */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Add test cases to auto-check solutions</p>
          </div>
          <Toggle checked={testCasesEnabled} onChange={setTestCasesEnabled} />
        </div>

        {testCasesEnabled && (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 px-1">
              <span className="text-xs font-semibold text-slate-500">#</span>
              <span className="text-xs font-semibold text-slate-500">Input</span>
              <span className="text-xs font-semibold text-slate-500">Output</span>
              <span />
            </div>

            {/* Test case rows */}
            <div className="space-y-2">
              {testCases.map((tc, idx) => (
                <div key={idx} className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-start">
                  <span className="text-xs text-slate-400 pt-2 text-center">{idx + 1}</span>
                  <textarea
                    value={tc.input}
                    onChange={e => updateTestCase(idx, 'input', e.target.value)}
                    placeholder="Add formatted data for input"
                    rows={2}
                    className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <textarea
                    value={tc.output}
                    onChange={e => updateTestCase(idx, 'output', e.target.value)}
                    placeholder="Add formatted data for output"
                    rows={2}
                    className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <button
                    onClick={() => removeTestCase(idx)}
                    disabled={testCases.length === 1}
                    className="p-1 mt-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove test case"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add another set */}
            <button
              onClick={addTestCase}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add another set
            </button>

            {/* Min pass counter */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="number"
                min={1}
                max={testCases.length}
                value={minTestCasesToPass}
                onChange={e =>
                  setMinTestCasesToPass(
                    Math.min(testCases.length, Math.max(1, Number(e.target.value)))
                  )
                }
                className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-sm text-slate-600">
                / {testCases.length} test {testCases.length === 1 ? 'case needs' : 'cases need'} to be passed to clear the test
              </span>
            </div>
          </>
        )}
      </div>

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

      {/* Free Preview */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <p className="text-sm font-medium text-slate-700">Free Preview Lesson</p>
          <p className="text-xs text-slate-500">Non-enrolled learners can preview this challenge</p>
        </div>
        <Toggle checked={freePreview} onChange={setFreePreview} />
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
