import React, { useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { Trade } from '../../types';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReviewModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BADGES = [
  'Item Exactly As Described',
  'Prompt Communication',
  'Punctual & Reliable',
  'Friendly & Fair Trader',
  'Carefully Packaged',
  'Highly Recommended',
];

export function ReviewModal({ trade, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>(['Item Exactly As Described', 'Prompt Communication']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !trade || !currentUser) return null;

  const otherUser = currentUser.id === trade.owner.id ? trade.requester : trade.owner;

  const toggleBadge = (b: string) => {
    if (selectedBadges.includes(b)) {
      setSelectedBadges(selectedBadges.filter(i => i !== b));
    } else {
      setSelectedBadges([...selectedBadges, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Comment Required', 'Please leave a brief comment about your barter experience.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.submitReview({
        tradeId: trade.id,
        reviewerId: currentUser.id,
        revieweeId: otherUser.id,
        rating,
        comment: comment.trim(),
        tags: selectedBadges,
      });

      showToast('Review Submitted', `Thank you for rating ${otherUser.name}!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review';
      showToast('Error', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 text-neutral-900 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-base text-neutral-900">Rate Your Barter Experience</h3>
            <p className="text-xs text-neutral-500">Trading with {otherUser.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Star Rating Picker */}
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        active ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-neutral-600 mt-1 block">
              {rating === 5 && 'Outstanding Barter Experience'}
              {rating === 4 && 'Great Trade'}
              {rating === 3 && 'Acceptable Trade'}
              {rating === 2 && 'Below Expectations'}
              {rating === 1 && 'Unsatisfactory'}
            </span>
          </div>

          {/* Badges / Praise */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Highlight Trader Strengths
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BADGES.map((b) => {
                const isSelected = selectedBadges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Comment */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Written Feedback
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the trade: was the item in great condition? Was the exchange smooth and courteous?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
