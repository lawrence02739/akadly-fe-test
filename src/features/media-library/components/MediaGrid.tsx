import type { MediaAsset } from '../types';
import { MediaCard } from './MediaCard';

interface Props {
  items: Array<{ asset: MediaAsset; usageCount: number } | MediaAsset>;
  selectedIds: string[];
  onToggleSelect?: (id: string) => void;
  onLinkCourse?: (asset: MediaAsset) => void;
  onDownload?: (asset: MediaAsset) => void;
  onDelete?: (asset: MediaAsset) => void;
  isPickerMode?: boolean;
  onChoose?: (asset: MediaAsset) => void;
}

export function MediaGrid({
  items,
  selectedIds,
  onToggleSelect,
  onLinkCourse,
  onDownload,
  onDelete,
  isPickerMode = false,
  onChoose,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-slate-600">No media assets found</p>
        <p className="text-xs text-slate-400 mt-1">
          Try adjusting your search or filters, or upload new files.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {items.map((item) => {
        const asset: MediaAsset | undefined =
          item && 'asset' in item && item.asset
            ? item.asset
            : (item as MediaAsset);
        const usageCount =
          item && 'usageCount' in item && typeof item.usageCount === 'number'
            ? item.usageCount
            : 0;

        if (!asset || !asset.id) return null;

        return (
          <MediaCard
            key={asset.id}
            asset={asset}
            usageCount={usageCount}
            isSelected={selectedIds.includes(asset.id)}
            onToggleSelect={onToggleSelect}
            onLinkCourse={onLinkCourse}
            onDownload={onDownload}
            onDelete={onDelete}
            isPickerMode={isPickerMode}
            onChoose={onChoose}
          />
        );
      })}
    </div>
  );
}
