import { useState } from 'react';
import { Loader2, MinusCircle, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Book } from '../types';

interface Props {
  book: Book;
  onClose: () => void;
  onSubmit: (delta: number) => Promise<void>;
  isSubmitting: boolean;
}

export default function AdjustStockModal({ book, onClose, onSubmit, isSubmitting }: Props) {
  const [delta, setDelta] = useState<number>(0);
  const newTotal = Math.max(book.totalStock + delta, 0);
  const newAvailable = Math.max(book.availableStock + delta, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) {
      toast.error('Delta must be non-zero');
      return;
    }
    await onSubmit(delta);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Adjust Stock</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xs">{book.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: book.totalStock, color: 'text-slate-700' },
              { label: 'Available', value: book.availableStock, color: 'text-emerald-600' },
              { label: 'Reserved', value: book.reservedStock, color: 'text-amber-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Delta Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adjustment
              <span className="ml-1 text-xs text-slate-400">(positive = add, negative = remove)</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDelta((d) => d - 1)}
                className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <MinusCircle className="w-6 h-6" />
              </button>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="flex-1 text-center text-xl font-bold py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => setDelta((d) => d + 1)}
                className="p-2 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Preview */}
          {delta !== 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
              After adjustment: Total will be{' '}
              <strong>{newTotal}</strong>, Available will be{' '}
              <strong>{newAvailable}</strong>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || delta === 0}
              className="px-5 py-2 text-sm font-medium bg-primary-800 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Apply Adjustment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
