import { useState } from 'react';
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdjustStock,
  useCreateBook,
  useDeleteBook,
  useExportBooksCsv,
  useListBooks,
  useListCategories,
  useUpdateBook,
} from '../hooks/useBooks';
import type { Book, BookStatus, ListBooksParams } from '../types';
import StatusBadge from '../components/StatusBadge';
import BookFormModal from '../components/BookFormModal';
import AdjustStockModal from '../components/AdjustStockModal';

const STATUS_OPTIONS: { value: BookStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
];

export default function BookInventoryDashboard() {
  const [params, setParams] = useState<ListBooksParams>({
    page: 1,
    limit: 20,
    createdAfter: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString();
    })(),
  });

  const { data, isLoading } = useListBooks(params);
  const { data: categories = [] } = useListCategories();
  const createBook = useCreateBook();
  const updateBook = useUpdateBook();
  const adjustStock = useAdjustStock();
  const deleteBook = useDeleteBook();
  const exportCsv = useExportBooksCsv();

  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [adjustingBook, setAdjustingBook] = useState<Book | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);

  const books = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const applySearch = () => {
    setParams((p) => ({ ...p, page: 1, search: search || undefined }));
  };

  const handleStatusFilter = (status: BookStatus | '') => {
    setParams((p) => ({ ...p, page: 1, status: status || undefined }));
  };

  const handleCategoryFilter = (category: string) => {
    setParams((p) => ({ ...p, page: 1, category: category || undefined }));
  };

  const handleDateFilter = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    setParams((p) => ({ ...p, page: 1, createdAfter: d.toISOString() }));
  };

  const handleCreateOrUpdate = async (dto: any) => {
    try {
      if (editingBook) {
        await updateBook.mutateAsync({ id: editingBook.id, dto });
        toast.success('Book updated successfully');
      } else {
        await createBook.mutateAsync(dto);
        toast.success('Book added to inventory');
      }
      setShowFormModal(false);
      setEditingBook(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong');
    }
  };

  const handleAdjustStock = async (delta: number) => {
    if (!adjustingBook) return;
    try {
      await adjustStock.mutateAsync({ id: adjustingBook.id, dto: { delta } });
      toast.success('Stock adjusted successfully');
      setAdjustingBook(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to adjust stock');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteBook.mutateAsync(confirmDelete.id);
      toast.success('Book deleted');
      setConfirmDelete(null);
    } catch {
      toast.error('Failed to delete book');
    }
  };

  const handleExport = async () => {
    try {
      await exportCsv.mutateAsync();
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Inventory</h1>
            <p className="text-sm text-slate-500 mt-1">Track and manage all inventory</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Created filter */}
            <button
              id="book-date-filter"
              onClick={() => handleDateFilter(30)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Created: Last 30 days
            </button>

            {/* Export CSV */}
            <button
              id="book-export-csv"
              onClick={handleExport}
              disabled={exportCsv.isPending}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            {/* Add New Item */}
            <button
              id="book-add-new"
              onClick={() => { setEditingBook(null); setShowFormModal(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Item
            </button>
          </div>
        </div>

        {/* ── Filters Row ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-52 max-w-80">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              id="book-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Search title or author…"
              className="bg-transparent text-sm text-slate-700 outline-none flex-1 placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => { setSearch(''); setParams((p) => ({ ...p, search: undefined, page: 1 })); }}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              id="book-status-filter"
              onChange={(e) => handleStatusFilter(e.target.value as BookStatus | '')}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <select
            id="book-category-filter"
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6">
        {/* Card — overflow-visible so the actions dropdown is never clipped */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
          {/* Fixed-height scroll area */}
          <div className="overflow-auto" style={{ maxHeight: '60vh', minHeight: '340px' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                  {[
                    'Cover',
                    'Book Details',
                    'ISBN',
                    'Category',
                    'Total Stock',
                    'Available',
                    'Reserved',
                    'Price',
                    'Status',
                    'Actions',
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <BookOpen className="w-10 h-10 animate-pulse" />
                        <span className="text-sm">Loading inventory…</span>
                      </div>
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <BookOpen className="w-10 h-10" />
                        <p className="text-sm font-medium">No books found</p>
                        <p className="text-xs">Add your first book to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr
                      key={book.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Cover */}
                      <td className="px-4 py-3">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded-md border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-md bg-gradient-to-br from-primary-100 to-primary-50 border border-slate-200 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary-400" />
                          </div>
                        )}
                      </td>

                      {/* Book Details */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium text-slate-800 truncate">{book.title}</p>
                        <p className="text-xs text-slate-500 truncate">{book.author}</p>
                      </td>

                      {/* ISBN */}
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                        {book.isbn}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          {book.category}
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {book.totalStock}
                      </td>

                      {/* Available */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-emerald-600">{book.availableStock}</span>
                      </td>

                      {/* Reserved */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-amber-600">{book.reservedStock}</span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-medium">
                        ₹{book.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={book.status} />
                      </td>

                      {/* Actions — inline icon buttons, no dropdown */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <button
                            id={`book-edit-${book.id}`}
                            title="Edit book"
                            onClick={() => { setEditingBook(book); setShowFormModal(true); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Adjust Stock */}
                          <button
                            id={`book-stock-${book.id}`}
                            title="Adjust stock"
                            onClick={() => setAdjustingBook(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`book-delete-${book.id}`}
                            title="Delete book"
                            onClick={() => setConfirmDelete(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {total > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
            <span>
              Showing {from}–{to} of {total} assets
            </span>
            <div className="flex items-center gap-2">
              <button
                id="book-prev-page"
                onClick={() => setParams((p) => ({ ...p, page: Math.max((p.page ?? 1) - 1, 1) }))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 rounded-lg bg-primary-800 text-white text-xs font-semibold">
                {page}
              </span>
              <span className="text-slate-400 text-xs">of {totalPages}</span>
              <button
                id="book-next-page"
                onClick={() => setParams((p) => ({ ...p, page: Math.min((p.page ?? 1) + 1, totalPages) }))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showFormModal && (
        <BookFormModal
          book={editingBook}
          onClose={() => { setShowFormModal(false); setEditingBook(null); }}
          onSubmit={handleCreateOrUpdate}
          isSubmitting={createBook.isPending || updateBook.isPending}
        />
      )}

      {adjustingBook && (
        <AdjustStockModal
          book={adjustingBook}
          onClose={() => setAdjustingBook(null)}
          onSubmit={handleAdjustStock}
          isSubmitting={adjustStock.isPending}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Book?</h3>
            <p className="text-sm text-slate-500 mb-6">
              <strong>"{confirmDelete.title}"</strong> will be removed from the inventory. This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBook.isPending}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteBook.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
