import { useRef, useState, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, TrendingUp } from 'lucide-react';
import type { Book } from '../types';

interface Props {
  book: Book;
  onEdit: (book: Book) => void;
  onAdjustStock: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export default function BookRowActionsMenu({ book, onEdit, onAdjustStock, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const action = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        id={`book-actions-${book.id}`}
        onClick={() => setOpen((prev) => !prev)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-1 z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 overflow-hidden">
          <button
            onClick={() => action(() => onEdit(book))}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-4 h-4 text-slate-400" />
            Edit Details
          </button>
          <button
            onClick={() => action(() => onAdjustStock(book))}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Adjust Stock
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => action(() => onDelete(book))}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
