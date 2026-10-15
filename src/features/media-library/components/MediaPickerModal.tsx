import { useState } from 'react';
import {
  X,
  Search,
  Upload,
  Check,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import type { MediaAsset, MediaType } from '../types';
import { useMediaAssets } from '../hooks/useMediaLibrary';
import { useTags } from '../../courses/hooks/useMasterData';
import type { MasterData } from '../../courses/api/master-data.api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { MediaTypeTabs } from './MediaTypeTabs';
import { ViewToggle } from './ViewToggle';
import { MediaGrid } from './MediaGrid';
import { MediaTable } from './MediaTable';
import { Pagination } from './Pagination';
import { UploadMediaModal } from './UploadMediaModal';
import { MediaCategorySelect } from './MediaCategorySelect';
import { PAGE_SIZE } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  allowedTypes?: MediaType[];
  courseId?: string;
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  allowedTypes,
  courseId,
  title = 'Choose from Media Library',
}: Props) {
  const [selectedTab, setSelectedTab] = useState<MediaType | 'ALL'>(
    allowedTypes && allowedTypes.length === 1 ? allowedTypes[0] : 'ALL',
  );
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [pickedAsset, setPickedAsset] = useState<MediaAsset | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const { data: rawTags = [] } = useTags();
  const tags = ((rawTags as MasterData[]) || []).map((t) => t.name);

  // Determine query type
  const activeType: MediaType | undefined =
    selectedTab !== 'ALL'
      ? selectedTab
      : allowedTypes && allowedTypes.length === 1
        ? allowedTypes[0]
        : undefined;

  const { data, isLoading } = useMediaAssets({
    page,
    limit: PAGE_SIZE,
    type: activeType,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    tag: tag || undefined,
    status: 'ACTIVE',
  });

  if (!isOpen) return null;

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const handleChoose = (asset: MediaAsset) => {
    setPickedAsset(asset);
  };

  const handleConfirm = () => {
    if (pickedAsset) {
      onSelect(pickedAsset);
      onClose();
    }
  };

  const handleUploadSuccess = (newAssets: MediaAsset[]) => {
    if (newAssets.length > 0) {
      setPickedAsset(newAssets[0]);
    }
    setUploadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an existing asset or upload a new one
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload New
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Tabs bar */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 space-y-3 bg-slate-50/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, filename, subject..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

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

              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>

          {/* Type Tabs */}
          {(!allowedTypes || allowedTypes.length > 1) && (
            <MediaTypeTabs
              selected={selectedTab}
              onChange={(t) => {
                setSelectedTab(t);
                setPage(1);
              }}
              allowedTypes={allowedTypes}
            />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              <span className="text-xs">Loading media assets...</span>
            </div>
          ) : view === 'grid' ? (
            <MediaGrid
              items={items}
              selectedIds={pickedAsset ? [pickedAsset.id] : []}
              isPickerMode={true}
              onChoose={handleChoose}
            />
          ) : (
            <MediaTable
              items={items}
              selectedIds={pickedAsset ? [pickedAsset.id] : []}
              isPickerMode={true}
              onChoose={handleChoose}
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

        {/* Footer with selection confirmation */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {pickedAsset ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Selected:{' '}
                <strong className="text-slate-900 truncate max-w-xs sm:max-w-md inline-block align-bottom">
                  {pickedAsset.title}
                </strong>
              </span>
            ) : (
              <span className="text-slate-400">No asset selected</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!pickedAsset}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Attach Media
            </button>
          </div>
        </div>
      </div>

      {/* Direct upload modal */}
      <UploadMediaModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultLinkCourseId={courseId}
        onUploadComplete={handleUploadSuccess}
      />
    </div>
  );
}
