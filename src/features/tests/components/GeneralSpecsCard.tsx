import React, { useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { TestDifficulty, TestType, type MediaRef, type Money } from '../types';
import { useTags, useCreateTag, useCategories, useInstructors } from '../../courses/hooks/useMasterData';
import { useUpload } from '../../courses/hooks/useUpload';
import CreatableDropdown from '../../../shared/components/CreatableDropdown';

export interface GeneralSpecsFormData {
  title: string;
  testType?: TestType;
  subject?: string;
  categoryId?: string;
  instructorName?: string;
  instructorId?: string;
  enrollmentFee?: Money;
  description?: string;
  difficulty: TestDifficulty;
  tags: string[];
  coverImage?: MediaRef;
}

interface GeneralSpecsCardProps {
  formData: GeneralSpecsFormData;
  onChange: (updates: Partial<GeneralSpecsFormData>) => void;
  errors?: Record<string, string>;
}

export const GeneralSpecsCard: React.FC<GeneralSpecsCardProps> = ({
  formData,
  onChange,
  errors = {},
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUpload();
  const isUploading = uploadMutation.isPending;
  const { data: categories = [] } = useCategories();
  const { data: availableTags = [] } = useTags();
  const { data: instructors = [], isLoading: isLoadingInstructors } = useInstructors();
  const createTagMutation = useCreateTag();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const key = `tests/covers/${Date.now()}-${file.name}`;
      const fileUrl = await uploadMutation.mutateAsync({ file, key });
      onChange({
        coverImage: {
          key,
          url: fileUrl,
        },
      });
    } catch {
      // upload error handled by hook toast
    }
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ coverImage: undefined });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900">General Specifications</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Basic assessment properties, classification, and metadata
        </p>
      </div>

      {/* Test Cover Image(Optional) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Test Cover Image(Optional)
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-teal-600/40 hover:border-[#005963] rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-teal-50/10 hover:bg-teal-50/25 group"
          style={{ minHeight: '130px' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleFileChange}
          />

          {formData.coverImage?.url ? (
            <div className="relative w-full h-32 rounded-lg overflow-hidden group/img">
              <img
                src={formData.coverImage.url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="text-[#005963] mb-1.5 transition-transform group-hover:scale-105">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-[#005963] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud size={24} />
                )}
              </div>
              <p className="text-xs font-bold text-[#005963]">
                {isUploading ? 'Uploading cover image...' : 'Click to upload Cover Image or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG or SVG (recommended 1200x630px)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Test Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Class Test"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={`w-full px-3 py-2 text-sm rounded-lg border ${
            errors.title
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963]'
          } outline-none transition-all`}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Test Type(Optional) - Note: Course dropdown omitted as course linking is optional and node-linked */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Test Type(Optional)
        </label>
        <select
          value={formData.testType || ''}
          onChange={(e) =>
            onChange({ testType: (e.target.value as TestType) || undefined })
          }
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
        >
          <option value="">Select Test Type</option>
          <option value={TestType.PROCTORED}>Proctored Test</option>
          <option value={TestType.CLASS_TEST}>Class Test</option>
          <option value={TestType.PRACTICE}>Practice Test</option>
          <option value={TestType.MOCK}>Mock Exam</option>
          <option value={TestType.DIAGNOSTIC}>Diagnostic Assessment</option>
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Subject
        </label>
        <input
          type="text"
          placeholder="Chemistry"
          value={formData.subject || ''}
          onChange={(e) => onChange({ subject: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
        />
      </div>

      {/* Difficulty & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Difficulty
          </label>
          <select
            value={formData.difficulty || TestDifficulty.MEDIUM}
            onChange={(e) =>
              onChange({ difficulty: e.target.value as TestDifficulty })
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
          >
            <option value={TestDifficulty.EASY}>Easy</option>
            <option value={TestDifficulty.MEDIUM}>Medium</option>
            <option value={TestDifficulty.HARD}>Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category
          </label>
          <select
            value={formData.categoryId || ''}
            onChange={(e) => onChange({ categoryId: e.target.value || undefined })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
          >
            <option value="">Select Category</option>
            {categories.map((cat: any) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instructor(Optional) & Enrollment Fee(Optional) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Instructor(Optional)
          </label>
          <select
            value={formData.instructorId || instructors.find((i: any) => i.name === formData.instructorName)?.id || ''}
            onChange={(e) => {
              const selectedId = e.target.value;
              const found = instructors.find((inst: any) => inst.id === selectedId);
              onChange({
                instructorId: selectedId || undefined,
                instructorName: found ? found.name : undefined,
              });
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
          >
            <option value="">
              {isLoadingInstructors ? 'Loading instructors...' : 'Select Instructor'}
            </option>
            {formData.instructorId && !instructors.some((i: any) => i.id === formData.instructorId) && (
              <option value={formData.instructorId}>
                {formData.instructorName || 'Current Instructor'}
              </option>
            )}
            {instructors.map((inst: any) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} {inst.specialty ? `(${inst.specialty})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Enrollment Fee(Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="$200"
              value={formData.enrollmentFee?.amount ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                onChange({
                  enrollmentFee:
                    val !== undefined
                      ? { amount: val, currency: formData.enrollmentFee?.currency || 'USD' }
                      : undefined,
                });
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all"
            />
            <select
              value={formData.enrollmentFee?.currency || 'USD'}
              onChange={(e) =>
                onChange({
                  enrollmentFee: {
                    amount: formData.enrollmentFee?.amount || 0,
                    currency: e.target.value,
                  },
                })
              }
              className="w-24 px-2 py-2 text-sm rounded-lg border border-slate-300 bg-white outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          maxLength={2000}
          placeholder="Provide general context, reference chapters, or prerequisite topics..."
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-200 focus:border-[#005963] outline-none transition-all resize-none"
        />
        <div className="text-right text-[11px] text-slate-400">
          {(formData.description || '').length} / 2000
        </div>
      </div>

      {/* Bottom Row: Difficulty Level & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Difficulty Level
          </label>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            {[
              { level: TestDifficulty.EASY, label: 'Easy' },
              { level: TestDifficulty.MEDIUM, label: 'Medium' },
              { level: TestDifficulty.HARD, label: 'Hard' },
            ].map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => onChange({ difficulty: item.level })}
                className={`px-5 py-2 text-xs font-semibold rounded-md transition-all ${
                  formData.difficulty === item.level
                    ? 'bg-[#005963] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tags
          </label>
          <CreatableDropdown
            items={availableTags.map((t: any) => ({
              _id: t._id || t.id || (typeof t === 'string' ? t : t.name),
              name: typeof t === 'string' ? t : t.name || t._id,
            }))}
            value={formData.tags}
            multiple
            onChange={(newVal) => {
              onChange({ tags: Array.isArray(newVal) ? newVal : [newVal] });
            }}
            onCreate={async (newTag) => {
              const created = await createTagMutation.mutateAsync(newTag);
              if (!formData.tags.includes(newTag)) {
                onChange({ tags: [...formData.tags, newTag] });
              }
              return created;
            }}
            placeholder="+ Add Tag"
          />
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#005963] border border-teal-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => onChange({ tags: formData.tags.filter((t) => t !== tag) })}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
