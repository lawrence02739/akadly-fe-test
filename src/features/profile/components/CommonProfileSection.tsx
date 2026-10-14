import PhotoUploader from './PhotoUploader';

interface CommonProfileSectionProps {
  initials: string;
  photoUrl: string | null;
  onPhotoUploaded: (key: string, previewUrl: string) => void;
  onPhotoRemoved: () => void;
  firstName: string;
  onFirstNameChange: (value: string) => void;
  lastName: string;
  onLastNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  bio: string;
  onBioChange: (value: string) => void;
  dateOfBirth: string;
  onDateOfBirthChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  disabled?: boolean;
}

export default function CommonProfileSection({
  initials,
  photoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  phone,
  onPhoneChange,
  location,
  onLocationChange,
  bio,
  onBioChange,
  dateOfBirth,
  onDateOfBirthChange,
  gender,
  onGenderChange,
  disabled = false,
}: CommonProfileSectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-slate-900">
          Personal Profile
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Update your personal account details.
        </p>
      </div>

      <div className="mb-6">
        <PhotoUploader
          initials={initials}
          photoUrl={photoUrl}
          onPhotoUploaded={onPhotoUploaded}
          onPhotoRemoved={onPhotoRemoved}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            First name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            disabled={disabled}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Last name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            disabled={disabled}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            disabled={disabled}
            placeholder="+91 98765 43210"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. Bengaluru, India"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Date of birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => onDateOfBirthChange(e.target.value)}
            disabled={disabled}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Gender
          </label>
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            disabled={disabled}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-xs font-semibold text-slate-700">
          Personal bio
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          disabled={disabled}
          placeholder="A short note about yourself..."
          className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
        />
      </div>
    </div>
  );
}
