import React, { useState, useRef } from 'react';
import type { BrandingAssetType } from '../types/onboarding.types';
import { onboardingApi } from '../api/onboarding.api';
import { UploadCloud, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface AssetUploaderProps {
  assetType: BrandingAssetType;
  label: string;
  helperText: string;
  currentUrl?: string | null;
  onUploaded: (key: string, previewUrl: string) => void;
  onRemoved: () => void;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({
  assetType,
  label,
  helperText,
  currentUrl,
  onUploaded,
  onRemoved,
  maxSizeBytes = assetType === 'LOGO' ? 2 * 1024 * 1024 : 512 * 1024,
  acceptedTypes = assetType === 'LOGO'
    ? ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']
    : ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml'],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      toast.error(`Invalid file format: ${file.type}. Allowed: PNG, SVG, ICO`);
      return;
    }

    if (file.size > maxSizeBytes) {
      toast.error(
        `File is too large (${Math.round(file.size / 1024)}KB). Maximum allowed: ${Math.round(maxSizeBytes / 1024)}KB.`,
      );
      return;
    }

    setIsUploading(true);
    try {
      // 1. Request presigned URL from backend
      const presign = await onboardingApi.presignAsset({
        assetType,
        filename: file.name,
        contentType: file.type,
        byteSize: file.size,
      });

      // 2. Direct upload to S3 / Object Storage
      await onboardingApi.uploadAssetToStorage(presign.uploadUrl, file);

      // 3. Create local object URL for instant zero-latency preview
      const previewUrl = URL.createObjectURL(file);
      onUploaded(presign.key, previewUrl);
      toast.success(`${label} uploaded successfully`);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(`Failed to upload ${label}. Please try again.`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <span className="text-xs text-slate-400">{helperText}</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {currentUrl ? (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs overflow-hidden">
              <img
                src={currentUrl}
                alt={label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {label} Active
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Change asset
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoved}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white transition-colors cursor-pointer"
            title="Remove asset"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            isUploading
              ? 'border-indigo-400 bg-indigo-50/20'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80 bg-white'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="text-xs font-semibold text-indigo-600">
                Uploading to secure storage...
              </span>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                {assetType === 'LOGO' ? (
                  <ImageIcon className="w-4 h-4" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Click to upload {label.toLowerCase()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Drag and drop or browse from your device
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
