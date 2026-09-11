import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Check, 
  X, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  ExternalLink,
  DollarSign,
  Package
} from 'lucide-react';
import { Offer } from '../../types';
import { Badge } from '../common/Badge';
import { OfferHistoryTimeline } from './OfferHistoryTimeline';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { offerService } from '../../services/offerService';
import { useToast } from '../../context/ToastContext';

interface OfferCardProps {
  key?: string | number;
  offer: Offer;
  onCounter: (offer: Offer) => void;
  onRefresh?: () => void;
}

export function OfferCard({ offer, onCounter, onRefresh }: OfferCardProps) {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!currentUser) return null;

  const isOwner = currentUser.id === offer.listing.ownerId; // Receiver of original offer
  const isRequester = currentUser.id === offer.requesterId; // Sender of original offer

  // Check who needs to respond when status is 'countered'
  const lastHistory = offer.history?.[offer.history.length - 1];
  const lastSenderId = lastHistory?.senderId || offer.requesterId;
  const isMyTurnToRespond = offer.status === 'countered'
    ? currentUser.id !== lastSenderId
    : isOwner && offer.status === 'pending';

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const { trade } = await offerService.acceptOffer(offer.id);
      showToast(
        'Barter Accepted!',
        'A formal trade agreement has been established! Proceeding to the Trade Room.',
        'success'
      );
      onRefresh?.();
      navigate('/app/trades', trade.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error accepting offer';
      showToast('Acceptance Failed', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await offerService.rejectOffer(offer.id);
      showToast('Offer Declined', 'The offer has been marked as rejected.', 'info');
      onRefresh?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error rejecting offer';
      showToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    setIsProcessing(true);
    try {
      await offerService.withdrawOffer(offer.id);
      showToast('Offer Withdrawn', 'Your barter proposal was cancelled.', 'info');
      onRefresh?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error withdrawing offer';
      showToast('Error', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id={`offer-card-${offer.id}`}
      className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all p-5 space-y-4"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Badge value={offer.status} />
          <span className="text-xs text-neutral-400">
            {new Date(offer.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          {isRequester ? (
            <span>You offered to <strong className="text-neutral-900">{offer.listing.owner.name}</strong></span>
          ) : (
            <span>Received from <strong className="text-neutral-900">{offer.requester.name}</strong></span>
          )}
        </div>
      </div>

      {/* Main Trade Exchange Comparison: Target Item vs Offered Items */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* Target Item (Left) */}
        <div className="md:col-span-5 p-3 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
          <img
            src={offer.listing.images[0]}
            alt={offer.listing.title}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">Target Item</span>
            <p className="text-xs font-bold text-neutral-900 truncate">{offer.listing.title}</p>
            <p className="text-[11px] text-neutral-500 capitalize">{offer.listing.condition?.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Center Exchange Icon */}
        <div className="md:col-span-1 flex justify-center py-1 md:py-0">
          <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 shadow-2xs">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* Offered Items (Right) */}
        <div className="md:col-span-5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-3">
          <div className="flex -space-x-2 shrink-0">
            {offer.offeredItems.slice(0, 3).map((item, idx) => (
              <img
                key={idx}
                src={item.image}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-2xs"
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Offered in Return</span>
            <p className="text-xs font-bold text-neutral-900 truncate">
              {offer.offeredItems.map(i => i.title).join(' + ')}
            </p>
            {offer.cashAdjustment ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                + ${offer.cashAdjustment} Cash Sweetener
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Proposal Note */}
      {offer.note && (
        <div className="p-3 rounded-xl bg-neutral-50 text-xs text-neutral-700 border border-neutral-100 italic">
          "{offer.note}"
        </div>
      )}

      {/* Offer Negotiation History Accordion */}
      {offer.history && offer.history.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
          >
            <span>{expanded ? 'Hide negotiation history' : `View negotiation history (${offer.history.length} events)`}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-neutral-100">
              <OfferHistoryTimeline history={offer.history} />
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        {/* If offer was accepted, show link to trade room */}
        {offer.status === 'accepted' ? (
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Offer Accepted & Trade Established</span>
            </span>
            <button
              onClick={() => navigate('/app/trades')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Go to Active Trade Room</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            {/* Actions for the responding party */}
            {isMyTurnToRespond ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept Offer</span>
                </button>

                <button
                  onClick={() => onCounter(offer)}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Counter-Offer</span>
                </button>

                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline</span>
                </button>
              </div>
            ) : (
              /* If user sent this offer and it's pending */
              isRequester && offer.status === 'pending' && (
                <button
                  onClick={handleWithdraw}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  Withdraw Offer
                </button>
              )
            )}

            {/* View Target Listing button */}
            <button
              onClick={() => navigate('/listing', offer.listingId)}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-medium ml-auto flex items-center gap-1 cursor-pointer"
            >
              <span>View Original Listing</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
