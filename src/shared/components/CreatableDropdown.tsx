import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Loader2, Check } from 'lucide-react';

interface CreatableDropdownProps {
  label?: string;
  items: Array<{ _id: string; name: string }>;
  value: string | string[]; // Single id or array of ids
  onChange: (value: any) => void;
  onCreate: (name: string) => Promise<{ _id: string; name: string }>;
  isCreating?: boolean;
  multiple?: boolean;
  placeholder?: string;
}

export default function CreatableDropdown({
  label,
  items,
  value,
  onChange,
  onCreate,
  isCreating = false,
  multiple = false,
  placeholder = 'Select or create...',
}: CreatableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter items based on search
  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  const exactMatch = items?.find(
    (item) => item.name.toLowerCase() === inputValue.toLowerCase()
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: { _id: string; name: string }) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (!currentValues.includes(item.name)) {
        onChange([...currentValues, item.name]);
      }
    } else {
      onChange(item.name);
      setIsOpen(false);
    }
    setInputValue('');
  };

  const handleRemove = (nameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter((v) => v !== nameToRemove));
    } else {
      onChange('');
    }
  };

  const handleCreate = async () => {
    if (!inputValue.trim() || exactMatch || isCreating) return;
    try {
      const newItem = await onCreate(inputValue.trim());
      handleSelect(newItem);
    } catch (error) {
      console.error('Failed to create item', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && !exactMatch) {
        handleCreate();
      } else if (filteredItems.length > 0) {
        handleSelect(filteredItems[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const currentValues = (multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])) as string[];

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      
      <div 
        className="min-h-[42px] border border-slate-300 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 flex flex-wrap gap-2 items-center bg-white cursor-text"
        onClick={() => setIsOpen(true)}
      >
        {currentValues.map((val: string) => (
          <span key={val} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 text-sm">
            {val}
            <button
              onClick={(e) => handleRemove(val, e)}
              className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={currentValues.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-sm p-1 outline-none"
        />
        {isCreating && <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-2" />}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.map((item) => (
            <button
              key={item._id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>{item.name}</span>
              {currentValues.includes(item.name) && <Check className="w-4 h-4 text-primary-600" />}
            </button>
          ))}

          {inputValue.trim() && !exactMatch && (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full text-left px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 flex items-center gap-2 border-t border-slate-100"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create "{inputValue}"
            </button>
          )}

          {filteredItems.length === 0 && !inputValue.trim() && (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              No options available. Type to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
