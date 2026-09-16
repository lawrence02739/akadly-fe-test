import { useState, useMemo } from 'react';
import { Plus, Search, Sparkles, Loader2 } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { useNavigate } from 'react-router-dom';
import { useListCourses } from '../hooks/useCourses';
import { useCategories, useTags } from '../hooks/useMasterData';

export default function CoursesDashboard() {
  const navigate = useNavigate();
  const { data: courses, isLoading, isError } = useListCourses();
  const { data: categories } = useCategories();
  const { data: tagsList } = useTags();

  // Filter state
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Apply filters and sort
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    let result = [...courses];
    
    if (searchTitle) {
      result = result.filter(c => c.title.toLowerCase().includes(searchTitle.toLowerCase()));
    }
    if (selectedCategory) {
      result = result.filter(c => c.category === selectedCategory);
    }
    if (selectedTag) {
      result = result.filter(c => c.tags?.includes(selectedTag));
    }
    if (selectedLanguage) {
      result = result.filter(c => c.language === selectedLanguage);
    }
    if (selectedLevel) {
      result = result.filter(c => c.level === selectedLevel);
    }
    if (selectedStatus) {
      result = result.filter(c => c.status === selectedStatus);
    }
    
    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [courses, searchTitle, selectedCategory, selectedTag, selectedLanguage, selectedLevel, selectedStatus, sortBy]);

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

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-4 text-sm overflow-x-auto">
        <div className="flex-1 min-w-[180px] relative px-2">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search titles..." 
             value={searchTitle}
             onChange={e => setSearchTitle(e.target.value)}
             className="w-full pl-8 pr-3 py-1.5 focus:outline-none" 
           />
        </div>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer">
          <option value="">Category</option>
          {categories?.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer max-w-[120px]">
          <option value="">Tags</option>
          {tagsList?.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer">
          <option value="">Language</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)} className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer">
          <option value="">Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer">
          <option value="">Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
        <div className="h-6 w-px bg-slate-200 shrink-0"></div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent font-medium text-slate-600 focus:outline-none cursor-pointer">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        {(searchTitle || selectedCategory || selectedTag || selectedLanguage || selectedLevel || selectedStatus || sortBy !== 'newest') && (
          <>
            <div className="h-6 w-px bg-slate-200 shrink-0"></div>
            <button 
              onClick={() => {
                setSearchTitle('');
                setSelectedCategory('');
                setSelectedTag('');
                setSelectedLanguage('');
                setSelectedLevel('');
                setSelectedStatus('');
                setSortBy('newest');
              }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors shrink-0"
            >
              Clear Filters
            </button>
          </>
        )}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">Failed to load courses.</div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
           {courses?.length === 0 ? 'No courses created yet. Click "Create Course" to get started.' : 'No courses match your current filters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-slate-500 font-medium">Showing 1-{filteredCourses.length} of {filteredCourses.length} courses</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 opacity-50 cursor-not-allowed">Previous</button>
          <button className="w-8 h-8 rounded-lg bg-primary-800 text-white text-sm font-medium flex items-center justify-center shadow-sm">1</button>
          <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 opacity-50 cursor-not-allowed">Next</button>
        </div>
      </div>
    </div>
  );
}
