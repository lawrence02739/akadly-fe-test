import {
  Bell,
  Lock,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { useInstructorSelfProfileQuery, useMyAuth } from '../hooks/useProfile';
import { isInstructorUser } from '../utils/profile.utils';

interface ProfileSettingsLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

export default function ProfileSettingsLayout({
  title,
  description,
  children,
  onSave,
  onCancel,
  isSaving = false,
  isDirty = false,
}: ProfileSettingsLayoutProps) {
  const { data: authData } = useMyAuth();
  const { data: instructorProfile } = useInstructorSelfProfileQuery();
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const isInstructor = isInstructorUser(authData, reduxUser, instructorProfile);
  const roleName = isInstructor
    ? 'Instructor'
    : (authData?.access?.roles?.[0]?.name || authData?.roles?.[0]?.name || 'Member');
  const academyName = authData?.name ? `${authData.name}'s Academy` : 'Akadly Academy';
  const displayName = authData?.profile
    ? `${authData.profile.firstName || ''} ${authData.profile.lastName || ''}`.trim() || authData.name
    : authData?.name || 'User';

  const navItems = [
    {
      to: '/partner/settings/profile',
      label: 'My profile',
      icon: UserRound,
      visible: true,
    },
    {
      to: '/partner/settings/account-security',
      label: 'Account & security',
      icon: Lock,
      visible: true,
    },
    {
      to: '/partner/settings/notifications',
      label: 'Notification preferences',
      icon: Bell,
      visible: isInstructor,
    },
    {
      to: '/partner/settings/teaching',
      label: 'Teaching preferences',
      icon: SlidersHorizontal,
      visible: isInstructor,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        {onSave && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center justify-center rounded-lg bg-[#0C5A69] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0a4854] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Nav Card */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                My Account
              </span>
              <h2 className="mt-1 text-base font-semibold text-slate-900 truncate">
                {displayName}
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {roleName} · {academyName}
              </p>
            </div>

            <nav className="flex flex-col space-y-1">
              {navItems
                .filter((item) => item.visible)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-slate-100 font-semibold text-[#0C5A69]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">{children}</div>
      </div>

      {/* Bottom Save Bar (optional matching Figma footer) */}
      {onSave && (
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="inline-flex items-center justify-center rounded-lg bg-[#0C5A69] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#0a4854] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  );
}
