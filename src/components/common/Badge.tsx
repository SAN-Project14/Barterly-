import React from 'react';
import { ListingCondition, ListingStatus, OfferStatus, TradeStatus } from '../../types';

interface BadgeProps {
  variant?: 'default' | 'outline' | 'condition' | 'status' | 'offer' | 'trade';
  value?: ListingCondition | ListingStatus | OfferStatus | TradeStatus | string;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', value, children, className = '' }: BadgeProps) {
  const getStyle = () => {
    switch (value) {
      // Conditions
      case 'brand_new':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'like_new':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'good':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'fair':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      // Listing Statuses
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'reserved':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'traded':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending_review':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'draft':
      case 'archived':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      case 'rejected':
      case 'hidden':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // Offer Statuses
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'countered':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'withdrawn':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';

      // Trade Statuses
      case 'offer_accepted':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'trade_arranged':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'disputed':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const formatText = (val: string) => {
    return val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap tracking-wide ${getStyle()} ${className}`}
    >
      {children || (value ? formatText(String(value)) : '')}
    </span>
  );
}
