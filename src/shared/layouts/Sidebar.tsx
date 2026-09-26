import {
  Home,
  Book,
  Users,
  ClipboardList,
  Calendar,
  BarChart2,
  MessageSquare,
  Search,
  Sparkles,
  Settings,
  HelpCircle,
  FileText,
  BookOpen,
  Package,
  ChartNoAxesCombined,
  Ticket,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const navItems = [
  { icon: Home, label: "Home", path: "/partner/home", permissions: [] },
  {
    icon: ChartNoAxesCombined,
    label: "Reports",
    path: "/partner/reports",
    permissions: [],
  },
  {
    icon: Ticket,
    label: "Tickets",
    path: "/partner/tickets",
    permissions: [],
  },
  {
    icon: Book,
    label: "Courses",
    path: "/partner/courses",
    permissions: ["course:read", "course:manage"],
  },
  {
    icon: FileText,
    label: "Forms",
    path: "/partner/forms",
    permissions: [],
  },
  {
    icon: BookOpen,
    label: "Books",
    path: "/partner/books",
    permissions: ["book:read", "book:manage"],
  },
  {
    icon: Package,
    label: "Orders",
    path: "/partner/orders",
    permissions: ["order:read", "order:manage"],
  },
  {
    icon: Users,
    label: "Users",
    path: "/partner/users",
    permissions: ["member:read"],
  },
  {
    icon: ClipboardList,
    label: "Tasks",
    path: "/partner/tasks",
    permissions: ["task:read", "task:manage"],
  },
  {
    icon: Calendar,
    label: "Calendar",
    path: "/partner/calendar",
    permissions: ["calendar:read", "calendar:manage"],
  },
  {
    icon: HelpCircle,
    label: "Quiz Studio",
    path: "/partner/quiz-studio",
    permissions: [],
  },
  {
    icon: FileText,
    label: "Test Studio",
    path: "/partner/test-studio",
    permissions: [],
  },
  {
    icon: BookOpen,
    label: "Question Bank",
    path: "/partner/question-bank",
    permissions: [],
  },
  {
    icon: BarChart2,
    label: "Analytics",
    path: "/partner/analytics",
    permissions: ["analytics:read"],
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/partner/messages",
    permissions: ["message:read", "message:send", "message:manage"],
  },
];

export default function Sidebar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const granted = new Set(user?.permissions ?? []);
  const visibleItems = navItems.filter(
    (item) =>
      user?.isOwner ||
      !item.permissions ||
      item.permissions.length === 0 ||
      item.permissions.some((permission) => granted.has(permission)),
  );
  return (
    <aside className="order-2 flex h-16 w-full shrink-0 items-center border-t border-slate-200 bg-sidebar px-3 py-2 md:order-none md:h-full md:w-20 md:flex-col md:border-r md:border-t-0 md:px-0 md:py-6">
      {/* Logo */}
      <div className="mb-8 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-800 md:flex">
        <span className="text-white font-bold text-lg">A</span>
      </div>

      {/* Nav Items */}
      <nav className="flex h-full w-full min-w-0 items-center gap-2 overflow-x-auto px-1 [scrollbar-width:none] md:min-h-0 md:flex-1 md:flex-col md:gap-3 md:overflow-x-hidden md:overflow-y-auto md:px-2 md:pb-3">
        {visibleItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                isActive
                  ? "bg-primary-800 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`
            }
            title={item.label}
          >
            <item.icon className="w-5 h-5" strokeWidth={2.5} />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto hidden flex-col items-center gap-6 md:flex">
        {(user?.isOwner || granted.has("search:use")) && (
          <NavLink
            to="/partner/search"
            title="Search"
            className={({ isActive }) =>
              `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive
                ? "bg-primary-800 text-white shadow-md"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`
            }
          >
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </NavLink>
        )}
        {(user?.isOwner ||
          granted.has("ai:use") ||
          granted.has("ai:manage")) && (
            <NavLink
              to="/partner/ai-assistant"
              title="AI Assistant"
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive
                  ? "bg-accent-500 text-white shadow-md"
                  : "text-accent-500 hover:bg-accent-50"
                }`
              }
            >
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            </NavLink>
          )}
        {(user?.isOwner ||
          granted.has("settings:read") ||
          granted.has("settings:manage")) && (
            <NavLink
              to="/partner/settings"
              title="Settings"
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive
                  ? "bg-primary-800 text-white shadow-md"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`
              }
            >
              <Settings className="w-5 h-5" strokeWidth={2.5} />
            </NavLink>
          )}
      </div>
    </aside>
  );
}
