import { BookOpen } from 'lucide-react';
import { useListBooks } from '../../book-inventory/hooks/useBooks';
import type { CreateOrderItemDto } from '../types';

interface Props {
  items: CreateOrderItemDto[];
  onChange: (items: CreateOrderItemDto[]) => void;
}

export default function BookManifestPicker({ items, onChange }: Props) {
  const { data, isLoading } = useListBooks({ page: 1, limit: 100, status: 'IN_STOCK' });
  
  const books = data?.items ?? [];

  const handleToggle = (bookId: string, bookPrice: number, bookTitle: string) => {
    const isSelected = items.some((i) => i.bookId === bookId);
    if (isSelected) {
      onChange(items.filter((i) => i.bookId !== bookId));
    } else {
      // Temporarily store unitPrice and title for subtotal calculations in parent
      onChange([...items, { bookId, qty: 1, unitPrice: bookPrice, title: bookTitle } as any]);
    }
  };

  const handleUpdateQty = (bookId: string, delta: number, available: number) => {
    onChange(
      items.map((i) => {
        if (i.bookId !== bookId) return i;
        const newQty = Math.min(Math.max(1, i.qty + delta), available);
        return { ...i, qty: newQty };
      })
    );
  };

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-slate-500">Loading books...</div>;
  }

  if (books.length === 0) {
    return <div className="p-4 text-center text-sm text-slate-500">No books available in inventory.</div>;
  }

  return (
    <div className="space-y-1">
      {books.map((book) => {
        const selectedItem = items.find((i) => i.bookId === book.id);
        const isSelected = !!selectedItem;
        
        return (
          <div key={book.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-4">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(book.id, book.price, book.title)}
                  className="w-5 h-5 border-2 border-slate-300 rounded text-cyan-600 focus:ring-cyan-600 cursor-pointer"
                />
              </label>
              
              <div className="flex items-center gap-4">
                {book.coverImageUrl ? (
                  <img src={book.coverImageUrl} className="w-10 h-14 object-cover rounded shadow-sm" alt={book.title} />
                ) : (
                  <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-900">{book.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{book.author}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-bold text-emerald-600">{book.availableStock} left in warehouse</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-sm font-bold text-slate-900">₹{book.price.toLocaleString('en-IN')}</span>
              
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => handleUpdateQty(book.id, -1, book.availableStock)}
                  disabled={!isSelected || selectedItem.qty <= 1}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 font-bold"
                >
                  -
                </button>
                <span className="w-4 text-center text-sm font-bold text-slate-900">
                  {isSelected ? selectedItem.qty : 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateQty(book.id, 1, book.availableStock)}
                  disabled={!isSelected || selectedItem.qty >= book.availableStock}
                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
