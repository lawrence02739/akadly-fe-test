import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpload } from '../../courses/hooks/useUpload';
import CreatableDropdown from '../../../shared/components/CreatableDropdown';
import { useListCategories } from '../hooks/useBooks';
import type { Book, CreateBookDto, UpdateBookDto } from '../types';

interface Props {
  book?: Book | null;
  onClose: () => void;
  onSubmit: (data: CreateBookDto | UpdateBookDto) => Promise<void>;
  isSubmitting: boolean;
}

export default function BookFormModal({ book, onClose, onSubmit, isSubmitting }: Props) {
  const isEdit = !!book;
  const { data: categoryList = [] } = useListCategories();
  const upload = useUpload();

  const [form, setForm] = useState<CreateBookDto>({
    title: book?.title ?? '',
    author: book?.author ?? '',
    isbn: book?.isbn ?? '',
    category: book?.category ?? '',
    coverImageUrl: book?.coverImageUrl ?? '',
    price: book?.price ?? 0,
    totalStock: book?.totalStock ?? 0,
    lowStockThreshold: book?.lowStockThreshold ?? 15,
  });

  const [imagePreview, setImagePreview] = useState<string>(book?.coverImageUrl ?? '');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        coverImageUrl: book.coverImageUrl ?? '',
        price: book.price,
        totalStock: book.totalStock,
        lowStockThreshold: book.lowStockThreshold,
      });
      setImagePreview(book.coverImageUrl ?? '');
    }
  }, [book]);

  const set = (key: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    const ext = file.name.split('.').pop();
    const key = `books/covers/${Date.now()}.${ext}`;
    try {
      const fileUrl = await upload.mutateAsync({
        file,
        key,
        onProgress: setUploadProgress,
      });
      const originalUrl = fileUrl.split('?')[0];
      set('coverImageUrl', originalUrl);
      setUploadProgress(null);
    } catch {
      toast.error('Cover image upload failed');
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.category.trim()) {
      toast.error('Title, Author, ISBN, and Category are required');
      return;
    }
    if (isEdit) {
      const { totalStock, ...updatePayload } = form;
      await onSubmit(updatePayload);
    } else {
      await onSubmit(form);
    }
  };

  // Build category items for CreatableDropdown
  const categoryItems = categoryList.map((c) => ({ _id: c, name: c }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isEdit ? 'Edit Book' : 'Add New Book'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? 'Update book details' : 'Add a book to your inventory'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Cover Image</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all relative overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Cover preview" className="h-full w-full object-contain p-2" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-xs text-slate-400">Click to upload cover</span>
                </>
              )}
              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin mb-1" />
                  <span className="text-xs text-primary-600">{uploadProgress}%</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Clean Code"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="e.g. Robert C. Martin"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.isbn}
              onChange={(e) => set('isbn', e.target.value)}
              placeholder="978-0-00-000000-0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <CreatableDropdown
              items={categoryItems}
              value={form.category}
              onChange={(val) => set('category', val)}
              onCreate={async (name) => {
                set('category', name);
                return { _id: name, name };
              }}
              placeholder="Select or type a category..."
            />
          </div>

          {/* Price & Total Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => set('price', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Total Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={form.totalStock}
                onChange={(e) => set('totalStock', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                required={!isEdit}
                disabled={isEdit}
              />
            </div>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Low Stock Alert Threshold
              <span className="ml-1 text-xs text-slate-400">(optional, default 15)</span>
            </label>
            <input
              type="number"
              min={0}
              value={form.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="book-form"
            onClick={handleSubmit}
            disabled={isSubmitting || upload.isPending}
            className="px-5 py-2 text-sm font-medium bg-primary-800 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEdit ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              <>{isEdit ? 'Save Changes' : 'Add Book'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
