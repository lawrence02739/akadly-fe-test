import React from 'react';
import { Mail, CalendarCheck } from 'lucide-react';
import { InstructorType } from '../../types/instructor.types';

interface InvitationCardProps {
  instructorType: InstructorType;
  sendInvitation: boolean;
  onChangeSendInvitation: (val: boolean) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  instructorType,
  sendInvitation,
  onChangeSendInvitation,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 text-slate-900">
        <Mail className="h-5 w-5 text-[#0C5A69]" />
        <h4 className="text-sm font-semibold">Invitation & Activation</h4>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Control initial onboarding and invitation delivery.
      </p>

      <div className="mt-4 space-y-3">
        {/* Send invitation checkbox */}
        <label className="flex items-start gap-3 rounded-lg border border-teal-100 bg-teal-50/30 p-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={sendInvitation}
            onChange={(e) => onChangeSendInvitation(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0C5A69] focus:ring-[#0C5A69]"
          />
          <div>
            <span className="block text-xs font-semibold text-slate-900">
              Send an email invitation
            </span>
            <span className="block text-[11px] text-slate-500 leading-tight">
              Profile will be marked Invited. A single-use secure setup link valid for 7 days will be emailed.
            </span>
          </div>
        </label>

        {/* Accept & verify email (informational only) */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 opacity-80">
          <span className="block text-xs font-medium text-slate-600">
            Acceptance & Verification
          </span>
          <span className="block text-[11px] text-slate-500 leading-tight">
            The instructor sets their own password and confirms identity before gaining workspace access.
          </span>
        </div>

        {/* Guest Schedule preview */}
        {instructorType === InstructorType.GUEST && (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-semibold text-amber-950">
              <CalendarCheck className="h-4 w-4 text-amber-700" />
              Invitation Schedule
            </div>
            <div className="mt-1.5 space-y-1 text-[11px] text-amber-800">
              <p>• Dispatched immediately upon review</p>
              <p>• Link expires 7 days from send date</p>
              <p>• Engagement window enforced during sign in</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
