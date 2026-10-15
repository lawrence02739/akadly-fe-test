import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  BookOpen,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  useDeleteMediaAsset,
  useDownloadMediaUrl,
  useMediaAsset,
} from '../hooks/useMediaLibrary';
import { MediaTypeBadge } from '../components/MediaTypeBadge';
import { MediaStatusBadge } from '../components/MediaStatusBadge';
import { MediaPreview } from '../components/MediaPreview';
import { TechnicalSpecsCard } from '../components/TechnicalSpecsCard';
import { GeneralInfoForm } from '../components/GeneralInfoForm';
import { LinkedCoursesCard } from '../components/LinkedCoursesCard';
import { ExtractTextCard } from '../components/ExtractTextCard';
import { TranscriptCard } from '../components/TranscriptCard';
import { LinkToCourseModal } from '../components/LinkToCourseModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getApiErrorMessage } from '../utils/apiError';

export default function MediaAssetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  const { data, isLoading, error } = useMediaAsset(id);
  const { mutate: downloadMedia, isPending: isDownloading } =
    useDownloadMediaUrl();
  const { mutateAsync: deleteAsset, isPending: isDeleting } =
    useDeleteMediaAsset();

  const handleSeek = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = seconds;
      mediaRef.current.play().catch(() => {});
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    try {
      setDeleteErrorMessage(null);
      await deleteAsset(id);
      navigate('/partner/media-library');
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        'Cannot delete media asset while it is linked to courses or course nodes.',
      );
      setDeleteErrorMessage(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
          Loading media details...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-semibold text-slate-800">
            Media Asset Not Found
          </h2>
          <p className="text-xs text-slate-500">
            The media asset you requested does not exist or may have been deleted.
          </p>
          <button
            type="button"
            onClick={() => navigate('/partner/media-library')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Media Library
          </button>
        </div>
      </div>
    );
  }

  const { asset, linkedCourses, usageCount } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/partner/media-library')}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Back to Media Library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-lg">
                  {asset.title}
                </h1>
                <MediaTypeBadge type={asset.type} />
                <MediaStatusBadge status={asset.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                {asset.fileName}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary-600" />
              Link to Course
            </button>

            <button
              type="button"
              onClick={() => downloadMedia(asset.id)}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player / Preview */}
            <MediaPreview
              asset={asset}
              mediaRef={mediaRef}
              onTimeSeek={handleSeek}
            />

            {/* General Info Edit Form */}
            <GeneralInfoForm asset={asset} linkedCourses={linkedCourses} />

            {/* AI / Processing Cards */}
            {asset.type === 'VIDEO' || asset.type === 'AUDIO' ? (
              <TranscriptCard asset={asset} onSeek={handleSeek} />
            ) : null}

            {asset.type === 'DOCUMENT' || asset.type === 'IMAGE' ? (
              <ExtractTextCard asset={asset} />
            ) : null}
          </div>

          {/* Sidebar Column (1 col) */}
          <div className="space-y-6">
            <TechnicalSpecsCard asset={asset} />
            <LinkedCoursesCard
              assetId={asset.id}
              linkedCourses={linkedCourses}
              onOpenLinkModal={() => setIsLinkModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Link to Course Modal */}
      <LinkToCourseModal
        isOpen={isLinkModalOpen}
        assetIds={[asset.id]}
        initialCourseId={linkedCourses?.[0]?.courseId}
        initialNodeId={linkedCourses?.[0]?.nodes?.[0]?.nodeId}
        initialCourseTitle={linkedCourses?.[0]?.courseTitle}
        initialNodeTitle={linkedCourses?.[0]?.nodes?.[0]?.nodeTitle}
        onClose={() => setIsLinkModalOpen(false)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Media Asset"
        message={
          deleteErrorMessage ||
          (usageCount > 0
            ? `This media asset is currently linked to ${usageCount} course/node usage(s). You must unlink or replace it before deleting.`
            : `Are you sure you want to permanently delete "${asset.title}"? This action cannot be undone.`)
        }
        confirmLabel="Delete Asset"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteErrorMessage(null);
        }}
      />
    </div>
  );
}
