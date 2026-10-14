import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getConvertibleUsers } from '../api/instructors.api';
import type { ConvertibleUserItem } from '../types/instructor.types';
import ConvertToInstructorDialog from './ConvertToInstructorDialog';

interface ConvertExistingUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConvertExistingUserDialog({
  isOpen,
  onClose,
  onSuccess,
}: ConvertExistingUserDialogProps) {
  const [users, setUsers] = useState<ConvertibleUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ConvertibleUserItem | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setSearch('');
      return;
    }

    let active = true;
    setLoading(true);
    void getConvertibleUsers(search)
      .then((items) => {
        if (active) setUsers(items);
      })
      .catch((err: unknown) => {
        if (active) {
          const msg =
            (err as { message?: string })?.message ||
            'Failed to load convertible users';
          toast.error(msg);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, search]);

  if (!isOpen) return null;

  // If user is selected, render the conversion form dialog
  if (selectedUser) {
    return (
      <ConvertToInstructorDialog
        isOpen={true}
        onClose={() => {
          setSelectedUser(null);
          onClose();
        }}
        memberId={selectedUser.memberId || selectedUser.id}
        memberName={selectedUser.name}
        memberEmail={selectedUser.email}
        onSuccess={() => {
          setSelectedUser(null);
          onSuccess();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Convert existing user to instructor
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Select an internal user from your organization to convert into an instructor.
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-slate-300 py-2 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0C5A69] focus:ring-1 focus:ring-[#0C5A69]"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Loading available users...
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No eligible users found for conversion.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.memberId || user.id}
                onClick={() => setSelectedUser(user)}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-[#0C5A69] hover:bg-slate-50 cursor-pointer"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {user.name}
                  </h4>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  {user.roleNames && user.roleNames.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {user.roleNames.map((r, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-[#0C5A69] transition hover:bg-teal-100"
                >
                  Select
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
