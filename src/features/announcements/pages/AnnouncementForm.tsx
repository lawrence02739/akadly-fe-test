import React, { useState, useEffect } from 'react';
import { listCourses } from '../../courses/api/courses.api';
import { listBatches } from '../../batches/api/batches.api';
import { getPresignedUploadUrl, uploadToS3 } from '../../courses/api/uploads.api';
import toast from 'react-hot-toast';
import { announcementsApi } from '../../../api/announcements';
import { AnnouncementAudience, AnnouncementPriority } from '../../../types/announcements';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Paperclip, FileText, X } from 'lucide-react';

export function AnnouncementForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>(AnnouncementAudience.ENROLLED_LEARNERS_AND_INSTRUCTORS);
  const [priority, setPriority] = useState<AnnouncementPriority>(AnnouncementPriority.NORMAL);
  const [emailDeliveryEnabled, setEmailDeliveryEnabled] = useState(false);
  const [pushDeliveryEnabled, setPushDeliveryEnabled] = useState(false);
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [pinned, setPinned] = useState(false);
  const [previewTab, setPreviewTab] = useState<'WEB' | 'EMAIL' | 'PUSH'>('WEB');
  
  
  const [courses, setCourses] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [expiresDate, setExpiresDate] = useState('');
  
  useEffect(() => {
    Promise.all([
      listCourses().then(res => setCourses(res)),
      listBatches({ pageSize: 100 }).then(res => setBatches(res?.items || []))
    ]).catch(err => console.error('Failed to load courses/batches', err));

    const loadData = async () => {
      const cloneData = location.state?.clone;
      if (cloneData) {
        populateForm(cloneData);
      } else if (id) {
        try {
          const res = await announcementsApi.getTenantAnnouncement(id);
          populateForm(res);
        } catch (e) {
          toast.error('Failed to load announcement');
        }
      }
    };
    loadData();
  }, [id, location.state]);

  const populateForm = (data: any) => {
    setTitle(data.title || '');
    setBody(data.bodyHtml || '');
    setAudience(data.audience || AnnouncementAudience.ENROLLED_LEARNERS_AND_INSTRUCTORS);
    setPriority(data.priority || AnnouncementPriority.NORMAL);
    setCourseId(data.courseId || '');
    setBatchId(data.batchId || '');
    setPinned(data.pinned || false);
    setEmailDeliveryEnabled(data.channels?.email || false);
    setPushDeliveryEnabled(data.channels?.push || false);
    setAttachments(data.attachments || []);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { uploadUrl, fileKey } = await getPresignedUploadUrl(file.name, file.type);
      await uploadToS3(uploadUrl, file);
      
      setAttachments(prev => [...prev, {
        fileKey: fileKey,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        url: uploadUrl.split('?')[0]
      }]);
      toast.success('File attached');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const [saving, setSaving] = useState(false);


  const handleSubmit = async (e: React.FormEvent, action: 'DRAFT' | 'PUBLISH' | 'SCHEDULE') => {
    e.preventDefault();
    try {
      setSaving(true);
      const selectedCourse = courses.find((c: any) => c.id === courseId);
      const courseTitle = selectedCourse ? selectedCourse.title : '';
      const selectedBatch = batches.find((b: any) => b.id === batchId);
      const batchName = selectedBatch ? selectedBatch.name : '';

      const payload = { 
        title, 
        bodyHtml: body, 
        priority, 
        audience, 
        courseId, 
        courseTitle,
        batchId, 
        batchName,
        pinned,
        channels: { email: emailDeliveryEnabled, push: pushDeliveryEnabled },
        attachments: attachments.map(({ _id, ...a }: any) => a)
      };

      let draftId = id;
      if (!draftId || location.state?.clone) {
        const draft = await announcementsApi.createDraft(payload);
        draftId = draft.id;
      } else {
        await announcementsApi.updateDraft(draftId, payload);
      }

      if (!draftId) {
        toast.error('Failed to create or update draft');
        setSaving(false);
        return;
      }

      if (action === 'PUBLISH') {
        await announcementsApi.publish(draftId, { audience, emailDeliveryEnabled, courseId });
      } else if (action === 'SCHEDULE') {
        if (!publishDate) {
          toast.error('Please select a publish date to schedule');
          setSaving(false);
          return;
        }
        await announcementsApi.schedule(draftId, { 
          scheduledFor: new Date(publishDate).toISOString(),
          audience, 
          emailDeliveryEnabled, 
          courseId 
        });
      }
      navigate('/partner/announcements');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] -m-6 p-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 tracking-tight mb-1">{id && !location.state?.clone ? 'Edit Announcement' : 'Create Announcement'}</h1>
            <p className="text-gray-500 text-[15px]">{id && !location.state?.clone ? 'Edit your announcement and change targeting details.' : 'Build a new announcement from scratch and preview how it will appear to learners.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/partner/announcements')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Discard
            </button>
            <button 
              onClick={e => handleSubmit(e, 'DRAFT')}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Save draft
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Form Area (Left Column) */}
          <div className="flex-1 space-y-6">
            
            {/* Audience & targeting */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Audience & targeting</h2>
              <p className="text-sm text-gray-500 mb-6">428 learners match this announcement</p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Course</label>
                  <select 
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Batch</label>
                  <select 
                    value={batchId}
                    onChange={e => setBatchId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none"
                  >
                    <option value="">Select Batch</option>
                    {batches.filter((b: any) => !courseId || b.courseId === courseId).map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Audience</label>
                  <select 
                    value={audience}
                    onChange={e => setAudience(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none"
                  >
                    <option value={AnnouncementAudience.ENROLLED_LEARNERS_AND_INSTRUCTORS}>Enrolled learners + instructors</option>
                    <option value={AnnouncementAudience.ENROLLED_LEARNERS}>Enrolled Learners Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Learner status</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none">
                    <option>Active</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Dynamically calculate counts or remove entirely since we don't have APIs for this yet */}
              </div>
            </div>

            {/* Message content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Message content</h2>
              <p className="text-sm text-gray-500 mb-6">Rich content is mirrored to enabled channels</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">Announcement title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none"
                  placeholder="Live SQL clinic moved to Thursday"
                />
              </div>

              <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
                <div className="flex items-center gap-1 border-b border-gray-200 p-2 bg-gray-50">
                  <button className="p-1.5 hover:bg-gray-200 rounded"><Bold size={16} /></button>
                  <button className="p-1.5 hover:bg-gray-200 rounded"><Italic size={16} /></button>
                  <button className="p-1.5 hover:bg-gray-200 rounded"><Underline size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-gray-200 rounded"><List size={16} /></button>
                  <button className="p-1.5 hover:bg-gray-200 rounded"><ListOrdered size={16} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button className="p-1.5 hover:bg-gray-200 rounded"><LinkIcon size={16} /></button>
                  <button className="p-1.5 hover:bg-gray-200 rounded"><Paperclip size={16} /></button>
                </div>
                <textarea 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full p-4 h-48 outline-none text-sm resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              
              {/* Attachments */}
              <div className="flex flex-col gap-3">
                {attachments.map((att, index) => (
                  <div key={index} className="flex-1 border border-gray-200 bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="text-red-500" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{att.fileName}</p>
                        <p className="text-xs text-gray-500">{(att.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAttachment(index)} className="text-gray-400 hover:text-gray-700">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-4 mt-2">
                  <label className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
                    <Paperclip size={16} /> {uploading ? 'Uploading...' : 'Add attachment'}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>

            {/* Publishing & controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Publishing & controls</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Publish</label>
                  <input 
                    type="datetime-local" 
                    value={publishDate} 
                    onChange={e => setPublishDate(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Expires</label>
                  <input 
                    type="datetime-local" 
                    value={expiresDate} 
                    onChange={e => setExpiresDate(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#135f69] outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pinned ? 'bg-[#135f69]' : 'bg-gray-200'}`} onClick={() => setPinned(!pinned)}>
                    <span className={`${pinned ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pin to learner dashboard</p>
                    <p className="text-xs text-gray-500">Shown above regular course updates</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailDeliveryEnabled ? 'bg-[#135f69]' : 'bg-gray-200'}`} onClick={() => setEmailDeliveryEnabled(!emailDeliveryEnabled)}>
                    <span className={`${emailDeliveryEnabled ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mirror by email</p>
                    <p className="text-xs text-gray-500">412 eligible recipients</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${priority === AnnouncementPriority.HIGH ? 'bg-[#135f69]' : 'bg-gray-200'}`} onClick={() => setPriority(priority === AnnouncementPriority.HIGH ? AnnouncementPriority.NORMAL : AnnouncementPriority.HIGH)}>
                    <span className={`${priority === AnnouncementPriority.HIGH ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">High priority</p>
                    <p className="text-xs text-gray-500">Adds priority label and push alert</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <div className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pushDeliveryEnabled ? 'bg-[#135f69]' : 'bg-gray-200'}`} onClick={() => setPushDeliveryEnabled(!pushDeliveryEnabled)}>
                    <span className={`${pushDeliveryEnabled ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mirror by push</p>
                    <p className="text-xs text-gray-500">388 devices reachable</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar / Preview (Right Column) */}
          <div className="w-[380px] space-y-6">
            
            {/* Learner preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-gray-900">Learner preview</h2>
                <span className="bg-[#135f69] text-white text-[10px] font-bold px-2 py-1 rounded">WEB</span>
              </div>
              
              <div className="p-4 bg-white">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="mb-2">
                    <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">DRAFT</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title || 'Live SQL clinic moved to Thursday'}</h3>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {body || "Hi Aisha, this week's live SQL clinic has moved to Thursday, 3 October at 16:00 IST..."}
                  </p>
                  <div className="bg-white border border-gray-200 rounded p-2 flex items-center gap-2">
                    <FileText className="text-red-500" size={16} />
                    <span className="text-xs font-medium text-gray-900">SQL_clinic_agenda.pdf</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 pl-1">Draft · Not yet published</p>
              </div>

              <div className="p-4 pt-0">
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button 
                    onClick={() => setPreviewTab('WEB')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md ${previewTab === 'WEB' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Web
                  </button>
                  <button 
                    onClick={() => setPreviewTab('EMAIL')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md ${previewTab === 'EMAIL' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Email
                  </button>
                  <button 
                    onClick={() => setPreviewTab('PUSH')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md ${previewTab === 'PUSH' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Push
                  </button>
                </div>
              </div>
            </div>

            {/* Ready to send */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to send?</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Review your announcement before publishing.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Audience selected
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Message content added
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Publish timing set
                </div>
              </div>

              <button 
                onClick={e => handleSubmit(e, 'PUBLISH')}
                disabled={saving}
                className="w-full py-2.5 bg-[#135f69] hover:bg-[#0f4b53] text-white rounded-lg text-sm font-medium mb-3 transition-colors disabled:opacity-50"
              >
                Publish now
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
