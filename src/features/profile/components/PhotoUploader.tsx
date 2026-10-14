import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { presignProfilePicture } from '../api/profile.api';

interface PhotoUploaderProps {
  initials: string;
  photoUrl: string | null;
  onPhotoUploaded: (key: string, previewUrl: string) => void;
  onPhotoRemoved: () => void;
  disabled?: boolean;
}

export default function PhotoUploader({
  initials,
  photoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
  disabled = false,
}: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG or PNG images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2 MB.');
      return;
    }

    try {
      setUploading(true);
      const res = await presignProfilePicture({
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      const uploadUrl = res.uploadUrl;
      const key = res.key || res.fileKey;

      if (!key) {
        throw new Error('Upload key not received from server');
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Upload to storage failed');
      }

      const previewUrl = URL.createObjectURL(file);
      onPhotoUploaded(key, previewUrl);
      toast.success('Photo uploaded successfully');
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message || 'Failed to upload photo';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {/* Avatar Circle */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-sky-50 text-lg font-semibold text-[#0C5A69]">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials || 'U'}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png"
            className="hidden"
            disabled={disabled || uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload photo'}
          </button>
          <button
            type="button"
            onClick={onPhotoRemoved}
            disabled={disabled || uploading || !photoUrl}
            className="rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Initials placeholder · JPG or PNG · Up to 2 MB
      </p>
    </div>
  );
}
