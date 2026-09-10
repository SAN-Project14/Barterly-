import React from 'react';
import { ArrowDown, CheckCircle2, Clock, Repeat, CornerDownRight } from 'lucide-react';
import { OfferHistoryEntry } from '../../types';

interface OfferHistoryTimelineProps {
  history: OfferHistoryEntry[];
}

export function OfferHistoryTimeline({ history }: OfferHistoryTimelineProps) {
  if (!history || history.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
        Barter Negotiation History
      </h4>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
        {history.map((entry, index) => {
          const isInitial = entry.type === 'initial';
          const isLast = index === history.length - 1;

          return (
            <div key={entry.id} className="relative text-xs">
              {/* Timeline marker */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                  isInitial
                    ? 'border-emerald-500 text-emerald-600'
                    : isLast
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-neutral-400 text-neutral-500'
                }`}
              >
                {isInitial ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : (
                  <CornerDownRight className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Entry card */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/90 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-neutral-900">
                      {isInitial ? 'Offer #1 (Initial)' : `Counter-Proposal #${index}`}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="font-semibold text-neutral-700">{entry.senderName}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {entry.note && (
                  <p className="text-neutral-600 italic text-[11px] leading-relaxed">
                    "{entry.note}"
                  </p>
                )}

                <div className="pt-1 flex flex-wrap gap-1">
                  {entry.itemsOffered.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-800"
                    >
                      + {item.title}
                    </span>
                  ))}
                  {entry.cashAdjustment ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
                      + ${entry.cashAdjustment} Cash Sweetener
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
