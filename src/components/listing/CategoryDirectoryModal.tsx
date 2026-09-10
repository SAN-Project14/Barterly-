import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Layers, ChevronRight, Check } from 'lucide-react';
import { CATEGORIES } from '../../services/mockData';
import { CategoryIcon } from './CategoryIcon';

interface CategoryDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory?: string;
  categoryCounts?: Record<string, number>;
}

export function CategoryDirectoryModal({
  isOpen,
  onClose,
  onSelectCategory,
  activeCategory = 'All Categories',
  categoryCounts = {},
}: CategoryDirectoryModalProps) {
  const [searchFilter, setSearchFilter] = useState('');

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset internal search filter on open
  useEffect(() => {
    if (isOpen) {
      setSearchFilter('');
    }
  }, [isOpen]);

  // Alphabetically sorted categories (excluding 'All Categories' for the A–Z index)
  const alphabeticalCategories = useMemo(() => {
    const filtered = CATEGORIES.filter(c => c !== 'All Categories');
    return filtered.sort((a, b) => a.localeCompare(b));
  }, []);

  // Filtered categories based on search input
  const displayedCategories = useMemo(() => {
    if (!searchFilter.trim()) return alphabeticalCategories;
    const q = searchFilter.toLowerCase().trim();
    return alphabeticalCategories.filter(c => c.toLowerCase().includes(q));
  }, [alphabeticalCategories, searchFilter]);

  // Grouped by initial letter
  const groupedByLetter = useMemo(() => {
    const groups: Record<string, string[]> = {};
    displayedCategories.forEach(cat => {
      const letter = cat[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(cat);
    });
    return groups;
  }, [displayedCategories]);

  // Available letter keys sorted
  const sortedLetters = useMemo(() => Object.keys(groupedByLetter).sort(), [groupedByLetter]);

  const totalItemCount = useMemo(() => {
    return Object.values(categoryCounts).reduce((acc, count) => acc + count, 0);
  }, [categoryCounts]);

  if (!isOpen) return null;

  return (
    <div 
      id="category-directory-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-directory-title"
    >
      <div 
        id="category-directory-dialog"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Layers className="w-4 h-4" />
              </span>
              <h2 id="category-directory-title" className="text-lg font-black text-neutral-900 tracking-tight">
                A–Z Category Directory
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Browse swap items across all community trade categories
            </p>
          </div>
          <button
            id="close-category-directory-btn"
            onClick={onClose}
            className="p-2 -mr-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close category directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar in Directory */}
        <div className="px-5 sm:px-6 pt-3.5 pb-2.5 border-b border-neutral-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Find category (e.g., Electronics, Photography)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 focus:border-emerald-500 focus:bg-white focus:outline-hidden text-xs sm:text-sm transition-colors"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full cursor-pointer"
                aria-label="Clear category search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Directory Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {/* "All Categories" option (always at top) */}
          {!searchFilter && (
            <div>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('All Categories');
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                  activeCategory === 'All Categories'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                    : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/70 text-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeCategory === 'All Categories'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs sm:text-sm font-bold block">
                      All Categories
                    </span>
                    <span className="text-[11px] text-neutral-500 block">
                      Browse complete marketplace inventory
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] font-semibold text-neutral-600">
                    {totalItemCount} items
                  </span>
                  {activeCategory === 'All Categories' ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </div>
              </button>
            </div>
          )}

          {/* Alphabetical sections */}
          {sortedLetters.length > 0 ? (
            <div className="space-y-4">
              {sortedLetters.map(letter => (
                <div key={letter} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-black flex items-center justify-center">
                      {letter}
                    </span>
                    <div className="h-px flex-1 bg-neutral-100" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupedByLetter[letter].map(category => {
                      const isActive = activeCategory === category;
                      const count = categoryCounts[category] ?? 0;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            onSelectCategory(category);
                            onClose();
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/70 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className={`p-1.5 rounded-lg shrink-0 ${
                              isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              <CategoryIcon category={category} className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs sm:text-sm font-medium truncate">
                              {category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {count > 0 && (
                              <span className="text-[11px] font-semibold text-neutral-500 px-1.5 py-0.5 rounded bg-neutral-100">
                                {count}
                              </span>
                            )}
                            {isActive ? (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-bold text-neutral-700">No categories found</p>
              <p className="text-xs text-neutral-500">
                No category matched &ldquo;{searchFilter}&rdquo;. Try another term.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-neutral-100 bg-neutral-50/70 flex items-center justify-between text-xs text-neutral-500">
          <span>{displayedCategories.length} categories available</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
