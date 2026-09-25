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
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const navItems = [
  { icon: Home, label: "Home", path: "/partner/home", permissions: [] },
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
    <aside className="w-20 bg-sidebar border-r border-slate-200 flex flex-col items-center py-6 h-full shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center mb-8 shrink-0">
        <span className="text-white font-bold text-lg">A</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-6 w-full">
        {visibleItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive
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
      <div className="flex flex-col items-center gap-6 mt-auto">
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
