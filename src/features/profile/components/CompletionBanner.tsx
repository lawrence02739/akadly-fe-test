interface CompletionBannerProps {
  percent: number;
  missing: string[];
}

export default function CompletionBanner({
  percent,
  missing,
}: CompletionBannerProps) {
  if (percent >= 100) return null;

  const missingLabels = missing
    .map((item) => {
      switch (item) {
        case 'title':
          return 'professional title';
        case 'expertise':
          return 'expertise';
        case 'bio':
          return 'bio';
        case 'photo':
          return 'profile photo';
        default:
          return item;
      }
    })
    .join(', ');

  return (
    <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50/70 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0C5A69]">
            Complete your instructor profile ({percent}% completed)
          </h3>
          <p className="text-xs text-teal-800">
            {missing.length > 0
              ? `Add your ${missingLabels} so learners can know more about you.`
              : 'Add remaining details to complete your profile.'}
          </p>
        </div>

        <div className="w-full sm:w-48">
          <div className="h-2 w-full overflow-hidden rounded-full bg-teal-200/60">
            <div
              className="h-full rounded-full bg-[#0C5A69] transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
