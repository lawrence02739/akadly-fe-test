import React, { useState, useRef, useEffect, useId } from 'react';
import { X, Check, ChevronDown, Search } from 'lucide-react';

export interface MultiSelectProps<T extends { id: string; name: string }> {
  label?: string;
  items: T[];
  value: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  renderItem?: (item: T) => React.ReactNode;
}

export function MultiSelect<T extends { id: string; name: string }>({
  label,
  items,
  value,
  onChange,
  placeholder = 'Select options...',
  disabled = false,
  className = '',
  renderItem,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const idPrefix = useId();

  const selectedSet = new Set(value);
  const selectedItems = items.filter((item) => selectedSet.has(item.id));

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setActiveIndex(-1);
        setSearchTerm('');
      }
      return next;
    });
  };

  const toggleItem = (itemId: string) => {
    if (selectedSet.has(itemId)) {
      onChange(value.filter((id) => id !== itemId));
    } else {
      onChange([...value, itemId]);
    }
  };

  const removeItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== itemId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleOpen();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredItems.length) {
        toggleItem(filteredItems[activeIndex].id);
      }
    }
  };

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={`${idPrefix}-select`}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Control Box */}
      <div
        id={`${idPrefix}-select`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={toggleOpen}
        className={`min-h-[42px] w-full px-3 py-1.5 border rounded-lg flex flex-wrap items-center gap-1.5 cursor-pointer transition-colors bg-white ${
          disabled
            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
            : isOpen
              ? 'border-primary-500 ring-2 ring-primary-100'
              : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {selectedItems.length === 0 ? (
          <span className="text-slate-400 text-sm select-none">
            {placeholder}
          </span>
        ) : (
          selectedItems.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
            >
              <span className="max-w-[150px] truncate">{item.name}</span>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={(e) => removeItem(item.id, e)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))
        )}

        <div className="ml-auto pl-1 self-center text-slate-400">
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col animate-in fade-in-50 duration-100"
        >
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full text-sm outline-none bg-transparent placeholder-slate-400"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Items List */}
          <div className="overflow-y-auto py-1 flex-1">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-400">
                No options found
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedSet.has(item.id);
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleItem(item.id)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                      isActive ? 'bg-primary-50' : 'hover:bg-slate-50'
                    } ${isSelected ? 'text-primary-700 font-medium' : 'text-slate-700'}`}
                  >
                    <div className="truncate">
                      {renderItem ? renderItem(item) : item.name}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-600 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
