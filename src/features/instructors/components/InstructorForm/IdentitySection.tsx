import React, { useState } from 'react';
import { X } from 'lucide-react';

interface IdentitySectionProps {
  name: string;
  onChangeName: (val: string) => void;
  email: string;
  onChangeEmail: (val: string) => void;
  emailReadOnly?: boolean;
  phone: string;
  onChangePhone: (val: string) => void;
  specialty: string;
  onChangeSpecialty: (val: string) => void;
  specialties: string[];
  expertise: string[];
  onChangeExpertise: (tags: string[]) => void;
  bio: string;
  onChangeBio: (val: string) => void;
  errors: Record<string, string | undefined>;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({
  name,
  onChangeName,
  email,
  onChangeEmail,
  emailReadOnly = false,
  phone,
  onChangePhone,
  specialty,
  onChangeSpecialty,
  specialties,
  expertise,
  onChangeExpertise,
  bio,
  onChangeBio,
  errors,
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,|,$/g, '');
      if (trimmed && !expertise.includes(trimmed) && expertise.length < 15) {
        onChangeExpertise([...expertise, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChangeExpertise(expertise.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <h3 className="text-base font-semibold text-slate-900">
        Identity & Expertise
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Basic profile details and area of instruction.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          {(() => {
            const nameError = errors.fullName || errors.name;
            return (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onChangeName(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith"
                  className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                    nameError
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
                  }`}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-rose-500">{nameError}</p>
                )}
              </>
            );
          })()}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            disabled={emailReadOnly}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="instructor@institution.com"
            className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
              emailReadOnly
                ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                : errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Phone Number <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
          />
        </div>

        {/* Specialty Combobox */}
        <div>
          <label className="block text-xs font-medium text-slate-700">
            Specialty / Subject <span className="text-rose-500">*</span>
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              list="specialty-options"
              value={specialty}
              onChange={(e) => onChangeSpecialty(e.target.value)}
              placeholder="e.g. Computer Science"
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                errors.specialty
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-200 focus:border-[#0C5A69] focus:ring-[#0C5A69]'
              }`}
            />
            <datalist id="specialty-options">
              {specialties.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          {errors.specialty && (
            <p className="mt-1 text-xs text-rose-500">{errors.specialty}</p>
          )}
        </div>

        {/* Expertise tags (comma-separated chips) */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700">
            Expertise Tags{' '}
            <span className="text-slate-400">
              (press Enter or comma to add, max 15)
            </span>
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 p-2 focus-within:border-[#0C5A69] focus-within:ring-1 focus-within:ring-[#0C5A69]">
            {expertise.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-teal-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {expertise.length < 15 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={
                  expertise.length === 0
                    ? 'Type tags e.g. React, Python, Machine Learning...'
                    : 'Add tag...'
                }
                className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-700">
              Short Bio <span className="text-slate-400">(optional)</span>
            </label>
            <span className="text-xs text-slate-400">
              {bio.length} / 500 characters
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => onChangeBio(e.target.value)}
            placeholder="Brief overview of background and experience..."
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:outline-none focus:ring-1 focus:ring-[#0C5A69]"
          />
        </div>
      </div>
    </div>
  );
};
