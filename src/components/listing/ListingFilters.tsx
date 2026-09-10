import React, { useState } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  RotateCcw, 
  MapPin, 
  Layers, 
  Check
} from 'lucide-react';
import { FilterOptions, ListingCondition } from '../../types';
import { CATEGORIES } from '../../services/mockData';
import { CategoryIcon } from './CategoryIcon';

interface ListingFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
  totalResultsCount: number;
}

export function ListingFilters({ filters, onChange, onReset, totalResultsCount }: ListingFiltersProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  const conditions: { label: string; value: ListingCondition | 'all' }[] = [
    { label: 'All Conditions', value: 'all' },
    { label: 'Brand New', value: 'brand_new' },
    { label: 'Like New', value: 'like_new' },
    { label: 'Good', value: 'good' },
    { label: 'Fair', value: 'fair' },
  ];

  const sortOptions = [
    { label: 'Newest Listings', value: 'newest' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Highest Rated Trader', value: 'rating' },
  ];

  const activeFiltersCount = [
    filters.category && filters.category !== 'All Categories',
    filters.condition && filters.condition !== 'all',
    filters.locationCity?.trim(),
    filters.searchQuery?.trim(),
  ].filter(Boolean).length;

  return (
    <div className="w-full space-y-3.5">
      {/* Top Search & Filter Control Row */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="filters-search-input"
            type="text"
            placeholder="Search items by keyword, brand, or desired exchange wishlist..."
            value={filters.searchQuery || ''}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-neutral-200/90 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-hidden transition-all shadow-2xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Select & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            id="filters-sort-select"
            value={filters.sortBy || 'newest'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="px-3 py-2.5 rounded-2xl bg-white border border-neutral-200/90 text-xs sm:text-sm font-semibold text-neutral-700 focus:border-emerald-500 focus:outline-hidden shadow-2xs cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Mobile Filters Trigger */}
          <button
            id="filters-mobile-toggle-btn"
            onClick={() => setMobileDrawerOpen(true)}
            className="sm:hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Navigation Bar (Horizontally scrollable container only) */}
      <div className="w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth w-full touch-scroll overscroll-x-contain">
          {CATEGORIES.map((cat) => {
            const isSelected = (!filters.category && cat === 'All Categories') || filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => onChange({ ...filters, category: cat === 'All Categories' ? undefined : cat })}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[40px] sm:min-h-[36px] shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <CategoryIcon category={cat} className="w-3.5 h-3.5 shrink-0" />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Inline Condition and Location Bar */}
      <div className="hidden sm:flex items-center justify-between pt-1.5 text-xs text-neutral-500 border-t border-neutral-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-neutral-600">Condition:</span>
            <div className="inline-flex rounded-xl bg-neutral-100 p-0.5 border border-neutral-200/60">
              {conditions.map((c) => (
                <button
                  key={c.value}
                  onClick={() => onChange({ ...filters, condition: c.value === 'all' ? undefined : c.value })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    (filters.condition === c.value || (!filters.condition && c.value === 'all'))
                      ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative inline-flex items-center">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 mr-1" />
            <input
              type="text"
              placeholder="City (e.g. Quezon City)..."
              value={filters.locationCity || ''}
              onChange={(e) => onChange({ ...filters, locationCity: e.target.value })}
              className="px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-hidden focus:border-emerald-500 w-40"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900 font-bold">{totalResultsCount}</strong> {totalResultsCount === 1 ? 'item' : 'items'}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips (if any filter is applied) */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Active:</span>
          {filters.category && filters.category !== 'All Categories' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              {filters.category}
              <button
                onClick={() => onChange({ ...filters, category: undefined })}
                className="hover:text-emerald-950 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.condition && filters.condition !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 font-medium">
              {conditions.find(c => c.value === filters.condition)?.label}
              <button
                onClick={() => onChange({ ...filters, condition: undefined })}
                className="hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.locationCity?.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 font-medium">
              City: {filters.locationCity}
              <button
                onClick={() => onChange({ ...filters, locationCity: undefined })}
                className="hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.searchQuery?.trim() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 font-medium">
              "{filters.searchQuery}"
              <button
                onClick={() => onChange({ ...filters, searchQuery: undefined })}
                className="hover:text-neutral-950 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={onReset}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Mobile Filters Drawer Modal */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/60 backdrop-blur-xs sm:hidden">
          <div className="w-full max-w-[85vw] bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-base font-bold text-neutral-900">Filter Listings</h3>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-2">Category</label>
                <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = (!filters.category && cat === 'All Categories') || filters.category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => onChange({ ...filters, category: cat === 'All Categories' ? undefined : cat })}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'border-neutral-100 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <CategoryIcon category={cat} className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1 truncate">{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-2">Item Condition</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {conditions.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => onChange({ ...filters, condition: c.value === 'all' ? undefined : c.value })}
                      className={`p-2 rounded-xl text-xs font-medium border text-left cursor-pointer ${
                        (filters.condition === c.value || (!filters.condition && c.value === 'all'))
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                          : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">Approx. Location / City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="e.g. Quezon City, Makati"
                    value={filters.locationCity || ''}
                    onChange={(e) => onChange({ ...filters, locationCity: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center gap-2 mt-4">
              <button
                onClick={() => { onReset(); setMobileDrawerOpen(false); }}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Show {totalResultsCount} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
