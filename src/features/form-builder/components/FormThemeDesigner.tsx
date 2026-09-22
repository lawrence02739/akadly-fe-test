import React from 'react';
import { X, Type, Palette, Image as ImageIcon, Layout } from 'lucide-react';
import { useFormBuilderStore } from '../store/useFormBuilderStore';

export const FormThemeDesigner: React.FC = () => {
  const { theme, isThemeOpen, toggleTheme, updateTheme } = useFormBuilderStore();

  if (!isThemeOpen) return null;

  return (
    <div className="w-[350px] bg-white border-l border-slate-200 h-full flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-20">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">Theme options</h2>
        <button 
          onClick={toggleTheme}
          className="p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
        
        {/* Colors Section */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4" /> Colors
          </h3>
          
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Primary Color</span>
            <div className="flex gap-2">
              {['#6b21a8', '#dc2626', '#ea580c', '#16a34a', '#2563eb', '#475569'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ primaryColor: color })}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: color, borderColor: theme.primaryColor === color ? '#000' : 'transparent' }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-sm font-medium text-slate-700">Background Color</span>
            <div className="flex gap-2">
              {['#f0ebf8', '#fef2f2', '#fff7ed', '#f0fdf4', '#eff6ff', '#f8fafc'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateTheme({ backgroundColor: color })}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: color, borderColor: theme.backgroundColor === color ? '#000' : 'transparent' }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Typography */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Type className="w-4 h-4" /> Typography
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Font Style</span>
            <select 
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="w-full p-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
            >
              <option value="Inter, sans-serif">Basic (Inter)</option>
              <option value="'Playfair Display', serif">Decorative (Playfair)</option>
              <option value="'Comic Sans MS', cursive">Playful (Comic Sans)</option>
              <option value="monospace">Formal (Monospace)</option>
            </select>
          </div>
        </section>

        <hr className="border-slate-200" />

        {/* Header Image */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Header Image
          </h3>
          <div className="flex flex-col gap-2">
            {theme.headerImageUrl ? (
              <div className="relative rounded-md overflow-hidden h-24">
                <img src={theme.headerImageUrl} alt="Header" className="w-full h-full object-cover" />
                <button 
                  onClick={() => updateTheme({ headerImageUrl: undefined })}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-md hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-purple-600 hover:text-purple-600 transition-colors">
                <ImageIcon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Choose image</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      updateTheme({ headerImageUrl: url });
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Form Width */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Layout className="w-4 h-4" /> Layout Width
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="formWidth"
                checked={theme.formWidth === 'NARROW' || !theme.formWidth}
                onChange={() => updateTheme({ formWidth: 'NARROW' })}
                className="w-4 h-4 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-sm text-slate-700">Narrow (770px)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="formWidth"
                checked={theme.formWidth === 'DEFAULT'}
                onChange={() => updateTheme({ formWidth: 'DEFAULT' })}
                className="w-4 h-4 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-sm text-slate-700">Default (900px)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="formWidth"
                checked={theme.formWidth === 'WIDE'}
                onChange={() => updateTheme({ formWidth: 'WIDE' })}
                className="w-4 h-4 text-purple-600 focus:ring-purple-600"
              />
              <span className="text-sm text-slate-700">Wide (1200px)</span>
            </label>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Custom CSS */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Layout className="w-4 h-4" /> Custom CSS (Advanced)
          </h3>
          <div className="flex flex-col gap-2">
            <textarea 
              value={theme.customCss || ''}
              onChange={(e) => updateTheme({ customCss: e.target.value })}
              placeholder="/* Add custom CSS rules here */&#10;.form-container {&#10;  box-shadow: none;&#10;}"
              className="w-full h-[150px] p-3 bg-slate-800 text-green-400 font-mono text-xs rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none custom-scrollbar"
              spellCheck={false}
            />
            <p className="text-xs text-slate-500">Apply custom styles to the form layout and elements. Use with caution.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
