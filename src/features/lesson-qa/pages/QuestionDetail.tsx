import { useEffect, useState } from 'react';
import { qaApi } from '../../../api/qa';
import type { LessonQuestion, QuestionMessage } from '../../../types/qa';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink, ChevronRight, Paperclip, Clock, ShieldAlert } from 'lucide-react';
import { type Descendant, RichTextEditor } from '@myexamly/word-editor';
import { slateToHTML } from '../../../utils/editorUtils';
import toast from 'react-hot-toast';

function timeAgo(dateInput: Date | string | undefined): string {
  if (!dateInput) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(dateInput).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
}

function formatTime(dateInput: Date | string | undefined): string {
  if (!dateInput) return '';
  return new Date(dateInput).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState<LessonQuestion & { lessonPath?: any[] } | null>(null);
  const [messages, setMessages] = useState<QuestionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState<Descendant[]>([{ type: 'paragraph', children: [{ text: '' }] } as any]);
  
  useEffect(() => {
    if (id) fetchDetail(id);
  }, [id]);

  const fetchDetail = async (qId: string) => {
    try {
      setLoading(true);
      const res = await qaApi.getTenantQuestionDetail(qId);
      setQuestion(res.question);
      setMessages(res.messages);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (isInternal: boolean = false) => {
    const html = slateToHTML(replyContent);
    if (!html.trim() || html === '<p></p>' || !id) return;
    try {
      if (isInternal) {
        await qaApi.addInternalNote(id, html);
        toast.success('Internal note added');
      } else {
        await qaApi.replyToQuestion(id, html);
        toast.success('Reply sent successfully');
      }
      setReplyContent([{ type: 'paragraph', children: [{ text: '' }] } as any]);
      fetchDetail(id);
    } catch (e) {
      toast.error(isInternal ? 'Failed to add internal note' : 'Failed to reply');
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    try {
      await qaApi.resolveQuestion(id);
      toast.success('Question resolved');
      fetchDetail(id);
    } catch (e) {
      toast.error('Failed to resolve');
    }
  };

  const handleChangePriority = async (newPriority: 'LOW'|'MEDIUM'|'HIGH') => {
    if (!id) return;
    try {
      await qaApi.changePriority(id, newPriority);
      toast.success('Priority updated');
      fetchDetail(id);
    } catch (e) {
      toast.error('Failed to update priority');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!question) return <div className="p-8 text-center text-red-500 font-bold">Question not found</div>;

  const isResolved = question.status === 'RESOLVED';
  
  // Use messages directly as the thread, since the backend likely stores the initial question as the first message
  const thread = messages;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <Link to="/partner/qa" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Inbox
      </Link>

      <div className="flex gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-bold rounded ${isResolved ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
                {question.status}
              </span>
              <span className={`text-xs font-bold ${question.priority === 'HIGH' ? 'text-red-500' : 'text-gray-500'}`}>
                {question.priority} PRIORITY
              </span>
              <span className="text-xs text-gray-400">{question.code}</span>
            </div>
            <div className="flex gap-3">
              {!isResolved && (
                <button className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2">
                  <ExternalLink size={16} /> Escalate
                </button>
              )}
              {!isResolved && (
                <button onClick={handleResolve} className="bg-[#0C5A69] text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#084855]">
                  <CheckCircle size={16} /> Mark as answered
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">{question.title}</h1>

          {/* Breadcrumb Context */}
          <div className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
              <span className="text-gray-800 font-medium truncate">{question.courseTitle}</span>
              <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{question.lessonTitle}</span>
            </div>
            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1 flex-shrink-0">
              <ExternalLink size={14} /> Open lesson
            </button>
          </div>

          {/* Thread */}
          <div className="space-y-8 mb-8">
            {thread.map((msg) => {
              const isStaff = msg.authorType === 'STAFF';
              const isNote = (msg as any).kind === 'INTERNAL_NOTE';
              
              return (
                <div key={msg.id} className={`flex gap-4 ${isNote ? 'bg-yellow-50 p-4 rounded-xl border border-yellow-100' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 flex-shrink-0">
                    {msg.authorName?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{msg.authorName}</span>
                      {isStaff && <span className="text-[10px] font-bold bg-[#0C5A69]/10 text-[#0C5A69] px-2 py-0.5 rounded-full">INSTRUCTOR</span>}
                      {isNote && <span className="text-[10px] font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1"><ShieldAlert size={10} /> STAFF ONLY</span>}
                      <span className="text-xs text-gray-500 ml-auto">{timeAgo(msg.createdAt)}</span>
                    </div>
                    
                    <div className={`prose prose-sm max-w-none text-gray-800 ${isNote ? 'text-yellow-900' : ''}`} dangerouslySetInnerHTML={{ __html: msg.body || '' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply Box */}
          {!isResolved ? (
            <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-[#0C5A69]">
              <RichTextEditor
                initialValue={replyContent}
                className="min-h-[120px] max-h-[300px] overflow-y-auto text-sm p-4"
                placeholder={`Reply to ${question.studentName}... Use @ to mention an instructor`}
                onChange={(val: Descendant[]) => setReplyContent(val)}
              />
              <div className="bg-gray-50 border-t p-3 flex justify-between items-center">
                <div className="flex gap-2 text-gray-400">
                  <button className="p-1 hover:text-gray-600"><Paperclip size={18} /></button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleReply(true)} className="text-gray-600 font-medium text-sm flex items-center gap-2 hover:text-gray-900 px-4 py-2 border rounded-md bg-white">
                    <ShieldAlert size={16} /> Add internal note
                  </button>
                  <button onClick={() => handleReply(false)} className="bg-[#0C5A69] text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-[#084855]">
                    Send reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border rounded-xl p-6 text-center">
              <CheckCircle size={32} className="mx-auto text-gray-400 mb-3" />
              <h3 className="text-gray-900 font-bold mb-1">Question Resolved</h3>
              <p className="text-gray-500 text-sm">This question has been marked as answered. Reopen the case to continue the conversation.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 border">
            <h3 className="font-bold text-gray-900 mb-4">Resolution</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Assigned instructor</label>
                <select className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-[#0C5A69]">
                  <option>{question.assigneeName || 'Unassigned'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Priority</label>
                <select 
                  value={question.priority}
                  onChange={e => handleChangePriority(e.target.value as any)}
                  className="w-full border rounded-lg p-2 text-sm bg-white outline-none focus:border-[#0C5A69]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              {!isResolved && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-orange-800 tracking-wider">FIRST RESPONSE SLA</span>
                    <Clock size={14} className="text-orange-500" />
                  </div>
                  <div className="text-xl font-black text-orange-500 mb-1">
                    {/* Simplified SLA calculation for UI purposes */}
                    {Math.max(0, Math.floor((new Date((question as any).slaDueAt || Date.now()).getTime() - Date.now()) / 60000))}m left
                  </div>
                  <p className="text-[10px] text-orange-700/70 leading-tight">60-minute academic support policy</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Resolution history</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-2 h-2 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-1rem)] md:w-[calc(50%-1.5rem)] pl-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">Question created</span>
                    <span className="text-[10px] text-gray-500">{question.studentName} • {formatTime(question.createdAt)}</span>
                  </div>
                </div>
              </div>
              {/* Simulated history items based on messages */}
              {messages.map(m => (
                <div key={m.id + '-hist'} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-2 h-2 rounded-full border-2 border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-1rem)] md:w-[calc(50%-1.5rem)] pl-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        {m.authorType === 'STAFF' ? ((m as any).kind === 'INTERNAL_NOTE' ? 'Internal note added' : 'Instructor replied') : 'Student replied'}
                      </span>
                      <span className="text-[10px] text-gray-500">{m.authorName} • {formatTime((m as any).createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {isResolved ? (
              <button onClick={() => qaApi.changePriority(id!, 'MEDIUM')} className="w-full bg-white border shadow-sm text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Reopen case
              </button>
            ) : (
              <button onClick={handleResolve} className="w-full bg-[#0C5A69] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#084855] flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Mark as answered
              </button>
            )}
            {!isResolved && (
              <button className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2">
                <ExternalLink size={16} /> Escalate to lead...
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-400 text-center">Status changes notify the learner and are written to the audit log.</p>
        </div>
      </div>
    </div>
  );
}
