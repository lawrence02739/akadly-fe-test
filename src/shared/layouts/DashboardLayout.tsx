import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AccessRoute from "../auth/AccessRoute";
import type { RootState } from "../../store";

export default function DashboardLayout() {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  const isPaymentPage = location.pathname === "/partner/payments";
  const readOnly = !!user?.isReadOnly;

  return (
    <AccessRoute>
      <div className="flex h-screen bg-body overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNav />
          {readOnly && (
            <div className="flex items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
              <span>
                <strong>Read-only mode.</strong> Your payment is overdue, so
                changes are paused until payment is settled.
              </span>
              {!isPaymentPage && (
                <Link
                  to="/partner/payments"
                  className="shrink-0 rounded-md bg-amber-700 px-3 py-1.5 font-semibold text-white hover:bg-amber-800"
                >
                  View payment
                </Link>
              )}
            </div>
          )}
          <main className="flex-1 overflow-y-auto p-2">
            <div
              className={
                readOnly && !isPaymentPage
                  ? "pointer-events-none select-none opacity-80"
                  : undefined
              }
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AccessRoute>
  );
}
