import { Plus, Search, Sparkles } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { mockCourses } from '../../../data/mockCourses';
import { useNavigate } from 'react-router-dom';

export default function CoursesDashboard() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and configure all your academic modules and contents
          </p>
        </div>
        <button 
          onClick={() => navigate('/partner/courses/create')}
          className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          Create Course
        </button>
      </div>

      {/* AI Banner */}
      <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-accent-500 font-semibold text-sm">AI Recommendation Studio</h3>
            <p className="text-slate-600 text-sm mt-0.5">
              Based on recent learner metrics, adding interactive coding labs to "React.js Fundamentals" could boost completion rates by 18%.
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white border border-accent-200 text-accent-500 text-sm font-semibold rounded-lg hover:bg-accent-50 transition-colors whitespace-nowrap">
          Apply suggestion
        </button>
      </div>

      {/* Filters (Simplified mock) */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-4 text-sm overflow-x-auto">
        <div className="flex-1 min-w-[200px] relative px-2">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Search titles..." className="w-full pl-8 pr-3 py-1.5 focus:outline-none" />
        </div>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"><option>All Prices</option></select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"><option>All Levels</option></select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"><option>English</option></select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"><option>UI/UX & Frontend</option></select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer"><option>Newest</option></select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <div className="flex-1 min-w-[150px] relative px-2">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input type="text" placeholder="Any Length" className="w-full pl-8 pr-3 py-1.5 focus:outline-none" />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-slate-500 font-medium">Showing 1-3 of 24 courses</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Previous</button>
          <button className="w-8 h-8 rounded-lg bg-primary-800 text-white text-sm font-medium flex items-center justify-center shadow-sm">1</button>
          <button className="w-8 h-8 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center">2</button>
          <button className="w-8 h-8 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center">3</button>
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  );
}
