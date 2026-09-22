import { useState } from 'react';
import { Maximize2, Loader2, Download, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPresignedUploadUrl, uploadToS3 } from '../../api/uploads.api';

export default function TextContentEditor({
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
  const [description, setDescription] = useState(item.content?.description ?? '');
  const [freePreview, setFreePreview] = useState(item.content?.freePreview ?? true);
  const [fileUrl, setFileUrl] = useState(item.content?.fileUrl ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const key = `texts/${Date.now()}-${file.name}`;
      const { uploadUrl, fileUrl: publicUrl } = await getPresignedUploadUrl(key, file.type);
      
      await uploadToS3(uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });
      
      setFileUrl(publicUrl);
      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveChanges = () => {
    onSaveContent({
      description,
      freePreview,
      fileUrl,
    });
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter text content..."
          className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y"
        />
      </div>

      {/* File Upload Zone */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Upload text(.txt) file</label>
        {fileUrl ? (
          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">File uploaded</p>
                <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline break-all">
                  View File
                </a>
              </div>
            </div>
            <button onClick={() => setFileUrl('')} className="p-2 hover:bg-blue-100 rounded text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <input 
              type="file" 
              id={`text-upload-${item.id}`} 
              accept=".txt" 
              className="hidden" 
              disabled={isUploading}
              onChange={e => {
                if (e.target.files?.[0]) {
                   handleFileUpload(e.target.files[0]);
                }
              }} 
            />
            <label htmlFor={`text-upload-${item.id}`} className={`border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group w-full block ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50'}`}>
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-slate-700">{uploadProgress}%</span>
                  <p className="text-xs text-slate-400 mt-1">Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg mb-3 group-hover:scale-110 transition-transform mx-auto">
                    <Download className="w-5 h-5 rotate-180" />
                  </div>
                  <p className="text-sm font-semibold text-blue-600 mb-1">Drag & drop your .txt file here or click to browse</p>
                  <p className="text-xs text-slate-400">Supports .txt format, max size 50MB</p>
                </>
              )}
            </label>
          </>
        )}
      </div>

      {/* Free Preview Lesson */}
      <div className="flex items-center justify-between pt-2">
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
