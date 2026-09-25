import { CreditCard, LockKeyhole } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";

function formatDate(value?: string | null): string {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not scheduled"
    : new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export default function PaymentsPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const overdue = !!user?.isReadOnly;

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <p className="text-sm font-semibold text-[#0C5A69]">
          Workspace billing
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Payment status
        </h1>
      </div>
      <div
        className={`rounded-2xl border p-6 ${overdue ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl p-3 ${overdue ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
          >
            {overdue ? (
              <LockKeyhole className="h-6 w-6" />
            ) : (
              <CreditCard className="h-6 w-6" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-slate-900">
              {overdue ? "Payment is overdue" : "Workspace payment is active"}
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              Payment due date: {formatDate(user?.dueDate)}.
            </p>
            {overdue && (
              <p className="mt-3 text-sm text-slate-700">
                The workspace stays available for viewing. Changes are enabled
                automatically after verified payment marks it as paid.
              </p>
            )}
          </div>
        </div>
      </div>
      {overdue && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-slate-900">Complete payment</h2>
          <p className="mt-2 text-sm text-slate-600">
            Online checkout will appear here after a payment provider is
            configured. Until then, contact the workspace administrator to
            settle the outstanding payment.
          </p>
        </div>
      )}
    </section>
  );
}
