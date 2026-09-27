import type { BookStatus } from '../types';

const config: Record<BookStatus, { label: string; className: string }> = {
  IN_STOCK: {
    label: 'In Stock',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  LOW_STOCK: {
    label: 'Low Stock',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
};

interface Props {
  status: BookStatus;
}

export default function StatusBadge({ status }: Props) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'IN_STOCK'
            ? 'bg-emerald-500'
            : status === 'LOW_STOCK'
            ? 'bg-amber-500'
            : 'bg-red-500'
        }`}
      />
      {label}
    </span>
  );
}
