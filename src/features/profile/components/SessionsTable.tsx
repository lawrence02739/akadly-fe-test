import { useState } from 'react';
import {
  useActiveSessionsQuery,
  useRevokeSessionMutation,
  useSignOutOtherSessionsMutation,
} from '../hooks/useProfile';

function formatActivityTime(isoDate: string): string {
  if (!isoDate) return '—';
  try {
    const d = new Date(isoDate);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoDate;
  }
}

export default function SessionsTable() {
  const { data: sessions, isLoading } = useActiveSessionsQuery();
  const revokeMutation = useRevokeSessionMutation();
  const signOutOthersMutation = useSignOutOtherSessionsMutation();
  const [confirmSignOutOthers, setConfirmSignOutOthers] = useState(false);

  const handleSignOutOthers = () => {
    signOutOthersMutation.mutate(undefined, {
      onSuccess: () => {
        setConfirmSignOutOthers(false);
      },
    });
  };

  const hasOtherSessions = sessions?.some((s) => !s.isCurrent) ?? false;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">
          Active sessions
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Review where you're signed in. Times are shown in IST.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-4 py-3">Device / browser</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Last activity</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading active sessions...
                </td>
              </tr>
            ) : !sessions || sessions.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No active sessions found.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {session.device?.label ||
                      `${session.device?.browser || 'Browser'} · ${session.device?.os || 'Device'}`}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {session.location || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatActivityTime(session.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {session.isCurrent ? (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        This session
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => revokeMutation.mutate(session.id)}
                        disabled={revokeMutation.isPending}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        Sign out
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasOtherSessions && (
        <div className="mt-4 flex items-center justify-start">
          {confirmSignOutOthers ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium">
                Sign out of all other devices?
              </span>
              <button
                type="button"
                onClick={handleSignOutOthers}
                disabled={signOutOthersMutation.isPending}
                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {signOutOthersMutation.isPending ? 'Signing out...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmSignOutOthers(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmSignOutOthers(true)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Sign out other sessions
            </button>
          )}
        </div>
      )}
    </div>
  );
}
