import React from 'react';
import { ShieldAlert, X, AlertOctagon, CheckCircle2, Shield } from 'lucide-react';

interface ProhibitedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProhibitedItemsModal({ isOpen, onClose }: ProhibitedItemsModalProps) {
  if (!isOpen) return null;

  const prohibitedList = [
    {
      title: 'Weapons & Dangerous Instruments',
      desc: 'Firearms, ammunition, tactical combat blades, stun devices, explosive fireworks, or replica firearms.',
    },
    {
      title: 'Controlled Substances & Medical Items',
      desc: 'Prescription medications, illegal narcotics, vape cartridges, tobacco products, and regulated medical equipment.',
    },
    {
      title: 'Counterfeit & Replica Goods',
      desc: 'Unauthorized reproductions, fake designer apparel, counterfeit electronics, cloned accessories, or cracked software.',
    },
    {
      title: 'Financial & Digital Currency Instruments',
      desc: 'Cash currency, prepaid cards, crypto hardware wallets loaded with assets, securities, or financial vouchers.',
    },
    {
      title: 'Animals & Wildlife Products',
      desc: 'Live animals, taxidermy of protected fauna, ivory, reptile skins, or restricted biological specimens.',
    },
    {
      title: 'Stolen or Encumbered Property',
      desc: 'Goods with reported lost/stolen serial numbers, locked iCloud/activation devices, or items under financial lien.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Prohibited Items & Safety Policy</h2>
              <p className="text-xs text-neutral-500">Marketplace rules enforced by Barterly Trust & Safety</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-sm">
            <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Zero Tolerance Policy:</span> Listing any of the items below will result in immediate listing removal, account warning, suspension, or permanent ban by our moderation team.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prohibitedList.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white transition-colors">
                <div className="flex items-center gap-2 mb-1.5 text-neutral-900 font-semibold text-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <h4>{item.title}</h4>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed pl-4">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Safe Meetup Recommendations</span>
            </div>
            <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
              <li>Always arrange trades in high-traffic, well-lit public spaces (mall lobbies, police exchange safe zones).</li>
              <li>Inspect item condition thoroughly before mutually signing off on the trade in Barterly.</li>
              <li>Never wire cash deposits or share private home address coordinates with strangers.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-500">All submissions are reviewed by automated & human safety filters.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
