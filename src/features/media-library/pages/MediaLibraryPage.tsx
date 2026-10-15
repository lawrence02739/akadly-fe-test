import { useState } from 'react';
import {
  Upload,
  Search,
  BookOpen,
  X,
  Loader2,
  Film,
} from 'lucide-react';
import type { MediaAsset, MediaStatus, MediaType } from '../types';
import {
  useDeleteMediaAsset,
  useDownloadMediaUrl,
  useMediaAssets,
} from '../hooks/useMediaLibrary';
import { useTags } from '../../courses/hooks/useMasterData';
import type { MasterData } from '../../courses/api/master-data.api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { MediaTypeTabs } from '../components/MediaTypeTabs';
import { ViewToggle } from '../components/ViewToggle';
import { MediaGrid } from '../components/MediaGrid';
import { MediaTable } from '../components/MediaTable';
import { Pagination } from '../components/Pagination';
import { UploadMediaModal } from '../components/UploadMediaModal';
import { LinkToCourseModal } from '../components/LinkToCourseModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MediaCategorySelect } from '../components/MediaCategorySelect';
import { PAGE_SIZE } from '../constants';
import { getApiErrorMessage } from '../utils/apiError';

export default function MediaLibraryPage() {
  const [selectedTab, setSelectedTab] = useState<MediaType | 'ALL'>('ALL');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState<MediaStatus | ''>('ACTIVE');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );

  const { data: rawTags = [] } = useTags();
  const tags = ((rawTags as MasterData[]) || []).map((t) => t.name);
  const { data, isLoading } = useMediaAssets({
    page,
    limit: PAGE_SIZE,
    type: selectedTab === 'ALL' ? undefined : selectedTab,
    status: (status as MediaStatus) || undefined,
    categoryId: categoryId || undefined,
    tag: tag || undefined,
    search: debouncedSearch || undefined,
  });

  const { mutateAsync: deleteAsset, isPending: isDeleting } =
    useDeleteMediaAsset();
  const { mutate: downloadMedia } = useDownloadMediaUrl();

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(
      items
        .map((i) => (i && 'asset' in i && i.asset ? i.asset.id : (i as any)?.id))
        .filter(Boolean),
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    try {
      setDeleteErrorMessage(null);
      await deleteAsset(assetToDelete.id);
      setAssetToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== assetToDelete.id));
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        'Cannot delete media asset while it is linked to courses or course nodes.',
      );
      setDeleteErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Film className="w-5 h-5 text-primary-600" />
              Media Library
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage, organize, and reuse digital assets across all your courses
              and lessons
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-300 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-primary-600" />
                Link Selected ({selectedIds.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Media
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-4 flex-1 flex flex-col">
        {/* Bulk Selection Notification Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2.5 flex items-center justify-between animate-in fade-in">
            <span className="text-xs font-medium text-primary-900">
              {selectedIds.length} item(s) selected
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(true)}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 underline"
              >
                Link to Course
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Filter and Tab Controls Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search media by title, filename, subject, or tag..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-44">
                <MediaCategorySelect
                  value={categoryId}
                  onChange={(id) => {
                    setCategoryId(id);
                    setPage(1);
                  }}
                  placeholder="All Categories"
                />
              </div>

              {tags.length > 0 && (
                <select
                  value={tag}
                  onChange={(e) => {
                    setTag(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Tags</option>
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as MediaStatus | '');
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-primary-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
                <option value="">All Statuses</option>
              </select>

              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          {/* Type Tabs */}
          <div className="px-4">
            <MediaTypeTabs
              selected={selectedTab}
              onChange={(t) => {
                setSelectedTab(t);
                setPage(1);
              }}
            />
          </div>

          {/* List or Grid Display */}
          <div className="min-h-[380px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                <span className="text-xs">Loading media assets...</span>
              </div>
            ) : view === 'grid' ? (
              <MediaGrid
                items={items}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onLinkCourse={(asset) => {
                  setSelectedIds([asset.id]);
                  setIsLinkModalOpen(true);
                }}
                onDownload={(asset) => downloadMedia(asset.id)}
                onDelete={(asset) => setAssetToDelete(asset)}
              />
            ) : (
              <MediaTable
                items={items}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onLinkCourse={(asset) => {
                  setSelectedIds([asset.id]);
                  setIsLinkModalOpen(true);
                }}
                onDownload={(asset) => downloadMedia(asset.id)}
                onDelete={(asset) => setAssetToDelete(asset)}
              />
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadMediaModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Bulk Link Modal */}
      <LinkToCourseModal
        isOpen={isLinkModalOpen}
        assetIds={selectedIds}
        onClose={() => {
          setIsLinkModalOpen(false);
          setSelectedIds([]);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(assetToDelete)}
        title="Delete Media Asset"
        message={
          deleteErrorMessage ||
          `Are you sure you want to delete "${assetToDelete?.title}"? Assets currently in use by any course or node cannot be deleted.`
        }
        confirmLabel="Delete Asset"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setAssetToDelete(null);
          setDeleteErrorMessage(null);
        }}
      />
    </div>
  );
}
