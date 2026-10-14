interface LearnerPreviewCardProps {
  initials: string;
  photoUrl: string | null;
  fullName: string;
  professionalTitle: string;
  expertise: string[];
  bio: string;
  showBioToLearners: boolean;
}

export default function LearnerPreviewCard({
  initials,
  photoUrl,
  fullName,
  professionalTitle,
  expertise,
  bio,
  showBioToLearners,
}: LearnerPreviewCardProps) {
  const expertiseText = expertise.join(' · ');

  return (
    <div className="flex flex-col">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Learner preview
          </h2>
          <p className="text-xs text-slate-500">
            Within your assigned courses
          </p>
        </div>

        {/* Inner Card representing learner view */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
          {/* Avatar */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-sky-50 text-base font-semibold text-[#0C5A69]">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Instructor"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials || 'IN'}</span>
            )}
          </div>

          {/* Name & Title */}
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {fullName || 'Your Name'}
            </h3>
            {professionalTitle ? (
              <p className="mt-0.5 text-xs text-slate-600">
                {professionalTitle}
              </p>
            ) : null}
          </div>

          {showBioToLearners && (expertiseText || bio) ? (
            <>
              <div className="my-4 border-t border-slate-200/70" />

              {expertiseText ? (
                <div className="mb-3 text-xs font-medium text-slate-700">
                  {expertiseText}
                </div>
              ) : null}

              {bio ? (
                <p className="text-xs leading-relaxed text-slate-600">
                  {bio}
                </p>
              ) : null}
            </>
          ) : null}

          <div className="mt-4">
            <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-[#0C5A69] ring-1 ring-inset ring-[#0C5A69]/20">
              Instructor
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 px-1 text-[11px] leading-relaxed text-slate-500">
        Contact details are private. Updating this profile does not change your academy role or course assignments.
      </p>
    </div>
  );
}
