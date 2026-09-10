import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Trade } from '../types';
import { TradeRoom } from '../components/trade/TradeRoom';
import { EmptyState } from '../components/common/EmptyState';
import { tradeService } from '../services/tradeService';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Badge } from '../components/common/Badge';

interface TradesViewProps {
  initialTradeId?: string;
  onOpenReviewModal: (trade: Trade) => void;
}

export function TradesView({ initialTradeId, onOpenReviewModal }: TradesViewProps) {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTrades = () => {
    if (!currentUser) return;
    setIsLoading(true);
    tradeService.getUserTrades(currentUser.id).then((all) => {
      setTrades(all);
      if (initialTradeId) {
        const found = all.find(t => t.id === initialTradeId);
        if (found) setSelectedTrade(found);
      } else if (all.length > 0 && !selectedTrade) {
        // Automatically select the first active trade if any
        const activeOne = all.find(t => t.status !== 'completed' && t.status !== 'cancelled') || all[0];
        setSelectedTrade(activeOne);
      }
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchTrades();
  }, [currentUser, initialTradeId]);

  if (!currentUser) return null;

  const activeTrades = trades.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completedTrades = trades.filter(t => t.status === 'completed' || t.status === 'cancelled');

  return (
    <div className="space-y-6 pb-16 text-neutral-900">
      {/* Top Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          Trade Rooms & Execution
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Coordinate meeting logistics, select verified safe spots, and confirm mutual receipt
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'active'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Active Trades ({activeTrades.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Trade History & Completed ({completedTrades.length})
        </button>
      </div>

      {/* Layout: Sidebar of Trades + Selected Trade Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trade List */}
        <div className="lg:col-span-4 space-y-3">
          {(activeTab === 'active' ? activeTrades : completedTrades).map((t) => {
            const isSelected = selectedTrade?.id === t.id;
            const otherUser = currentUser.id === t.owner?.id ? t.requester : t.owner;
            const ownerItemTitle = t.exchangedItems?.fromOwner?.title || t.listing?.title || 'Listing item';
            const requesterItemTitles = t.exchangedItems?.fromRequester?.map(i => i.title).join(', ') || 'Barter items';
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrade(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/10'
                    : 'border-neutral-200/90 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={otherUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-bold text-neutral-900">{otherUser?.name || 'Trading Partner'}</span>
                  </div>
                  <Badge value={t.status} />
                </div>

                <p className="text-xs text-neutral-600 font-medium truncate">
                  {ownerItemTitle} ↔ {requesterItemTitles}
                </p>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-100">
                  <span>{t.meeting?.locationName || 'Location TBD'}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}

          {(activeTab === 'active' ? activeTrades : completedTrades).length === 0 && (
            <div className="p-8 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-center text-xs text-neutral-500">
              No {activeTab} trades found.
            </div>
          )}
        </div>

        {/* Right Column: Active Trade Room */}
        <div className="lg:col-span-8">
          {selectedTrade ? (
            <TradeRoom
              trade={selectedTrade}
              onRefresh={fetchTrades}
              onOpenReviewModal={onOpenReviewModal}
            />
          ) : (
            <EmptyState
              icon={ArrowLeftRight}
              title="Select a Trade Room"
              description="Choose an active or completed trade from the sidebar to coordinate logistics and confirm mutual inspection."
            />
          )}
        </div>
      </div>
    </div>
  );
}
