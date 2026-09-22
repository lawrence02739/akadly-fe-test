import { useState } from 'react';
import { Maximize2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HeadingContentEditor({
  item,
  isSaving,
  onSaveContent,
  onCancel,
}: {
  item: any;
  isSaving: boolean;
  onSaveContent: (content: any) => void;
  onCancel: () => void;
}) {
  const [freePreview, setFreePreview] = useState(item.content?.freePreview ?? true);

  const handleSaveChanges = () => {
    onSaveContent({
      freePreview,
    });
  };

  return (
    <div className="space-y-6">
      {/* Free Preview Lesson */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Free Preview Lesson</p>
          <p className="text-xs text-slate-500">Allow non-registered users access</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={freePreview}
            onChange={e => setFreePreview(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0C5A69]"></div>
        </label>
      </div>

      {/* Open Fullscreen Editor */}
      <button 
        onClick={() => toast.success('Fullscreen editor coming soon!', { icon: '🏗️' })}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm mt-4"
      >
        <Maximize2 className="w-4 h-4" />
        Open Fullscreen Editor
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={handleSaveChanges}
          disabled={isSaving}
          className="flex-1 py-2.5 bg-[#0C5A69] text-white font-semibold rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
        <button 
          onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
