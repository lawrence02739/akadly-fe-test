import PhotoUploader from './PhotoUploader';

interface LearnerVisibleSectionProps {
  initials: string;
  photoUrl: string | null;
  onPhotoUploaded: (key: string, previewUrl: string) => void;
  onPhotoRemoved: () => void;
  fullName: string;
  onFullNameChange: (value: string) => void;
  professionalTitle: string;
  onProfessionalTitleChange: (value: string) => void;
  expertise: string[];
  onExpertiseChange: (value: string[]) => void;
  bio: string;
  onBioChange: (value: string) => void;
  showBioToLearners: boolean;
  onShowBioToLearnersChange: (value: boolean) => void;
  academyName?: string;
  disabled?: boolean;
}

export default function LearnerVisibleSection({
  initials,
  photoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
  fullName,
  onFullNameChange,
  professionalTitle,
  onProfessionalTitleChange,
  expertise,
  onExpertiseChange,
  bio,
  onBioChange,
  showBioToLearners,
  onShowBioToLearnersChange,
  academyName = 'Akadly Academy',
  disabled = false,
}: LearnerVisibleSectionProps) {
  // Expertise joined with " · " or comma
  const expertiseText = expertise.join(' · ');

  const handleExpertiseInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // split by comma or dot/middle dot
    const parts = raw
      .split(/[,·]/)
      .map((s) => s.trim())
      .filter(Boolean);
    onExpertiseChange(parts);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Learner-visible profile
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Shown within your assigned courses at {academyName}.
        </p>
      </div>

      {/* Photo Uploader */}
      <div className="mb-6">
        <PhotoUploader
          initials={initials}
          photoUrl={photoUrl}
          onPhotoUploaded={onPhotoUploaded}
          onPhotoRemoved={onPhotoRemoved}
          disabled={disabled}
        />
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Full name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Akif Ansari"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Professional title
          </label>
          <input
            type="text"
            value={professionalTitle}
            onChange={(e) => onProfessionalTitleChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Frontend educator"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Expertise */}
      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-700">
          Expertise
        </label>
        <input
          type="text"
          value={expertiseText}
          onChange={handleExpertiseInput}
          disabled={disabled}
          placeholder="e.g. React.js, JavaScript, Web accessibility"
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Separate skills with commas (e.g. React.js, TypeScript, UI/UX). Up to 15 skills.
        </p>
      </div>

      {/* Bio */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            Bio
          </label>
          <span className="text-[11px] text-slate-400">
            {bio.length} / 500
          </span>
        </div>
        <textarea
          rows={3}
          value={bio}
          maxLength={500}
          onChange={(e) => onBioChange(e.target.value)}
          disabled={disabled}
          placeholder="Short bio for your students..."
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50 resize-y"
        />
      </div>

      {/* Checkbox: Show bio and expertise */}
      <div className="mt-5 flex items-start gap-3">
        <input
          id="showBioToLearners"
          type="checkbox"
          checked={showBioToLearners}
          onChange={(e) => onShowBioToLearnersChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
        />
        <label
          htmlFor="showBioToLearners"
          className="cursor-pointer select-none"
        >
          <span className="block text-xs font-semibold text-slate-800">
            Show bio and expertise to learners
          </span>
          <span className="block text-xs text-slate-500">
            Your name remains visible on assigned courses and discussions.
          </span>
        </label>
      </div>
    </div>
  );
}
