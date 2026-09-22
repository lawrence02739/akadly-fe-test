import React, { useState } from 'react';
import { X, Link as LinkIcon, QrCode, Code, Copy, Check, Globe } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

export const FormShareModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { formId } = useFormBuilderStore();
  const [activeTab, setActiveTab] = useState<'LINK' | 'EMBED' | 'QR'>('LINK');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the actual frontend domain for the public link
  const baseUrl = window.location.origin;
  const publicLink = formId ? `${baseUrl}/f/${formId}` : '';
  const iframeCode = `<iframe src="${publicLink}" width="100%" height="800" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>`;

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">Send form</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex p-6 h-[350px]">
          {/* Tabs */}
          <div className="flex flex-col gap-2 w-48 border-r border-slate-200 pr-6 shrink-0">
            <button
              onClick={() => setActiveTab('LINK')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'LINK' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <LinkIcon className="w-4 h-4" /> Link
            </button>
            <button
              onClick={() => setActiveTab('EMBED')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'EMBED' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Code className="w-4 h-4" /> Embed HTML
            </button>
            <button
              onClick={() => setActiveTab('QR')}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'QR' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <QrCode className="w-4 h-4" /> QR Code
            </button>
            
            <div className="mt-auto border-t border-slate-200 pt-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Settings</span>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Globe className="w-4 h-4 text-slate-400" /> Public Domain
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 pl-6">
            {activeTab === 'LINK' && (
              <div className="flex flex-col gap-4 h-full">
                <h3 className="text-lg font-medium text-slate-800">Share via link</h3>
                <p className="text-sm text-slate-500 mb-2">Anyone with this link can respond to your form.</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={publicLink}
                    placeholder="Publish the form to generate its public link"
                    className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none"
                  />
                </div>
                <button 
                  onClick={() => handleCopy(publicLink)}
                  disabled={!formId}
                  className="mt-2 w-fit px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            )}

            {activeTab === 'EMBED' && (
              <div className="flex flex-col gap-4 h-full">
                <h3 className="text-lg font-medium text-slate-800">Embed HTML</h3>
                <p className="text-sm text-slate-500 mb-2">Copy this iframe snippet to embed the form on your website.</p>
                <textarea 
                  readOnly 
                  value={iframeCode}
                  className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-mono resize-none focus:outline-none custom-scrollbar"
                />
                <button 
                  onClick={() => handleCopy(iframeCode)}
                  className="mt-2 w-fit px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>
            )}

            {activeTab === 'QR' && (
              <div className="flex flex-col gap-4 h-full items-center justify-center">
                <h3 className="text-lg font-medium text-slate-800 self-start">QR Code</h3>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center gap-4">
                  {/* Fake QR code placeholder for MVP UI */}
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-4 border-slate-800 rounded-lg relative overflow-hidden">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#1e293b 15%, transparent 16%)', backgroundSize: '12px 12px' }}></div>
                     <QrCode className="w-24 h-24 text-slate-800 z-10" />
                  </div>
                  <button className="text-purple-600 font-medium text-sm hover:underline">Download Image</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
