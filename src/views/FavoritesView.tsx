import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Listing } from '../types';
import { favoriteService } from '../services/favoriteService';
import { ListingGrid } from '../components/listing/ListingGrid';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

interface FavoritesViewProps {
  onSelectListing: (listing: Listing) => void;
}

export function FavoritesView({ onSelectListing }: FavoritesViewProps) {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const [favoritedListings, setFavoritedListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (currentUser) {
      favoriteService.getUserFavorites(currentUser.id).then((listings) => {
        setFavoritedListings(listings);
        setFavoriteIds(listings.map(l => l.id));
        setIsLoading(false);
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-16 text-neutral-900">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          Saved Wishlist
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Keep track of items you are interested in bartering for in the future
        </p>
      </div>

      <ListingGrid
        listings={favoritedListings}
        isLoading={isLoading}
        onSelectListing={onSelectListing}
        userFavorites={favoriteIds}
        emptyTitle="No Saved Favorites"
        emptyDescription="Explore the marketplace and click the heart icon on any listing to bookmark it."
      />
    </div>
  );
}
