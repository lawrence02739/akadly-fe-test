import { useEffect, useState, useRef } from 'react';
import { qaApi } from '../../../api/qa';
import type { LessonQuestion, QuestionMessage } from '../../../types/qa';
import { Send, X, MessageCircle, ArrowLeft } from 'lucide-react';

export function LessonQaWidget({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isAskingNew, setIsAskingNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, courseId, lessonId]);

  useEffect(() => {
    if (selectedQuestion) {
      loadMessages(selectedQuestion);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadQuestions = async () => {
    try {
      // Just fetching top recent questions for student for this course/lesson ideally
      // But we just have a generic list API for now, would filter in real scenario
      const res = await qaApi.listStudentQuestions(1, 10);
      // Client side filter for this lesson for simplicity in scaffold
      setQuestions((res || []).filter((q: any) => q.courseId === courseId && q.lessonId === lessonId));
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (qId: string) => {
    try {
      const res = await qaApi.getStudentQuestionDetail(qId);
      setMessages(res.messages);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !selectedQuestion) return;
    try {
      await qaApi.studentReplyToQuestion(selectedQuestion, newMessage);
      setNewMessage('');
      loadMessages(selectedQuestion);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskNew = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    try {
      const res = await qaApi.askQuestion(courseId, lessonId, newTitle, newMessage);
      setNewTitle('');
      setNewMessage('');
      setIsAskingNew(false);
      setSelectedQuestion(res.id);
      loadQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-lg">
          {isAskingNew ? 'Ask a Question' : selectedQuestion ? 'Discussion' : 'Q&A'}
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {!isAskingNew && !selectedQuestion && (
          <div className="p-4 flex-1">
            <button 
              onClick={() => setIsAskingNew(true)}
              className="w-full bg-white border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-xl mb-4 transition-colors"
            >
              Ask a new question
            </button>
            <div className="space-y-3">
              {questions.map(q => (
                <div 
                  key={q.id} 
                  onClick={() => setSelectedQuestion(q.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-900 truncate pr-2">{q.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${q.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(q.lastActivityAt).toLocaleDateString()}</p>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No questions yet for this lesson.<br/>Be the first to ask!
                </div>
              )}
            </div>
          </div>
        )}

        {isAskingNew && (
          <div className="p-4 flex flex-col h-full bg-white">
            <input 
              type="text" 
              placeholder="Question Title (e.g. Need help with step 2)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="border border-gray-200 rounded-lg p-3 mb-4 w-full text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
            <textarea 
              placeholder="Describe your question in detail..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="border border-gray-200 rounded-lg p-3 w-full flex-1 resize-none text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
            <div className="flex gap-3 mt-4 shrink-0">
              <button 
                onClick={() => setIsAskingNew(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAskNew}
                disabled={!newTitle.trim() || !newMessage.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Question
              </button>
            </div>
          </div>
        )}

        {selectedQuestion && !isAskingNew && (
          <div className="flex flex-col h-full">
            <div className="p-3 bg-white border-b border-gray-100 flex items-center shrink-0">
              <button 
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-400 hover:text-gray-700 p-1 mr-2 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h4 className="font-medium text-sm text-gray-800 truncate flex-1">
                {questions.find(q => q.id === selectedQuestion)?.title}
              </h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col max-w-[85%] ${m.authorType === 'STUDENT' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm ${m.authorType === 'STUDENT' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    {m.body}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 p-1 pl-4 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                <input 
                  type="text" 
                  placeholder="Reply..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button 
                  onClick={handleSendReply}
                  disabled={!newMessage.trim()}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
                >
                  <Send size={14} className={newMessage.trim() ? "ml-0.5" : ""} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
