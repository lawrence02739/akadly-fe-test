import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, PlusCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const STUDENT_API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:3000/api";
const studentApi = axios.create({
  baseURL: STUDENT_API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function StudentQAPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQ, setNewQ] = useState({ courseId: '', lessonId: '', title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [lessons, setLessons] = useState<{id: string, title: string, type: string, indent: number}[]>([]);

  useEffect(() => {
    fetchQuestions();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await studentApi.get('/student/courses');
      let list = res.data?.data || [];
      if (!Array.isArray(list) && Array.isArray(list.data)) list = list.data;
      if (!Array.isArray(list)) list = [];
      
      setCourses(list);
      
      const student = JSON.parse(localStorage.getItem('student_user') || '{}');
      if (student.courseId && list.some((c: any) => c.courseId === student.courseId)) {
        setNewQ(prev => ({ ...prev, courseId: student.courseId }));
      } else if (list.length > 0) {
        setNewQ(prev => ({ ...prev, courseId: list[0].courseId }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (newQ.courseId) {
      fetchStructure(newQ.courseId);
    } else {
      setLessons([]);
    }
  }, [newQ.courseId]);

  const fetchStructure = async (courseId: string) => {
    try {
      const res = await studentApi.get(`/student/courses/${courseId}/structure`);
      let tree = res.data?.data || [];
      if (!Array.isArray(tree) && Array.isArray(tree.data)) tree = tree.data;
      if (!Array.isArray(tree)) tree = [];
      
      const flat: any[] = [];
      const flatten = (nodes: any[], depth: number = 0) => {
        nodes.forEach(n => {
          flat.push({ id: n.id, title: n.title, type: n.type, indent: depth });
          if (n.children) flatten(n.children, depth + 1);
        });
      };
      flatten(tree);
      setLessons(flat);
      if (flat.length > 0 && !flat.some(l => l.id === newQ.lessonId)) {
        const firstLesson = flat.find(l => l.type === 'LESSON') || flat[0];
        setNewQ(prev => ({ ...prev, lessonId: firstLesson.id }));
      }
    } catch (e) {
      setLessons([]);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await studentApi.get('/student/questions', { params: { page: 1, limit: 50 } });
      setQuestions(res.data?.data?.items || res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await studentApi.post('/student/questions', {
        courseId: newQ.courseId,
        lessonId: newQ.lessonId,
        title: newQ.title,
        body: newQ.body,
        attachments: []
      });
      setIsModalOpen(false);
      setNewQ({ courseId: newQ.courseId, lessonId: '', title: '', body: '' });
      fetchQuestions();
      toast.success('Question submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to ask question');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-8 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-[#0C5A69]" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Q&A</h1>
          <p className="text-sm text-gray-500 mt-1">View your questions and discussions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0C5A69] text-white px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium hover:bg-[#084855] transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Ask Question
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4">Ask a Question</h2>
            <form onSubmit={handleAsk} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select 
                  required 
                  value={newQ.courseId} 
                  onChange={e => setNewQ({ ...newQ, courseId: e.target.value })} 
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(c => (
                    <option key={c.courseId} value={c.courseId}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson</label>
                <select 
                  required 
                  value={newQ.lessonId} 
                  onChange={e => setNewQ({ ...newQ, lessonId: e.target.value })} 
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="" disabled>Select a lesson node</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>
                      {'\u00A0'.repeat(l.indent * 4)}{l.type === 'LESSON' || l.type === 'TEXT' || l.type === 'VIDEO' ? '📄 ' : '📁 '}{l.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the specific lesson or module this question is about.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={newQ.title} onChange={e => setNewQ({ ...newQ, title: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="What do you need help with?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea required value={newQ.body} onChange={e => setNewQ({ ...newQ, body: e.target.value })} className="w-full border rounded-lg p-2 text-sm min-h-[100px]" placeholder="Provide more details..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-[#0C5A69] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Questions Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            You haven't asked any questions. Click Ask Question to submit one manually!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {questions.map((q: any) => (
            <div key={q.id} className={`p-6 hover:bg-slate-50 transition-colors flex items-start gap-4 ${q.status === 'RESOLVED' ? 'opacity-70' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${q.status === 'RESOLVED' ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <MessageSquare className={`w-5 h-5 ${q.status === 'RESOLVED' ? 'text-gray-400' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-base font-semibold text-gray-900 truncate pr-4">{q.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {q.status === 'ANSWERED' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#0C5A69]/10 text-[#0C5A69]">
                        Instructor Replied
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${q.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {q.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 truncate mb-2">
                  Lesson: {q.lessonTitle || 'General'}
                </p>
                <p className="text-sm text-gray-700 mb-3">{q.body}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span>{new Date(q.lastActivityAt || q.createdAt).toLocaleDateString()}</span>
                  <span>ID: {q.code}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
