import React from 'react';
import { Info } from 'lucide-react';
import type { InstructorListItem } from '../types/instructor.types';

interface InvitationBannerProps {
  instructors: InstructorListItem[];
}

export const InvitationBanner: React.FC<InvitationBannerProps> = ({
  instructors,
}) => {
  const invitedList = instructors.filter((i) => i.status === 'invited');
  if (invitedList.length === 0) return null;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-sm text-teal-900">
      <Info className="h-5 w-5 shrink-0 text-teal-700" />
      <div className="flex-1">
        <span className="font-semibold text-teal-950">
          Pending invitations are not active accounts.
        </span>{' '}
        <span>
          {invitedList.length}{' '}
          {invitedList.length === 1 ? 'instructor has' : 'instructors have'} a
          pending invitation link that expires 7 days after issuance. Instructors
          can only access the portal once they complete password setup and verify
          their account.
        </span>
      </div>
    </div>
  );
};
