import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { removeInstructorRole } from '../api/instructors.api';

interface RemoveInstructorRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId: string;
  instructorName: string;
  assignmentsCount?: number;
  onSuccess: () => void;
}

export default function RemoveInstructorRoleDialog({
  isOpen,
  onClose,
  instructorId,
  instructorName,
  assignmentsCount = 0,
  onSuccess,
}: RemoveInstructorRoleDialogProps) {
  const [removeAssignments, setRemoveAssignments] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assignmentsCount > 0 && !removeAssignments) {
      toast.error(
        `Please confirm removal of the ${assignmentsCount} active course/cohort assignment(s).`,
      );
      return;
    }

    try {
      setLoading(true);
      await removeInstructorRole(instructorId, {
        removeAssignments: assignmentsCount > 0 ? removeAssignments : false,
      });

      toast.success(
        `Instructor role removed from ${instructorName}. Converted back to standard user.`,
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to remove instructor role';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 text-amber-600">
          <div className="rounded-full bg-amber-100 p-2">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Remove Instructor Role
          </h2>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Are you sure you want to remove the Instructor role from{' '}
          <strong className="text-slate-800">{instructorName}</strong>?
        </p>

        <div className="mt-3 rounded-lg bg-amber-50/80 p-3 text-xs text-amber-800">
          <p className="font-semibold">Notice:</p>
          <ul className="mt-1 list-disc pl-4 space-y-1">
            <li>Instructor teaching privileges will be revoked immediately.</li>
            <li>All active sessions for this user will be signed out.</li>
            <li>
              Instructor profile information will be preserved dormant in case the role is re-assigned later.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {assignmentsCount > 0 && (
            <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={removeAssignments}
                  onChange={(e) => setRemoveAssignments(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-medium text-rose-900">
                  Acknowledge and remove {assignmentsCount} active course/cohort assignment(s)
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {loading ? 'Removing...' : 'Remove Instructor Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
