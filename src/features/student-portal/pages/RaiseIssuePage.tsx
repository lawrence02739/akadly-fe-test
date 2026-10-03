import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  FileText,
  Image,
  Truck,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMyOrder, useCreateIssue } from '../hooks/useStudentPortal';
import { studentPortalApi } from '../api/student-portal.api';
import axios from 'axios';

const CATEGORIES = [
  { value: 'ORDER_FULFILMENT', label: 'Order Fulfilment' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PRODUCT_QUALITY', label: 'Product Quality' },
  { value: 'PAYMENT_BILLING', label: 'Payment / Billing' },
  { value: 'OTHER', label: 'Other' },
];

const ISSUE_TYPES = [
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'WRONG_BOOK', label: 'Wrong Book' },
  { value: 'NOT_RECEIVED', label: 'Not Received' },
  { value: 'DEFECTIVE', label: 'Defective' },
  { value: 'INCORRECT_EDITION', label: 'Incorrect Edition' },
  { value: 'MISSING_PAGES', label: 'Missing Pages' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', desc: 'Response within 48 hours' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Response within 24 hours' },
  { value: 'HIGH', label: 'High', desc: 'Response within 4 hours' },
  { value: 'URGENT', label: 'Urgent', desc: 'Response within 1 hour' },
];

const RETURN_PREFS = [
  { value: 'REPLACE_ITEM', label: 'Replace Item', desc: 'Send me a replacement copy' },
  { value: 'REFUND', label: 'Refund', desc: 'Refund the amount to my account' },
  { value: 'NO_RETURN_YET', label: 'Undecided', desc: "I'll decide later" },
];

interface UploadedFile {
  file: File;
  fileKey?: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-700',
  URGENT: 'bg-red-100 text-red-700',
};

export default function RaiseIssuePage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading: orderLoading } = useMyOrder(orderId!);
  const createIssue = useCreateIssue();

  const [bookId, setBookId] = useState('');
  const [category, setCategory] = useState('');
  const [issueType, setIssueType] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [returnPref, setReturnPref] = useState('REPLACE_ITEM');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-select book if only one item
  useEffect(() => {
    if (order?.items?.length === 1 && !bookId) {
      setBookId(order.items[0].bookId);
    }
  }, [order, bookId]);

  const uploading = files.some((f) => f.status === 'uploading');
  const canSubmit =
    bookId &&
    category &&
    issueType &&
    priority &&
    title.length >= 8 &&
    description.length >= 20 &&
    !uploading &&
    !submitting;

  const handleFileDrop = async (picked: File[]) => {
    if (files.length + picked.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    const newFiles: UploadedFile[] = picked.map((f) => ({
      file: f,
      status: 'uploading',
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);

    for (const uf of newFiles) {
      try {
        const presign = await studentPortalApi.presignAttachment({
          fileName: uf.file.name,
          contentType: uf.file.type,
          sizeBytes: uf.file.size,
        });
        await axios.put(presign.uploadUrl, uf.file, {
          headers: { 'Content-Type': uf.file.type },
          onUploadProgress: (e) => {
            const pct = Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100);
            setFiles((prev) =>
              prev.map((f) => (f.file === uf.file ? { ...f, progress: pct } : f)),
            );
          },
        });
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uf.file
              ? { ...f, status: 'done', fileKey: presign.fileKey, progress: 100 }
              : f,
          ),
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.file === uf.file ? { ...f, status: 'error' } : f)),
        );
        toast.error(`Failed to upload ${uf.file.name}`);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !orderId) return;
    setSubmitting(true);
    try {
      const doneFiles = files
        .filter((f) => f.status === 'done' && f.fileKey)
        .map((f) => ({
          fileKey: f.fileKey!,
          fileName: f.file.name,
          mimeType: f.file.type,
          sizeBytes: f.file.size,
        }));

      const issue = await createIssue.mutateAsync({
        orderId,
        bookId,
        category,
        issueType,
        priority,
        title,
        description,
        returnPreference: returnPref,
        attachments: doneFiles,
      });

      toast.success(`Issue ${issue.ticketNumber} created!`);
      navigate(`/student/issues/${issue.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      if (e?.response?.status === 409) {
        toast.error(e.response!.data?.message ?? 'An active issue already exists for this item');
      } else {
        toast.error('Failed to create issue. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (orderLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0C5A69]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        Order not found.
      </div>
    );
  }

  const eligibleUntil = order.issueEligibility?.eligibleUntil;
  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const selectedBook = order.items.find((i) => i.bookId === bookId) ?? order.items[0];

  return (
    <div className="min-h-full bg-[#F5F7F8]">
      {/* ── Page Header ── */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <button
          onClick={() => navigate(`/student/orders/${orderId}`)}
          className="mb-3 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to order
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create an Issue</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Order <span className="font-mono font-semibold text-[#0C5A69]">{order.orderNumber}</span>
              {deliveredDate && <span className="ml-2 text-slate-400">· Delivered {deliveredDate}</span>}
            </p>
          </div>
          {eligibleUntil && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Eligible until {new Date(eligibleUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* LEFT: Form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Book selection */}
            {order.items.length > 1 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Select Item <span className="text-red-500">*</span>
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {order.items.map((item) => (
                    <label
                      key={item.bookId}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${bookId === item.bookId
                          ? 'border-[#0C5A69] bg-[#0C5A69]/5 ring-1 ring-[#0C5A69]/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="book"
                        value={item.bookId}
                        checked={bookId === item.bookId}
                        onChange={() => setBookId(item.bookId)}
                        className="accent-[#0C5A69]"
                      />
                      {item.coverImageUrl ? (
                        <img src={item.coverImageUrl} alt={item.title} className="h-10 w-8 rounded object-cover" />
                      ) : (
                        <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded bg-[#0C5A69]/10">
                          <BookOpen className="h-4 w-4 text-[#0C5A69]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.author} · Qty {item.qty}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">Issue Details</h2>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#0C5A69] focus:ring-2 focus:ring-[#0C5A69]/10"
                    >
                      <option value="">Select category…</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Issue Type */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-[#0C5A69] focus:ring-2 focus:ring-[#0C5A69]/10"
                    >
                      <option value="">Select issue type…</option>
                      {ISSUE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {PRIORITIES.map((p) => (
                      <label
                        key={p.value}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition-all ${priority === p.value
                            ? 'border-[#0C5A69] bg-[#0C5A69]/5 ring-1 ring-[#0C5A69]/20'
                            : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={p.value}
                          checked={priority === p.value}
                          onChange={() => setPriority(p.value)}
                          className="sr-only"
                        />
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[p.value]}`}>
                          {p.label}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">{p.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Title <span className="text-red-500">*</span></span>
                    <span className={`text-xs ${title.length < 8 ? 'text-slate-400' : 'text-emerald-600'}`}>
                      {title.length}/80
                    </span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                    placeholder="Brief description of the issue…"
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-[#0C5A69] focus:ring-2 focus:ring-[#0C5A69]/10"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Description <span className="text-red-500">*</span></span>
                    <span className={`text-xs ${description.length < 20 ? 'text-slate-400' : 'text-emerald-600'}`}>
                      {description.length}/2000
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                    rows={4}
                    placeholder="Describe the issue in detail — what happened, when, and any relevant details…"
                    className="w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-[#0C5A69] focus:ring-2 focus:ring-[#0C5A69]/10"
                  />
                </div>
              </div>
            </div>

            {/* Evidence Upload */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Evidence</h2>
                <span className="text-xs text-slate-400">Optional · JPG, PNG, PDF · Max 10MB</span>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  void handleFileDrop(Array.from(e.dataTransfer.files));
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-8 text-slate-400 transition-colors hover:border-[#0C5A69]/40 hover:bg-[#0C5A69]/5 focus:outline-none focus:ring-2 focus:ring-[#0C5A69]/20"
              >
                <div className="flex gap-3">
                  <Image className="h-6 w-6 opacity-40" />
                  <FileText className="h-6 w-6 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports images and PDF files (max 10 files)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/heic,image/heif,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) void handleFileDrop(Array.from(e.target.files));
                  }}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-2" aria-live="polite">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                      {f.status === 'uploading' ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#0C5A69]" />
                      ) : f.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-700">{f.file.name}</p>
                        {f.status === 'uploading' && (
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-1 rounded-full bg-[#0C5A69] transition-all"
                              style={{ width: `${f.progress}%` }}
                            />
                          </div>
                        )}
                        {f.status === 'done' && (
                          <p className="text-[10px] text-slate-400">{(f.file.size / 1024).toFixed(0)} KB</p>
                        )}
                      </div>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="rounded text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Return Preference */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">Return Preference</h2>
              <div className="grid gap-2 sm:grid-cols-3">
                {RETURN_PREFS.map((rp) => (
                  <label
                    key={rp.value}
                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition-all ${returnPref === rp.value
                        ? 'border-[#0C5A69] bg-[#0C5A69]/5 ring-1 ring-[#0C5A69]/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="returnPref"
                      value={rp.value}
                      checked={returnPref === rp.value}
                      onChange={() => setReturnPref(rp.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2">
                      <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${returnPref === rp.value ? 'border-[#0C5A69]' : 'border-slate-300'
                        }`}>
                        {returnPref === rp.value && <div className="h-1.5 w-1.5 rounded-full bg-[#0C5A69]" />}
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{rp.label}</p>
                    </div>
                    <p className="pl-5 text-xs text-slate-500">{rp.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit actions */}
            <div className="flex gap-3 pb-8">
              <button
                onClick={() => navigate(`/student/orders/${orderId}`)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 rounded-xl bg-[#0C5A69] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0a4e5c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating issue…
                  </span>
                ) : (
                  'Submit Issue'
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Summary Panel */}
          <div className="space-y-4">
            {/* Order summary card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Order Summary</h3>

              {/* Selected book */}
              {selectedBook && (
                <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#0C5A69]/5 border border-[#0C5A69]/10 p-3">
                  <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded bg-[#0C5A69]/15">
                    <BookOpen className="h-4 w-4 text-[#0C5A69]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{selectedBook.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedBook.author}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Qty: {selectedBook.qty}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Order</span>
                  <span className="font-mono text-xs font-semibold text-slate-700">{order.orderNumber}</span>
                </div>
                {order.courierPartnerName && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Truck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="text-xs">{order.courierPartnerName}</span>
                    {order.trackingNumber && (
                      <span className="ml-auto font-mono text-xs text-slate-400">{order.trackingNumber}</span>
                    )}
                  </div>
                )}
                {deliveredDate && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="text-xs">Delivered {deliveredDate}</span>
                  </div>
                )}
                {eligibleUntil && (
                  <div className="mt-1 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-700">
                    <CheckCircle2 className="mr-1.5 inline-block h-3.5 w-3.5" />
                    Eligible until {new Date(eligibleUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Checklist</h3>
              <div className="space-y-2.5">
                {[
                  { done: !!order, label: 'Order verified' },
                  { done: !!bookId, label: 'Book selected' },
                  { done: !!(category && issueType), label: 'Issue type selected' },
                  { done: title.length >= 8, label: 'Title filled (min 8 chars)' },
                  { done: description.length >= 20, label: 'Description filled (min 20 chars)' },
                  { done: files.some((f) => f.status === 'done'), label: 'Evidence attached (optional)' },
                ].map(({ done, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-100' : 'border-2 border-slate-200'}`}>
                      {done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <span className={`text-xs ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-slate-400">
                You'll receive an email with the issue number and next steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
