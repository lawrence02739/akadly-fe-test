import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AccessRoute from "../auth/AccessRoute";

export default function DashboardLayout() {
  return (
    <AccessRoute>
      <div className="flex h-screen flex-col overflow-hidden bg-body md:flex-row">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-2">
            <Outlet />
          </main>
        </div>
      </div>
    </AccessRoute>
  );
}
