import React, { useRef, useState } from 'react';
import {
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Paperclip,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getPresignedUploadUrl,
  uploadToS3,
} from '../../../courses/api/uploads.api';
import type { InstructorDocument } from '../../types/instructor.types';

interface DocumentsSectionProps {
  documents: InstructorDocument[];
  onChangeDocuments: (docs: InstructorDocument[]) => void;
  disabled?: boolean;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
  onChangeDocuments,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Manual URL modal / inline form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds the 20MB limit.');
      e.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `instructors/docs/${Date.now()}_${sanitizedName}`;

      const { uploadUrl, fileUrl } = await getPresignedUploadUrl(
        key,
        file.type || 'application/octet-stream',
      );

      await uploadToS3(uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      // Format default title from filename
      const titleWithoutExt = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      const defaultTitle =
        titleWithoutExt.charAt(0).toUpperCase() + titleWithoutExt.slice(1);

      const resolvedUrl = fileUrl || uploadUrl.split('?')[0];

      onChangeDocuments([
        ...documents,
        {
          title: defaultTitle || 'Uploaded Document',
          fileUrl: resolvedUrl,
        },
      ]);

      toast.success('Document uploaded successfully.');
    } catch (err: any) {
      console.error('Document upload failed:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to upload document. Please try again.',
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddManualDocument = () => {
    const trimmedTitle = manualTitle.trim();
    const trimmedUrl = manualUrl.trim();

    if (!trimmedTitle) {
      toast.error('Please enter a document title.');
      return;
    }
    if (!trimmedUrl) {
      toast.error('Please enter a document URL.');
      return;
    }
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      toast.error('URL must start with http:// or https://');
      return;
    }

    onChangeDocuments([
      ...documents,
      {
        title: trimmedTitle,
        fileUrl: trimmedUrl,
      },
    ]);

    setManualTitle('');
    setManualUrl('');
    setShowManualForm(false);
    toast.success('Document link added.');
  };

  const handleUpdateTitle = (index: number, newTitle: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], title: newTitle };
    onChangeDocuments(updated);
  };

  const handleRemove = (index: number) => {
    onChangeDocuments(documents.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-[#0C5A69]" />
            Instructor Documents
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Attach CV, resumes, educational certificates, ID proofs, or contracts.
          </p>
        </div>

        {/* Action Buttons */}
        {!disabled && (
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.txt"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 rounded-lg border border-[#0C5A69] bg-teal-50/50 px-3 py-1.5 text-xs font-semibold text-[#0C5A69] hover:bg-teal-100/60 disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading {uploadProgress !== null ? `${uploadProgress}%` : ''}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload File</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add URL</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual URL Form */}
      {showManualForm && !disabled && (
        <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50/30 p-4 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-teal-100">
            <span className="text-xs font-semibold text-[#0C5A69]">
              Add External Document Link
            </span>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Master's Degree Certificate"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Document URL *
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="rounded-lg px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddManualDocument}
              className="flex items-center gap-1 rounded-lg bg-[#0C5A69] px-3 py-1 text-xs font-semibold text-white hover:bg-[#094754]"
            >
              <Check className="h-3 w-3" />
              Add Document
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="mt-4 space-y-2.5">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-7 text-center">
            <FileText className="h-8 w-8 text-slate-300 stroke-1 mb-2" />
            <p className="text-xs font-medium text-slate-600">
              No documents attached yet
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
              Upload CVs, degree certificates, government IDs or contracts. Supported: PDF, DOC, DOCX, images (up to 20MB).
            </p>
          </div>
        ) : (
          documents.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-slate-300"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100/70 text-[#0C5A69]">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={doc.title}
                    disabled={disabled}
                    onChange={(e) => handleUpdateTitle(idx, e.target.value)}
                    placeholder="Document Title"
                    className="w-full bg-transparent font-medium text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0C5A69] rounded px-1.5 py-0.5 border border-transparent focus:border-slate-300"
                  />
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 hover:underline px-1.5 truncate max-w-md"
                  >
                    <span className="truncate">{doc.fileUrl}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
