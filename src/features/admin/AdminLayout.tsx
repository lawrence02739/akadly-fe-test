import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  BarChart3,
  CreditCard,
  Lightbulb,
  LogOut,
  Menu,
  Settings,
  Ticket,
  Users,
  X,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAdminSession } from "./AdminSession";

const links = [
  { to: "/admin/tenants", label: "Tenants", icon: Building2 },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/addons", label: "Add-ons", icon: CreditCard },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket },
  { to: "/admin/feature-requests", label: "Feature Requests", icon: Lightbulb },
  { to: "/admin/tenant-configuration", label: "Tenant configuration", icon: SlidersHorizontal },
  {
    to: "/admin/settings/feature-request-categories",
    label: "Feature request settings",
    icon: Settings,
  },
  {
    to: "/admin/tickets/dashboard",
    label: "Ticket Dashboard",
    icon: BarChart3,
  },
  { to: "/admin/team", label: "Team Management", icon: Users },
  {
    to: "/admin/settings/organization-documents",
    label: "Organization documents",
    icon: Settings,
  },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAdminSession();
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const isTenantConfiguration = pathname.startsWith("/admin/tenant-configuration");

  const logout = async () => {
    try {
      await signOut();
    } catch {
      toast.error("Server logout failed; local session cleared.");
    }
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f6f8] md:flex">
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${isTenantConfiguration ? "md:w-[68px]" : ""}`}
      >
        <div className={`flex h-20 items-center justify-between border-b border-slate-100 px-5 ${isTenantConfiguration ? "md:justify-center md:px-2" : ""}`}>
          <Link
            to="/admin/tenants"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 text-slate-900"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0C5A69] font-bold text-white">
              A
            </span>
            <span className={`font-bold ${isTenantConfiguration ? "md:hidden" : ""}`}>
              Akadly <span className="text-[#0C5A69]">Admin</span>
            </span>
          </Link>
          <button
            type="button"
            className="md:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Admin navigation" className={`flex-1 space-y-1 overflow-y-auto p-4 ${isTenantConfiguration ? "md:px-2" : ""}`}>
          <p className={`px-3 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400 ${isTenantConfiguration ? "md:sr-only" : ""}`}>
            Platform
          </p>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold ${isTenantConfiguration ? "md:justify-center md:px-2" : ""} ${isActive ? "bg-[#e7f2f4] text-[#0C5A69]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
              }
            >
              <Icon size={19} />
              <span className={isTenantConfiguration ? "md:sr-only" : ""}>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={`border-t border-slate-100 p-4 ${isTenantConfiguration ? "md:px-2" : ""}`}>
          <p className={`truncate px-3 text-sm font-semibold text-slate-800 ${isTenantConfiguration ? "md:sr-only" : ""}`}>
            {profile?.displayName || "Admin"}
          </p>
          <p className={`truncate px-3 text-xs text-slate-500 ${isTenantConfiguration ? "md:sr-only" : ""}`}>
            {profile?.email}
          </p>
          <button
            type="button"
            onClick={logout}
            className={`mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 ${isTenantConfiguration ? "md:justify-center md:px-2" : ""}`}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} /> <span className={isTenantConfiguration ? "md:sr-only" : ""}>Sign out</span>
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-5 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            <Menu size={23} />
          </button>
          <span className="ml-4 font-semibold">Akadly Admin</span>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
