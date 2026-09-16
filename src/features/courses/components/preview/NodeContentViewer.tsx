import { File, Video, Headphones, FileText, Link as LinkIcon, Download } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  VIDEO: { icon: Video,     color: 'text-blue-600',   bgColor: 'bg-blue-50',   label: 'Video' },
  AUDIO: { icon: Headphones,color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Audio' },
  PDF:   { icon: FileText,  color: 'text-red-600',    bgColor: 'bg-red-50',    label: 'PDF' },
  FILE:  { icon: File,      color: 'text-slate-600',  bgColor: 'bg-slate-100', label: 'File' },
  MODULE:{ icon: File,      color: 'text-teal-600',   bgColor: 'bg-teal-50',   label: 'Module' },
};

export default function NodeContentViewer({ item }: { item: any }) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg?.icon ?? File;
  const content = item.content || {};

  const renderContent = () => {
    switch (item.type) {
      case 'TEXT':
        return (
          <div 
            className="prose prose-slate max-w-none text-slate-800 bg-white p-8 rounded-xl shadow-sm border border-slate-200"
            dangerouslySetInnerHTML={{ __html: content.text || '<p>No content provided yet.</p>' }}
          />
        );
      
      case 'VIDEO':
        return content.fileUrl ? (
          <div className="rounded-xl overflow-hidden shadow-lg bg-black aspect-video w-full">
            <video src={content.fileUrl} controls className="w-full h-full object-contain" />
          </div>
        ) : (
          <EmptyState icon={Video} message="No video uploaded yet" />
        );

      case 'AUDIO':
        return content.fileUrl ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
               <Headphones className="w-10 h-10" />
            </div>
            <audio src={content.fileUrl} controls className="w-full max-w-md" />
          </div>
        ) : (
          <EmptyState icon={Headphones} message="No audio uploaded yet" />
        );

      case 'PDF':
        return content.fileUrl ? (
          <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
            <iframe src={`${content.fileUrl}#toolbar=0`} className="w-full h-full border-0" title={item.title} />
          </div>
        ) : (
          <EmptyState icon={FileText} message="No PDF uploaded yet" />
        );

      case 'FILE':
        return content.fileUrl ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-6">
              <File className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-md">This file is available for download.</p>
            <a 
              href={content.fileUrl} 
              download
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" /> Download File
            </a>
          </div>
        ) : (
          <EmptyState icon={File} message="No file uploaded yet" />
        );

      case 'HEADING':
        const Tag = content.level?.toLowerCase() || 'h2';
        const text = content.heading || 'Empty Heading';
        
        return (
          <div className="py-6 px-8 bg-white rounded-xl shadow-sm border border-slate-200">
            {Tag === 'h1' && <h1 className="text-4xl font-extrabold text-slate-900">{text}</h1>}
            {Tag === 'h2' && <h2 className="text-3xl font-bold text-slate-800">{text}</h2>}
            {Tag === 'h3' && <h3 className="text-2xl font-bold text-slate-800">{text}</h3>}
            {Tag === 'h4' && <h4 className="text-xl font-semibold text-slate-700">{text}</h4>}
          </div>
        );

      case 'LINK':
        return content.url ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <LinkIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{content.url}</p>
            <a 
              href={content.url} 
              target={content.newTab !== false ? "_blank" : "_self"}
              rel="noreferrer"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              {content.label || 'Open Link'}
            </a>
          </div>
        ) : (
          <EmptyState icon={LinkIcon} message="No link provided yet" />
        );

      case 'MODULE':
        return (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
             <h3 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h3>
             <p className="text-slate-500">Select an item inside this module to view its content.</p>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="text-5xl mb-4">🚧</div>
            <p className="text-slate-600 font-semibold text-lg">Coming Soon</p>
            <p className="text-sm text-slate-400 mt-2">
              Preview for <span className="font-bold">{item.type}</span> is not available yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-6 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4">
        {cfg ? (
          <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} ${cfg.color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <File className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-800">{item.title}</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.type}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
           {renderContent()}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}
