import { useState } from 'react';
import { Upload, FileText, Link as LinkIcon, Library } from 'lucide-react';
import { useUpload } from '../../hooks/useUpload';

export default function PdfContentEditor({ item }: { item: any }) {
  const [uploadType, setUploadType] = useState<'upload' | 'url' | 'library'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const { mutateAsync: uploadFile, isPending } = useUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const key = `courses/pdfs/${Date.now()}-${file.name}`;
      await uploadFile({
        file,
        key,
        onProgress: (p) => setProgress(p)
      });
      alert('Upload complete!');
    } catch (e) {
      alert('Upload failed.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          {item.title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" defaultValue={item.title} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">PDF Source</label>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setUploadType('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadType === 'upload' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button
              onClick={() => setUploadType('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadType === 'url' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <LinkIcon className="w-4 h-4" /> URL
            </button>
            <button
              onClick={() => setUploadType('library')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-colors ${uploadType === 'library' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
            >
              <Library className="w-4 h-4" /> Library
            </button>
          </div>
        </div>

        {uploadType === 'upload' && (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Click to upload or drag and drop</h3>
            <p className="text-xs text-slate-500 mb-4">PDF only (max. 100MB)</p>
            <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" id="pdf-upload" />
            <label htmlFor="pdf-upload" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              Select PDF
            </label>
            {file && <p className="mt-4 text-sm font-medium text-slate-700">{file.name}</p>}
            {isPending && (
              <div className="w-full max-w-xs mt-4">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{progress}% uploaded</p>
              </div>
            )}
            {file && !isPending && progress === 0 && (
              <button onClick={handleUpload} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">
                Start Upload
              </button>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
             <h4 className="text-sm font-medium text-slate-800">Allow Download</h4>
             <p className="text-xs text-slate-500">Learners can download this PDF to their device.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
             <input type="checkbox" value="" className="sr-only peer" />
             <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
          </label>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end gap-3">
        <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold hover:bg-teal-800">
          Save Content
        </button>
      </div>
    </div>
  );
}
