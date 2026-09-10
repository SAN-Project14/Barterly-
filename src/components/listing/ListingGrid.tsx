import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Listing } from '../../types';
import { ListingCard } from './ListingCard';
import { EmptyState } from '../common/EmptyState';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  onSelectListing?: (listing: Listing) => void;
  userFavorites?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export function ListingGrid({
  listings,
  isLoading = false,
  onSelectListing,
  userFavorites = [],
  emptyTitle = 'No Items Found',
  emptyDescription = 'Try adjusting your search keywords, clearing categories, or broadening condition filters.',
  onResetFilters,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-neutral-200/90 p-2.5 sm:p-3.5 space-y-2.5 animate-pulse flex flex-col justify-between">
            <div className="space-y-2">
              {/* Image Skeleton */}
              <div className="aspect-4/3 bg-neutral-100 rounded-xl w-full" />
              
              {/* Category & Location Skeleton */}
              <div className="flex justify-between pt-1">
                <div className="h-3 bg-neutral-100 rounded-md w-20" />
                <div className="h-3 bg-neutral-100 rounded-md w-14" />
              </div>

              {/* Title Skeleton (2 lines) */}
              <div className="space-y-1 py-0.5">
                <div className="h-3.5 bg-neutral-100 rounded-md w-full" />
                <div className="h-3.5 bg-neutral-100 rounded-md w-3/4" />
              </div>

              {/* Seeking Barter Box Skeleton */}
              <div className="h-11 bg-neutral-50 rounded-xl border border-neutral-100 p-2" />
            </div>

            {/* Footer Skeleton */}
            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-neutral-100" />
                  <div className="h-3 w-16 bg-neutral-100 rounded-md" />
                </div>
                <div className="h-3 w-8 bg-neutral-100 rounded-md" />
              </div>
              <div className="h-8 bg-neutral-100 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={emptyTitle}
        description={emptyDescription}
        action={onResetFilters ? { label: 'Reset All Filters', onClick: onResetFilters } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onSelect={onSelectListing}
          isFavoritedInitially={userFavorites.includes(listing.id)}
        />
      ))}
    </div>
  );
}
