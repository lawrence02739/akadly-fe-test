import { Home, Book, Users, ClipboardList, Calendar, BarChart2, MessageSquare, Search, Sparkles, Settings, HelpCircle, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Home', path: '/partner/home' },
  { icon: Book, label: 'Courses', path: '/partner/courses' },
  { icon: Users, label: 'Users', path: '/partner/users' },
  { icon: ClipboardList, label: 'Tasks', path: '/partner/tasks' },
  { icon: Calendar, label: 'Calendar', path: '/partner/calendar' },
  { icon: HelpCircle, label: 'Quiz Studio', path: '/partner/quiz-studio' },
  { icon: FileText, label: 'Test Studio', path: '/partner/test-studio' },
  { icon: BarChart2, label: 'Analytics', path: '/partner/analytics' },
  { icon: MessageSquare, label: 'Messages', path: '/partner/messages' },
];

export default function Sidebar() {
  return (
    <aside className="w-20 bg-sidebar border-r border-slate-200 flex flex-col items-center py-6 h-full shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center mb-8 shrink-0">
        <span className="text-white font-bold text-lg">A</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-6 w-full">
        {navItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-primary-800 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
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
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
          <Search className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-500 hover:bg-accent-50 transition-all">
          <Sparkles className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
          <Settings className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
}
