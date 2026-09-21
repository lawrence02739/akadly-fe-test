import { File, Video, Headphones, FileText, Link as LinkIcon, Download, HelpCircle, ClipboardList, ClipboardCheck, Radio, Code2, Calendar, Clock, ExternalLink, AlertCircle, Upload, Terminal } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  VIDEO: { icon: Video, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Video' },
  AUDIO: { icon: Headphones, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Audio' },
  PDF: { icon: FileText, color: 'text-red-600', bgColor: 'bg-red-50', label: 'PDF' },
  FILE: { icon: File, color: 'text-slate-600', bgColor: 'bg-slate-100', label: 'File' },
  MODULE: { icon: File, color: 'text-teal-600', bgColor: 'bg-teal-50', label: 'Module' },
  QUIZ: { icon: HelpCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Quiz' },
  TEST: { icon: ClipboardList, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Test' },
  ASSIGNMENT: { icon: ClipboardCheck, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Assignment' },
  LIVE_CLASS: { icon: Radio, color: 'text-rose-600', bgColor: 'bg-rose-50', label: 'Live Class' },
  CODING: { icon: Code2, color: 'text-indigo-600', bgColor: 'bg-indigo-50', label: 'Coding' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDatetime(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function InfoChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl min-w-[100px]">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-base font-bold text-slate-800">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NodeContentViewer({ item }: { item: any }) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg?.icon ?? File;
  const content = item.content || {};

  const renderContent = () => {
    switch (item.type) {
      case 'TEXT':
        return (
          <div
            className="prose prose-slate max-w-none text-slate-800 bg-white p-8 rounded-xl shadow-sm border border-slate-200"
            dangerouslySetInnerHTML={{ __html: content.text || '<p>No content provided yet.</p>' }}
          />
        );

      case 'VIDEO':
        return content.fileUrl ? (
          <div className="rounded-xl overflow-hidden shadow-lg bg-black aspect-video w-full">
            <video src={content.fileUrl} controls className="w-full h-full object-contain" />
          </div>
        ) : (
          <EmptyState icon={Video} message="No video uploaded yet" />
        );

      case 'AUDIO':
        return content.fileUrl ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
              <Headphones className="w-10 h-10" />
            </div>
            <audio src={content.fileUrl} controls className="w-full max-w-md" />
          </div>
        ) : (
          <EmptyState icon={Headphones} message="No audio uploaded yet" />
        );

      case 'PDF':
        return content.fileUrl ? (
          <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
            <iframe src={`${content.fileUrl}#toolbar=0`} className="w-full h-full border-0" title={item.title} />
          </div>
        ) : (
          <EmptyState icon={FileText} message="No PDF uploaded yet" />
        );

      case 'FILE':
        return content.fileUrl ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-6">
              <File className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-8 max-w-md">This file is available for download.</p>
            <a
              href={content.fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" /> Download File
            </a>
          </div>
        ) : (
          <EmptyState icon={File} message="No file uploaded yet" />
        );

      case 'HEADING': {
        const Tag = content.level?.toLowerCase() || 'h2';
        const text = content.heading || 'Empty Heading';
        return (
          <div className="py-6 px-8 bg-white rounded-xl shadow-sm border border-slate-200">
            {Tag === 'h1' && <h1 className="text-4xl font-extrabold text-slate-900">{text}</h1>}
            {Tag === 'h2' && <h2 className="text-3xl font-bold text-slate-800">{text}</h2>}
            {Tag === 'h3' && <h3 className="text-2xl font-bold text-slate-800">{text}</h3>}
            {Tag === 'h4' && <h4 className="text-xl font-semibold text-slate-700">{text}</h4>}
          </div>
        );
      }

      case 'LINK':
        return content.url ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
              <LinkIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{content.url}</p>
            <a
              href={content.url}
              target={content.newTab !== false ? '_blank' : '_self'}
              rel="noreferrer"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              {content.label || 'Open Link'}
            </a>
          </div>
        ) : (
          <EmptyState icon={LinkIcon} message="No link provided yet" />
        );

      case 'MODULE':
        return (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h3>
            <p className="text-slate-500">Select an item inside this module to view its content.</p>
          </div>
        );

      case 'QUIZ':
      case 'TEST': {
        const AssessmentIcon = item.type === 'QUIZ' ? HelpCircle : ClipboardList;
        return content.linkedQuiz ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className={`w-24 h-24 rounded-full ${item.type === 'QUIZ' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center mb-6 shadow-sm`}>
              <AssessmentIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">{content.linkedQuiz.title}</h3>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-8 bg-slate-50 px-6 py-3 rounded-lg border border-slate-200">
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-700">{content.linkedQuiz.questionCount || (content.linkedQuiz.questionIds ? content.linkedQuiz.questionIds.length : 0)}</span>
                <span className="text-xs uppercase tracking-wider">Questions</span>
              </div>
              <div className="w-px h-10 bg-slate-300" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-700">{content.timeLimitMinutes || content.linkedQuiz.timeLimitMinutes || '∞'}</span>
                <span className="text-xs uppercase tracking-wider">Minutes</span>
              </div>
              <div className="w-px h-10 bg-slate-300" />
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-slate-700">{content.passScore || 0}%</span>
                <span className="text-xs uppercase tracking-wider">To Pass</span>
              </div>
            </div>
            <button className="px-10 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-lg shadow-sm transition-all transform hover:scale-105 active:scale-95">
              Start {item.type === 'QUIZ' ? 'Quiz' : 'Test'}
            </button>
          </div>
        ) : (
          <EmptyState icon={AssessmentIcon} message={`No ${item.type.toLowerCase()} linked yet`} />
        );
      }

      // ─── ASSIGNMENT ────────────────────────────────────────────────────────
      case 'ASSIGNMENT':
        if (!content.instructions && !content.maxScore) {
          return <EmptyState icon={ClipboardCheck} message="Assignment content not configured yet" />;
        }
        return (
          <div className="space-y-5">
            {/* Instructions */}
            {content.instructions && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-slate-800">Instructions</h3>
                </div>
                <div
                  className="prose prose-slate max-w-none p-6 text-slate-700"
                  dangerouslySetInnerHTML={{ __html: content.instructions }}
                />
              </div>
            )}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-3">
              {content.maxScore > 0 && (
                <InfoChip icon={ClipboardCheck} label="Max Score" value={String(content.maxScore)} />
              )}
              {content.availability === 'SCHEDULED' && content.dueDate && (
                <InfoChip icon={Calendar} label="Due Date" value={formatDatetime(content.dueDate)} />
              )}
              {content.availability === 'SCHEDULED' && content.availableFrom && (
                <InfoChip icon={Clock} label="Opens" value={formatDatetime(content.availableFrom)} />
              )}
              {content.availability === 'ALWAYS' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700">
                  <Clock className="w-4 h-4" /> Always Available
                </div>
              )}
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-2">
              {content.allowLateSubmission && (
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                  Late Submission Allowed
                </span>
              )}
              {content.fileUploadRequired && (
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full">
                  File Upload Required
                </span>
              )}
            </div>

            {/* Template download */}
            {content.templateFile?.fileUrl && (
              <a
                href={content.templateFile.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Download Template</p>
                  <p className="text-xs text-slate-500">{content.templateFile.fileName}</p>
                </div>
              </a>
            )}

            {/* Submit area */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="font-semibold text-slate-800">Your Submission</h3>
              {content.fileUploadRequired ? (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Click to upload your file</span>
                  <span className="text-xs text-slate-400">Max 100 MB</span>
                </label>
              ) : (
                <textarea
                  rows={4}
                  disabled
                  placeholder="Write your answer here..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm resize-none"
                />
              )}
              <button className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-base shadow-sm transition-colors">
                Submit Assignment
              </button>
            </div>
          </div>
        );

      // ─── LIVE_CLASS ────────────────────────────────────────────────────────
      case 'LIVE_CLASS':
        if (!content.meetingUrl && !content.availableFrom) {
          return <EmptyState icon={Radio} message="Live class not scheduled yet" />;
        }
        return (
          <div className="space-y-5">
            {/* Thumbnail */}
            {content.thumbnail?.fileUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={content.thumbnail.fileUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Schedule card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-5 h-5 text-rose-600" />
                <h3 className="font-semibold text-slate-800">Session Details</h3>
              </div>
              <div className="flex flex-wrap gap-3 mb-5">
                {content.availableFrom && (
                  <InfoChip icon={Calendar} label="Scheduled" value={formatDatetime(content.availableFrom)} />
                )}
                {content.durationMinutes && (
                  <InfoChip icon={Clock} label="Duration" value={`${content.durationMinutes} min`} />
                )}
              </div>

              {/* Join link */}
              {(content.learnerJoinUrl || content.meetingUrl) && (
                <a
                  href={content.learnerJoinUrl || content.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-base shadow-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Live Class
                </a>
              )}
            </div>

            {/* Pre-class instructions */}
            {content.preClassInstructions?.enabled && content.preClassInstructions?.body && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-blue-50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-800 text-sm">Pre-Class Instructions</h3>
                </div>
                <div
                  className="prose prose-slate max-w-none p-6 text-slate-700 text-sm"
                  dangerouslySetInnerHTML={{ __html: content.preClassInstructions.body }}
                />
              </div>
            )}

            {/* Post-class instructions */}
            {content.postClassInstructions?.enabled && content.postClassInstructions?.body && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-green-50 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  <h3 className="font-semibold text-green-800 text-sm">Post-Class Instructions</h3>
                </div>
                <div
                  className="prose prose-slate max-w-none p-6 text-slate-700 text-sm"
                  dangerouslySetInnerHTML={{ __html: content.postClassInstructions.body }}
                />
              </div>
            )}
          </div>
        );

      // ─── CODING ────────────────────────────────────────────────────────────
      case 'CODING':
        if (!content.problemStatement) {
          return <EmptyState icon={Code2} message="Problem statement not set yet" />;
        }
        return (
          <div className="space-y-5">
            {/* Problem statement */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">Problem</h3>
              </div>
              <div
                className="prose prose-slate max-w-none p-6 text-slate-700"
                dangerouslySetInnerHTML={{ __html: content.problemStatement }}
              />
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-3">
              {content.maxScore > 0 && (
                <InfoChip icon={ClipboardCheck} label="Max Score" value={String(content.maxScore)} />
              )}
              {content.testCasesEnabled && Array.isArray(content.testCases) && (
                <InfoChip icon={Terminal} label="Test Cases" value={String(content.testCases.length)} />
              )}
              {content.testCasesEnabled && content.minTestCasesToPass > 0 && (
                <InfoChip
                  icon={AlertCircle}
                  label="Need to Pass"
                  value={`${content.minTestCasesToPass} / ${content.testCases?.length ?? 0}`}
                />
              )}
              {content.availability === 'ALWAYS' && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-700">
                  <Clock className="w-4 h-4" /> Always Available
                </div>
              )}
              {content.availability === 'SCHEDULED' && content.availableFrom && (
                <InfoChip icon={Calendar} label="Opens" value={formatDatetime(content.availableFrom)} />
              )}
              {content.availability === 'SCHEDULED' && content.availableTill && (
                <InfoChip icon={Calendar} label="Closes" value={formatDatetime(content.availableTill)} />
              )}
            </div>

            {/* Code editor placeholder */}
            <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-slate-700 shadow-lg">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/60 bg-[#181825]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs font-mono text-slate-400">solution.py</span>
                <button className="text-xs font-semibold text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                  Run (F9)
                </button>
              </div>
              {/* Code area placeholder */}
              <div className="p-5 min-h-[200px] font-mono text-sm">
                <p className="text-slate-500 select-none italic">{'# Write your solution here...'}</p>
                <p className="text-slate-600 select-none mt-2">{'def solution():'}</p>
                <p className="text-slate-600 select-none ml-6">{'pass'}</p>
              </div>
              {/* I/O tabs */}
              <div className="border-t border-slate-700/60 bg-[#181825]">
                <div className="flex">
                  <button className="px-4 py-2 text-xs font-semibold text-indigo-400 border-b-2 border-indigo-500">Input</button>
                  <button className="px-4 py-2 text-xs font-semibold text-slate-500 border-b-2 border-transparent">Output</button>
                </div>
                <div className="p-3 min-h-[48px] font-mono text-xs text-slate-500 italic">
                  {content.testCases?.[0]?.input
                    ? content.testCases[0].input
                    : 'No input provided'}
                </div>
              </div>
            </div>

            {/* Submit */}
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base shadow-sm transition-colors">
              Submit Solution
            </button>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="text-5xl mb-4">🚧</div>
            <p className="text-slate-600 font-semibold text-lg">Coming Soon</p>
            <p className="text-sm text-slate-400 mt-2">
              Preview for <span className="font-bold">{item.type}</span> is not available yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-6 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4">
        {cfg ? (
          <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} ${cfg.color} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <File className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-800">{item.title}</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{cfg?.label ?? item.type}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
}


