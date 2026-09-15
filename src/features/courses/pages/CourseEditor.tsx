import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Settings, Layout, Globe, Lock, FileText, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCreateCourse, useGetCourse, useUpdateCourse } from '../hooks/useCourses';
import CourseDetailsTab from '../components/editor/CourseDetailsTab';
import PricingPlansTab from '../components/editor/PricingPlansTab';
import LandingPagesTab from '../components/editor/LandingPagesTab';
import AdvancedSettingsTab from '../components/editor/AdvancedSettingsTab';
import AccessControlTab from '../components/editor/AccessControlTab';

type TabId = 'details' | 'pricing' | 'landing' | 'advanced' | 'access';

export default function CourseEditor() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [courseData, setCourseData] = useState<any>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);

  const { data: existingCourse, isLoading } = useGetCourse(courseId);
  const { mutateAsync: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdateCourse();

  useEffect(() => {
    if (existingCourse) {
      setCourseData(existingCourse);
    }
  }, [existingCourse]);

  const handleFieldChange = (field: string, value: any) => {
    setCourseData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (courseId) {
        await updateCourse({ id: courseId, dto: courseData });
        setSavedCourseId(courseId);
        toast.success('Course details saved successfully!');
      } else {
        const newCourse = await createCourse(courseData);
        setSavedCourseId(newCourse.id);
        setShowSuccessModal(true);
      }
    } catch (e) {
      toast.error('Failed to save course');
    }
  };

  if (isLoading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  }

  const tabs = [
    { id: 'details', label: 'Course Details', icon: FileText },
    { id: 'pricing', label: 'Pricing & Plans', icon: BookOpen }, // Simplified icons for mock
    { id: 'landing', label: 'Landing Pages', icon: Globe },
    { id: 'advanced', label: 'Advanced Settings', icon: Settings },
    { id: 'access', label: 'Access Control', icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto flex gap-8">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <button
          onClick={() => navigate('/partner/courses')}
          className="flex items-center gap-2 text-slate-800 hover:text-slate-600 mb-6 font-semibold text-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          {courseId ? 'Edit Course' : 'Create Course'}
        </button>

        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}

          {/* Action button in sidebar to Course Builder */}
          {courseId && (
            <button
              onClick={() => navigate(`/partner/courses/${courseId}/structure`)}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
            >
              <Layout className="w-4 h-4 text-primary-600" />
              Course Builder
            </button>
          )}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'details' && <CourseDetailsTab courseData={courseData} onChange={handleFieldChange} onSave={handleSave} isSaving={isCreating || isUpdating} />}
        {activeTab === 'pricing' && <PricingPlansTab courseData={courseData} onChange={handleFieldChange} onSave={handleSave} isSaving={isCreating || isUpdating} />}
        {activeTab === 'landing' && <LandingPagesTab onSave={handleSave} isSaving={isCreating || isUpdating} />}
        {activeTab === 'advanced' && <AdvancedSettingsTab onSave={handleSave} isSaving={isCreating || isUpdating} />}
        {activeTab === 'access' && <AccessControlTab onSave={handleSave} isSaving={isCreating || isUpdating} />}

        {/* Sticky Footer */}

      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {courseId ? 'Changes Saved!' : 'Course Created!'}
            </h3>
            <p className="text-slate-500 mb-6">
              Your course details have been successfully saved.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={() => navigate(`/partner/courses/${savedCourseId}/structure`)}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Continue to Course Builder
              </button>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  if (!courseId && savedCourseId) {
                    navigate(`/partner/courses/${savedCourseId}/edit`, { replace: true });
                  }
                }}
                className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Keep Editing Here
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
