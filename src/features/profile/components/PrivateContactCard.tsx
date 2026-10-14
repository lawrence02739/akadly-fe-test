interface PrivateContactCardProps {
  email: string;
  emailVerified: boolean;
  phone: string;
  onPhoneChange: (value: string) => void;
  disabled?: boolean;
}

export default function PrivateContactCard({
  email,
  emailVerified,
  phone,
  onPhoneChange,
  disabled = false,
}: PrivateContactCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Private contact details
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Not shown to learners. Used for account and academy communications.
        </p>
      </div>

      <div className="space-y-5">
        {/* Email Row */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Email address
          </label>
          <div className="mt-1.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-800">
                {email || '—'}
              </span>
              {emailVerified ? (
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  Unverified
                </span>
              )}
            </div>

            <button
              type="button"
              disabled
              title="Change email is coming soon"
              className="self-start rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed sm:self-auto"
            >
              Change email
            </button>
          </div>
        </div>

        {/* Phone Row */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Phone · private
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            disabled={disabled}
            placeholder="+91 98765 43210"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69] disabled:bg-slate-50"
          />
        </div>
      </div>
    </div>
  );
}
