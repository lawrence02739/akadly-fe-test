import { Search, Sparkles, Bell, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Basic logout logic for now
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      {/* Left Search */}
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" strokeWidth={2.5} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
          placeholder="Search..."
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Sparkles className="w-4 h-4" />
          Generate using AI
        </button>

        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button className="hover:text-slate-600 transition-colors">
            <Calendar className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">Akif Ansari</span>
            <span className="text-xs text-slate-500 font-medium">Instructor</span>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
