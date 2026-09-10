import React, { useState, useEffect } from 'react';
import { Repeat, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';
import { Offer, OfferStatus } from '../types';
import { OfferCard } from '../components/offer/OfferCard';
import { EmptyState } from '../components/common/EmptyState';
import { offerService } from '../services/offerService';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';

interface OffersViewProps {
  onOpenCounterModal: (offer: Offer) => void;
}

export function OffersView({ onOpenCounterModal }: OffersViewProps) {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [sentOffers, setSentOffers] = useState<Offer[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOffers = () => {
    if (!currentUser) return;
    setIsLoading(true);
    Promise.all([
      offerService.getReceivedOffers(currentUser.id),
      offerService.getSentOffers(currentUser.id),
    ]).then(([received, sent]) => {
      setReceivedOffers(received);
      setSentOffers(sent);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchOffers();
  }, [currentUser]);

  if (!currentUser) return null;

  const currentList = activeTab === 'received' ? receivedOffers : sentOffers;
  const filteredOffers = currentList.filter(o => {
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-16 text-neutral-900">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          Offers & Negotiations
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Track incoming barter proposals, review counter-offers, or withdraw sent proposals
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Offers Received ({receivedOffers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-indigo-400" />
            <span>Offers Sent ({sentOffers.length})</span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'pending', 'countered', 'accepted', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-neutral-500 hover:bg-neutral-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Offers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length > 0 ? (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onCounter={onOpenCounterModal}
              onRefresh={fetchOffers}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Repeat}
          title={activeTab === 'received' ? 'No Received Offers' : 'No Sent Offers'}
          description={
            activeTab === 'received'
              ? 'When other traders make offers on your items, they will appear here.'
              : 'Browse marketplace items and make barter proposals with your inventory!'
          }
          action={
            activeTab === 'sent'
              ? { label: 'Browse Marketplace', onClick: () => navigate('/browse') }
              : undefined
          }
        />
      )}
    </div>
  );
}
