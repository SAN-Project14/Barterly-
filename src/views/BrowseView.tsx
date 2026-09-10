import React, { useState, useEffect } from 'react';
import { Listing, FilterOptions } from '../types';
import { listingService } from '../services/listingService';
import { ListingFilters } from '../components/listing/ListingFilters';
import { ListingGrid } from '../components/listing/ListingGrid';
import { useAuth } from '../context/AuthContext';
import { favoriteService } from '../services/favoriteService';
import { CATEGORIES } from '../services/mockData';

interface BrowseViewProps {
  initialSearch?: string;
  onSelectListing: (listing: Listing) => void;
}

export function BrowseView({ initialSearch = '', onSelectListing }: BrowseViewProps) {
  const { currentUser } = useAuth();

  const [filters, setFilters] = useState<FilterOptions>(() => {
    const isCat = CATEGORIES.includes(initialSearch) && initialSearch !== 'All Categories';
    return {
      searchQuery: isCat ? '' : initialSearch,
      category: isCat ? initialSearch : undefined,
      sortBy: 'newest',
    };
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      const isCat = CATEGORIES.includes(initialSearch) && initialSearch !== 'All Categories';
      setFilters(prev => ({
        ...prev,
        searchQuery: isCat ? '' : initialSearch,
        category: isCat ? initialSearch : prev.category,
      }));
    }
  }, [initialSearch]);

  useEffect(() => {
    setIsLoading(true);
    listingService.getListings(filters).then((items) => {
      setListings(items);
      setIsLoading(false);
    });
  }, [filters]);

  useEffect(() => {
    if (currentUser) {
      favoriteService.getFavoriteIds(currentUser.id).then(setUserFavorites);
    }
  }, [currentUser]);

  const handleResetFilters = () => {
    setFilters({ sortBy: 'newest' });
  };

  return (
    <div className="space-y-6 pb-16 text-neutral-900">
      {/* Top Title Bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          Browse Marketplace
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Explore items available for item-to-item barter or trade across all categories
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <ListingFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalResultsCount={listings.length}
      />

      {/* Grid of Results */}
      <ListingGrid
        listings={listings}
        isLoading={isLoading}
        onSelectListing={onSelectListing}
        userFavorites={userFavorites}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
