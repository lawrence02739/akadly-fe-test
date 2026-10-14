import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import ChangePasswordDialog from '../components/ChangePasswordDialog';
import ManagedAccessCard from '../components/ManagedAccessCard';
import ProfileSettingsLayout from '../components/ProfileSettingsLayout';
import SessionsTable from '../components/SessionsTable';
import {
  useInstructorSelfProfileQuery,
  useMyAuth,
  useSecurityOverviewQuery,
} from '../hooks/useProfile';
import { isInstructorUser } from '../utils/profile.utils';

function formatPasswordDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Never';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return 'Recently';
  }
}

export default function AccountSecurityPage() {
  const { data: authData } = useMyAuth();
  const { data: security, isLoading: securityLoading } =
    useSecurityOverviewQuery();
  const { data: instructorProfile } = useInstructorSelfProfileQuery();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const isInstructor = isInstructorUser(authData, reduxUser, instructorProfile);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
    <ProfileSettingsLayout
      title="Account & Security"
      description="Manage your sign-in details, account protection and active sessions."
    >
      <div className="space-y-6">
        {/* Top 2 Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sign-in details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Sign-in details
            </h2>

            <div className="mt-5 space-y-5">
              {/* Email */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {security?.email || authData?.email || '—'}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Verified
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your personal sign-in email
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    disabled
                    title="Change email is coming soon"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-400 cursor-not-allowed"
                  >
                    Change email
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-slate-800">
                      Password · ••••••••••••
                    </span>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Last changed{' '}
                      {securityLoading
                        ? '...'
                        : formatPasswordDate(security?.passwordChangedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordDialogOpen(true)}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Two-factor authentication (Disabled) */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Two-factor authentication
              </h2>
              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                Not enabled
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Add an authenticator app to protect your account.
            </p>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600">
              <p>
                Scan a QR code in your authenticator app, verify a code, then save your recovery codes privately.
              </p>
              <p className="text-slate-500">
                Two-factor protection starts only after setup and verification are complete.
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                disabled
                title="Two-factor authentication is coming soon"
                className="rounded-lg bg-[#0C5A69] px-4 py-2 text-xs font-medium text-white opacity-60 cursor-not-allowed"
              >
                Set up authenticator
              </button>
            </div>
          </div>
        </div>

        {/* Active sessions */}
        <SessionsTable />

        {/* Academy-managed access (for instructor) */}
        {isInstructor && instructorProfile && (
          <ManagedAccessCard profile={instructorProfile} />
        )}
      </div>

      <ChangePasswordDialog
        isOpen={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
      />
    </ProfileSettingsLayout>
  );
}
