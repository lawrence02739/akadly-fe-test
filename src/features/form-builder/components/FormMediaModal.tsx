import React, { useState, useRef } from 'react';
import { X, UploadCloud, Link as LinkIcon, Camera, Search, ImageIcon } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';
import { getPresignedUploadUrl, uploadToS3 } from '../../courses/api/uploads.api';
import toast from 'react-hot-toast';

export const FormMediaModal: React.FC = () => {
  const { mediaModal, closeMediaModal, updateBlock } = useFormBuilderStore();
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'CAMERA' | 'URL' | 'PHOTOS'>('UPLOAD');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!mediaModal.isOpen) return null;

  const isImage = mediaModal.type === 'IMAGE';

  const handleSaveUrl = () => {
    if (urlInput.trim() && mediaModal.sectionId && mediaModal.blockId) {
      updateBlock(mediaModal.sectionId, mediaModal.blockId, { mediaUrl: urlInput.trim() });
      closeMediaModal();
      setUrlInput('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && mediaModal.sectionId && mediaModal.blockId) {
      const maxBytes = isImage ? 10 * 1024 * 1024 : 500 * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`${isImage ? 'Image' : 'Video'} exceeds the ${isImage ? '10 MB' : '500 MB'} limit.`);
        e.target.value = '';
        return;
      }
      try {
        setIsUploading(true);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const key = `forms/${isImage ? 'images' : 'videos'}/${Date.now()}-${safeName}`;
        const { uploadUrl, fileUrl, fileKey } = await getPresignedUploadUrl(key, file.type);
        await uploadToS3(uploadUrl, file);
        updateBlock(mediaModal.sectionId, mediaModal.blockId, { mediaUrl: fileUrl, mediaKey: fileKey });
        closeMediaModal();
        toast.success(`${isImage ? 'Image' : 'Video'} uploaded.`);
      } catch {
        toast.error('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-medium text-slate-800">
            Insert {isImage ? 'Image' : 'Video'}
          </h2>
          <button onClick={closeMediaModal} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-[500px]">
          {/* Sidebar */}
          <div className="w-56 border-r border-slate-200 bg-slate-50 flex flex-col py-2">
            <button 
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeTab === 'UPLOAD' ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}
            >
              <UploadCloud className="w-5 h-5" /> Upload
            </button>
            {isImage && (
              <button 
                onClick={() => setActiveTab('CAMERA')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeTab === 'CAMERA' ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}
              >
                <Camera className="w-5 h-5" /> Webcam
              </button>
            )}
            <button 
              onClick={() => setActiveTab('URL')}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeTab === 'URL' ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}
            >
              <LinkIcon className="w-5 h-5" /> By URL
            </button>
            {isImage && (
              <button 
                onClick={() => setActiveTab('PHOTOS')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${activeTab === 'PHOTOS' ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-600' : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'}`}
              >
                <ImageIcon className="w-5 h-5" /> Photos
              </button>
            )}
            {isImage && (
              <button 
                onClick={() => setActiveTab('PHOTOS')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 border-l-4 border-transparent`}
              >
                <Search className="w-5 h-5" /> Google Images
              </button>
            )}
            <button 
                onClick={() => setActiveTab('PHOTOS')}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 border-l-4 border-transparent`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg> Google Drive
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-white">
            {activeTab === 'UPLOAD' && (
              <div 
                className="w-full max-w-lg h-72 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl flex flex-col items-center justify-center hover:bg-slate-100 transition-colors shadow-sm"
              >
                <UploadCloud className="w-16 h-16 text-slate-400 mb-4" />
                <span className="text-xl font-medium text-slate-700 mb-2">Drag and drop your file here</span>
                <span className="text-sm text-slate-500 mb-6">or</span>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept={isImage ? "image/*" : "video/*"}
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium transition-colors shadow-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {isUploading ? 'Uploading...' : 'Browse Files'}
                </button>
              </div>
            )}

            {activeTab === 'URL' && (
              <div className="w-full max-w-lg flex flex-col gap-6">
                <h3 className="text-xl font-medium text-slate-800">Paste {isImage ? 'an image' : 'a YouTube'} URL</h3>
                <input 
                  type="text"
                  placeholder={isImage ? "https://example.com/image.jpg" : "https://youtube.com/watch?v=..."}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full p-4 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 focus:outline-none text-lg transition-colors"
                />
                <button 
                  onClick={handleSaveUrl}
                  disabled={!urlInput}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium self-end text-lg transition-colors"
                >
                  Insert {isImage ? 'Image' : 'Video'}
                </button>
              </div>
            )}

            {(activeTab === 'CAMERA' || activeTab === 'PHOTOS') && (
              <div className="flex flex-col items-center justify-center text-center max-w-md gap-4">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-medium text-slate-800">Integration Not Available</h3>
                <p className="text-slate-500 text-lg">
                  Accessing {activeTab === 'CAMERA' ? 'Webcam' : 'Google Photos/Drive'} requires production API keys and permissions.
                </p>
                <button 
                  onClick={() => setActiveTab('UPLOAD')}
                  className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-700 mt-4 transition-colors text-lg"
                >
                  Go to Upload
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
