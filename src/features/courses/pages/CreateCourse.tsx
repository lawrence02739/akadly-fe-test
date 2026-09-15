import { useState } from 'react';
import { X, Image as ImageIcon, ChevronLeft, Sparkles, Undo2, Redo2, Bold, Italic, Underline, Strikethrough, PaintBucket, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api/axios';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner to Professional',
    language: 'English',
    category: 'Design & Development',
    tags: [] as string[],
    instructor: 'Select Instructor',
    pricingPlan: 'One-time plan',
    discountedPrice: '',
    price: '',
    thumbnail: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      await api.post('/courses', {
        ...formData,
        price: formData.price ? Number(formData.price) : undefined,
        discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
        status: 'PUBLISHED',
      });
      navigate('/partner/courses');
    } catch (err) {
      console.error('Failed to create course', err);
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
      setFormData({ ...formData, thumbnail: url });
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/partner/courses')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Create Course</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium hover:bg-amber-600 rounded-lg transition-colors shadow-sm">
          <Sparkles className="w-4 h-4" />
          Generate Blueprint
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left Column: Form */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Course Information</h2>
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. UI/UX Design Masterclass: Complete Figma Blueprint"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors"
              />
            </div>

            {/* Description (Rich Text Mock) */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description <span className="text-red-500">*</span></label>
              <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-700 focus-within:border-teal-700 transition-colors">
                <div className="border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-100 text-sm font-medium text-slate-600">
                    <button className="hover:text-slate-900">File</button>
                    <button className="hover:text-slate-900">Edit</button>
                    <button className="hover:text-slate-900">View</button>
                    <button className="hover:text-slate-900">Insert</button>
                    <button className="hover:text-slate-900">Format</button>
                    <button className="hover:text-slate-900">Tools</button>
                    <button className="hover:text-slate-900">Help</button>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 text-slate-600 overflow-x-auto">
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Undo2 className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Redo2 className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                    <select className="bg-transparent text-sm font-medium focus:outline-none">
                      <option>100%</option>
                    </select>
                    <select className="bg-slate-100 px-2 py-1 rounded text-sm font-medium focus:outline-none ml-2">
                      <option>Paragraph text</option>
                    </select>
                    <select className="bg-transparent text-sm font-medium focus:outline-none ml-2">
                      <option>Arial</option>
                    </select>
                    <div className="w-px h-4 bg-slate-300 mx-2"></div>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Bold className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Italic className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Underline className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Strikethrough className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><PaintBucket className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded"><Type className="w-4 h-4" /></button>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  className="w-full px-4 py-4 focus:outline-none resize-none"
                />
                <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-500 text-right flex justify-between items-center bg-slate-50">
                  <span>{formData.description.split(/\s+/).filter((w) => w.length > 0).length} words</span>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-b-[6px] border-b-slate-400 border-r-[6px] border-r-slate-400 border-t-[6px] border-t-transparent"></div>
                </div>
              </div>
            </div>

            {/* Dropdowns row */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors bg-white appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                >
                  <option>Beginner to Professional</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors bg-white appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors bg-white appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                >
                  <option>Design & Development</option>
                  <option>Business</option>
                  <option>Marketing</option>
                </select>
              </div>
            </div>

            {/* Tags & Instructor */}
            <div className="grid grid-cols-[2fr_1fr] gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Tags (press Enter to add)</label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-teal-700 focus-within:border-teal-700 transition-colors bg-white">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 font-medium text-sm rounded-md">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-teal-700 hover:text-teal-900"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={formData.tags.length === 0 ? 'Add tag...' : ''}
                    className="flex-1 min-w-[100px] px-2 py-1 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Instructor</label>
                <select
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors bg-white appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
                >
                  <option>Select Instructor</option>
                  <option>Elena Rostova</option>
                  <option>Akif Ansari</option>
                </select>
              </div>
            </div>

            {/* Set Pricing */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-4">Set Pricing</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'Free plan', desc: 'Allow unrestricted access to your content free of cost' },
                  { id: 'Premium plan', desc: 'Allow unrestricted access to your content free of cost' },
                  { id: 'One-time plan', desc: 'Allow full course access with a single payment' },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, pricingPlan: plan.id })}
                    className={`flex items-start gap-3 p-5 rounded-xl border text-left transition-colors ${formData.pricingPlan === plan.id
                      ? 'border-teal-700 bg-teal-50/30'
                      : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.pricingPlan === plan.id ? 'border-teal-700' : 'border-slate-300'
                      }`}>
                      {formData.pricingPlan === plan.id && <div className="w-2.5 h-2.5 bg-teal-700 rounded-full" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{plan.id}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Inputs */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Discounted price (5% off!) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  placeholder="Enter discounted price"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Total price <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors"
                />
              </div>
            </div>

            {/* Thumbnail Upload (Custom Requirement) */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Course Thumbnail</label>
              {thumbnailPreview ? (
                <div className="relative w-full max-w-sm aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => { setThumbnailPreview(null); setFormData({ ...formData, thumbnail: '' }); }}
                      className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="relative flex flex-col items-center justify-center w-full max-w-sm aspect-video border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 hover:border-teal-700 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                      <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-teal-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Click to upload thumbnail</p>
                      <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG (max. 5MB)</p>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                </label>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Student Preview */}
        <div className="w-[380px] shrink-0">
          <div className="sticky top-6 flex flex-col gap-6 max-h-[calc(100vh-1rem)] overflow-y-auto pb-4 custom-scrollbar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col shrink-0">
              {/* Top dark section */}
              <div className="bg-[#0f4b55] text-white p-6 pb-10">
                <span className="inline-block px-2.5 py-1 bg-white/20 text-xs font-semibold rounded mb-6 tracking-wider uppercase text-white/90">
                  Student Preview
                </span>
                <h2 className="text-3xl font-bold leading-tight flex items-start gap-2">
                  {formData.title || "Fundamental of UI/UX"}
                  {/* Cube Icon Mock */}
                  <div className="mt-1 ml-auto opacity-70">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </div>
                </h2>
              </div>

              {/* Body */}
              <div className="p-6 bg-white space-y-6">
                {/* Fake Badges */}
                <div className="flex gap-2 flex-wrap">
                  {(formData.tags.length > 0 ? formData.tags : ['Design', 'Figma']).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {formData.title || "UI/UX Design Masterclass: Complete Figma Blueprint"}
                </h3>

                {/* AI Summary */}
                <div className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px] tracking-widest uppercase">
                    <Sparkles className="w-3 h-3" /> AI Blueprint Summary
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {formData.description || "Master modern UI/UX workflows in 10 weeks. Go from zero to prototyping pixel-perfect systems, advanced component hierarchies, and interactive responsive projects in Figma."}
                  </p>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img src="https://i.pravatar.cc/100?img=5" alt="Instructor" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{formData.instructor !== 'Select Instructor' ? formData.instructor : 'Elena Rostova'}</div>
                    <div className="text-xs text-slate-500">Senior Product Designer</div>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">${formData.price || '149'}</span>
                  <span className="text-sm font-medium text-slate-500">/ one-time</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end shrink-0">
              <button onClick={handleCreate} className="px-6 py-3 bg-[#0f4b55] text-white font-bold rounded-lg hover:bg-[#0c3d45] transition-colors shadow-sm w-full">
                Create Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
