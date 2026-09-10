import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Repeat, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  Layers, 
  RotateCcw, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  SlidersHorizontal,
  PackageSearch
} from 'lucide-react';
import { Listing } from '../types';
import { listingService } from '../services/listingService';
import { favoriteService } from '../services/favoriteService';
import { ListingCard } from '../components/listing/ListingCard';
import { ListingGrid } from '../components/listing/ListingGrid';
import { CategoryDirectoryModal } from '../components/listing/CategoryDirectoryModal';
import { CategoryIcon } from '../components/listing/CategoryIcon';
import { CATEGORIES } from '../services/mockData';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  onSelectListing: (listing: Listing) => void;
}

export function HomeView({ onSelectListing }: HomeViewProps) {
  const { navigate, setShowCreateListing } = useNavigation();
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  // Search & Category Discovery state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);

  // Popular search suggestions for quick discovery
  const popularSearches = ['Mechanical Keyboard', 'Sony Camera', 'Headphones', 'Gaming Console', 'Coffee Gear'];

  // Ref to scroll to results when a filter is chosen
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    listingService.getListings().then((items) => {
      setAllListings(items);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      favoriteService.getFavoriteIds(currentUser.id).then(setUserFavorites);
    } else {
      setUserFavorites([]);
    }
  }, [currentUser]);

  // Compute item counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(c => { counts[c] = 0; });
    allListings.forEach(item => {
      if (item.status === 'published') {
        counts[item.category] = (counts[item.category] || 0) + 1;
        counts['All Categories'] = (counts['All Categories'] || 0) + 1;
      }
    });
    return counts;
  }, [allListings]);

  // Featured Swaps: Deterministic existing-data selection
  // Prioritizes items marked isFeatured, supplemented by highest-engagement published listings
  const featuredSwaps = useMemo(() => {
    const published = allListings.filter(l => l.status === 'published');
    const explicitlyFeatured = published.filter(l => l.isFeatured);
    const others = published
      .filter(l => !l.isFeatured)
      .sort((a, b) => {
        const scoreA = (a.owner?.rating ?? 5) * 10 + (a.favoritesCount || 0) * 3 + (a.viewsCount || 0);
        const scoreB = (b.owner?.rating ?? 5) * 10 + (b.favoritesCount || 0) * 3 + (b.viewsCount || 0);
        return scoreB - scoreA;
      });
    return [...explicitlyFeatured, ...others].slice(0, 4);
  }, [allListings]);

  // Recently Added Items: Deterministic ordering strictly based on createdAt timestamps
  const recentlyAddedItems = useMemo(() => {
    return allListings
      .filter(l => l.status === 'published')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [allListings]);

  // Filtered Main Marketplace Results
  const filteredListings = useMemo(() => {
    let result = allListings.filter(l => l.status === 'published');

    if (selectedCategory && selectedCategory !== 'All Categories') {
      result = result.filter(l => l.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l => 
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.desiredExchange.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allListings, selectedCategory, searchQuery]);

  const hasActiveFilters = Boolean(searchQuery.trim() || (selectedCategory && selectedCategory !== 'All Categories'));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resultsRef.current && hasActiveFilters) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (resultsRef.current && cat !== 'All Categories') {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
  };

  const handleExploreInCatalog = () => {
    if (searchQuery.trim()) {
      navigate('/browse', searchQuery.trim());
    } else if (selectedCategory && selectedCategory !== 'All Categories') {
      navigate('/browse', selectedCategory);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 text-neutral-900 w-full min-w-0">
      {/* 1. HERO & PROMINENT SEARCH */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl px-4 py-8 sm:px-8 sm:py-12 lg:py-16">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800/90 border border-neutral-700/80 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>TRADE. MATCH. SWAP.</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Exchange What You Have. <br />
            <span className="text-emerald-400">Get What You Need.</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
            The community marketplace where idle electronics, cameras, gear, and lifestyle goods are traded directly between verified members. 100% cashless.
          </p>

          {/* Prominent Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="max-w-2xl mx-auto w-full pt-2"
          >
            <div className="relative flex items-center shadow-lg rounded-2xl bg-neutral-800/95 border border-neutral-700 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <Search className="w-5 h-5 text-neutral-400 ml-3.5 sm:ml-4 shrink-0 pointer-events-none" />
              <input
                id="homepage-prominent-search-input"
                type="text"
                placeholder="Search items, desired trade wishlists, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 pl-3 pr-2 py-3 sm:py-3.5 bg-transparent text-white placeholder:text-neutral-400 text-xs sm:text-sm focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 mr-1.5 text-neutral-400 hover:text-neutral-200 rounded-full cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="mr-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular Search Suggestions */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 text-xs text-neutral-400">
            <span className="text-[11px] font-semibold text-neutral-500 mr-1">Trending Swaps:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  if (resultsRef.current) {
                    setTimeout(() => {
                      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 font-medium text-[11px] sm:text-xs transition-colors cursor-pointer border border-neutral-700/60"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. HOMEPAGE CATEGORY DISCOVERY */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>Category Discovery</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select a category to filter community listings or open the full directory
            </p>
          </div>

          {/* A–Z Category Directory Trigger Button */}
          <button
            id="open-az-directory-btn"
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Layers className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>A–Z Category Directory</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </button>
        </div>

        {/* Category Cards: Responsive Grid on Desktop/Tablet, Horizontal Rail on Mobile */}
        <div className="w-full min-w-0">
          {/* Mobile Horizontal Scroll Rail */}
          <div className="sm:hidden relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth snap-x touch-scroll overscroll-x-contain">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`snap-start shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <CategoryIcon category={cat} className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">{cat}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tablet/Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                      : 'bg-white hover:bg-neutral-50/80 border-neutral-200/90 text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-700 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                  }`}>
                    <CategoryIcon category={cat} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-bold truncate leading-tight">
                      {cat}
                    </span>
                    <span className={`text-[11px] block mt-0.5 font-medium ${
                      isSelected ? 'text-neutral-400' : 'text-neutral-500'
                    }`}>
                      {count} items
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. ACTIVE FILTERS NOTIFICATION & MAIN MARKETPLACE RESULTS (When Filtered) */}
      <div ref={resultsRef} id="marketplace-results-anchor">
        {hasActiveFilters ? (
          <section className="space-y-6 pt-4 border-t border-neutral-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Active Filters:</span>
                {selectedCategory !== 'All Categories' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-semibold">
                    <span>Category: {selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('All Categories')}
                      className="p-0.5 hover:bg-emerald-200 rounded-full cursor-pointer"
                      aria-label="Clear category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-100/80 text-indigo-900 border border-indigo-200 text-xs font-semibold">
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-0.5 hover:bg-indigo-200 rounded-full cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <span className="text-xs text-neutral-500">
                  ({filteredListings.length} {filteredListings.length === 1 ? 'item' : 'items'} found)
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
                <button
                  type="button"
                  onClick={handleExploreInCatalog}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <span>Advanced Filters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Results Grid or Empty State */}
            {filteredListings.length > 0 ? (
              <ListingGrid
                listings={filteredListings}
                isLoading={isLoading}
                onSelectListing={onSelectListing}
                userFavorites={userFavorites}
                onResetFilters={handleResetFilters}
              />
            ) : (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-neutral-50 border border-neutral-200 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-200/80 text-neutral-600 flex items-center justify-center mx-auto">
                  <PackageSearch className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-bold text-neutral-900">
                    No swap items match your criteria
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Try broadening your search keyword, selecting a different category, or resetting active filters to view all available listings.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reset Search & Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/browse')}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Explore Entire Catalog
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>

      {/* 4. FEATURED SWAPS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Featured Swaps
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              High-reputation community items open for immediate barter proposals
            </p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {featuredSwaps.map((item) => (
            <ListingCard
              key={`featured-${item.id}`}
              listing={item}
              onSelect={onSelectListing}
              isFavoritedInitially={userFavorites.includes(item.id)}
            />
          ))}
        </div>
      </section>

      {/* 5. RECENTLY ADDED ITEMS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Recently Added Items
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Fresh trades listed by community members across all categories
            </p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {recentlyAddedItems.map((item) => (
            <ListingCard
              key={`recent-${item.id}`}
              listing={item}
              onSelect={onSelectListing}
              isFavoritedInitially={userFavorites.includes(item.id)}
            />
          ))}
        </div>
      </section>

      {/* 6. MAIN MARKETPLACE RESULTS (When Default / Not Filtered) */}
      {!hasActiveFilters && (
        <section className="space-y-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                All Available Swaps
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Browse our complete community barter catalog ({allListings.filter(l => l.status === 'published').length} items available)
              </p>
            </div>
            <button
              onClick={() => navigate('/browse')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Full Catalog</span>
            </button>
          </div>

          <ListingGrid
            listings={allListings.filter(l => l.status === 'published')}
            isLoading={isLoading}
            onSelectListing={onSelectListing}
            userFavorites={userFavorites}
          />
        </section>
      )}

      {/* 7. VALUE PILLARS (Why Barterly) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-2xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
            <Repeat className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900">Item-for-Item Barter</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Pure peer-to-peer exchanges. Propose multi-item bundles with optional balance sweeteners to achieve fair value.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-2xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900">Safe Spot Exchange Protocol</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Convenient, monitored public meet-up checkpoints and dual-confirmation receipts ensure safety and accountability.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-2xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-neutral-900">Vetted Community Ratings</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Verified email accounts, completed trade counts, and post-swap feedback build reciprocal trust in every deal.
          </p>
        </div>
      </section>

      {/* 8. 4-STEP BARTER GUIDE */}
      <section className="p-6 sm:p-10 rounded-3xl bg-neutral-50 border border-neutral-200 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Fair & Transparent</span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            How Barterly Works
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            From listing an idle device to exchanging goods at a public checkpoint in 4 straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-emerald-400 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-sm text-neutral-900">List Your Items</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Upload photos, accurately describe condition, and state what you want in exchange.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-emerald-400 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Negotiate the Barter</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Propose or receive offers. Counter back and forth with multi-item bundles until both parties agree.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-emerald-400 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Lock Safe Spot Logistics</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Step into the dedicated Trade Room. Agree on date, time, and a monitored public safe spot.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-emerald-400 font-black text-sm flex items-center justify-center">
              4
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Inspect & Complete</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Meet up, inspect items in person, both confirm receipt in the app, and leave mutual feedback.
            </p>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION BAR */}
      <section className="rounded-3xl bg-emerald-600 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">Have items sitting unused?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-md">
            Turn your extra gear, electronics, or hobby items into things you actually want today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isAuthenticated) {
                setShowCreateListing(true);
              } else {
                openAuthModal('register');
              }
            }}
            className="px-6 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            Start Bartering Free
          </button>
        </div>
      </section>

      {/* A–Z CATEGORY DIRECTORY MODAL */}
      <CategoryDirectoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategory={handleSelectCategory}
        activeCategory={selectedCategory}
        categoryCounts={categoryCounts}
      />
    </div>
  );
}
