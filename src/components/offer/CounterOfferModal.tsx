import React, { useState } from 'react';
import { X, ArrowLeftRight, Plus, Trash2, DollarSign } from 'lucide-react';
import { Offer, OfferItem, ListingCondition } from '../../types';
import { offerService } from '../../services/offerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface CounterOfferModalProps {
  offer: Offer | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CounterOfferModal({ offer, isOpen, onClose, onSuccess }: CounterOfferModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [items, setItems] = useState<OfferItem[]>(offer?.offeredItems || []);
  const [cashAdjustment, setCashAdjustment] = useState<string>(
    offer?.cashAdjustment ? String(offer.cashAdjustment) : '0'
  );
  const [note, setNote] = useState<string>('');
  const [newItemTitle, setNewItemTitle] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !offer || !currentUser) return null;

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleAddNewItem = () => {
    if (!newItemTitle.trim()) return;
    const newItem: OfferItem = {
      id: `counter_item_${Date.now()}`,
      title: newItemTitle.trim(),
      category: 'General Goods',
      condition: 'good',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    };
    setItems([...items, newItem]);
    setNewItemTitle('');
  };

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Validation', 'A counter-offer must include at least one item', 'warning');
      return;
    }
    if (!note.trim()) {
      showToast('Note Required', 'Please explain the reason for your counter-proposal', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await offerService.counterOffer({
        offerId: offer.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        itemsOffered: items,
        cashAdjustment: cashAdjustment ? Number(cashAdjustment) : 0,
        note: note.trim(),
      });

      showToast(
        'Counter-Offer Sent!',
        'Your counter-proposal has been delivered to your trading partner.',
        'success'
      );
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send counter-offer';
      showToast('Error', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 text-neutral-900 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">Send Counter-Proposal</h3>
              <p className="text-xs text-neutral-500">Modify items or terms for "{offer.listing.title}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitCounter} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">
              Proposed Items in this Counter-Offer ({items.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate">{item.title}</p>
                      <p className="text-[10px] text-neutral-500 capitalize">{item.condition.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                    title="Remove from counter offer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add requested extra item */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Request additional item (e.g. 65W charger, carrying case)..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddNewItem}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Cash Adjustment / Sweetener ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                value={cashAdjustment}
                onChange={(e) => setCashAdjustment(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-300 text-sm focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Counter-Offer Note *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Explain why you are countering (e.g. Could you also add a travel charger since my item includes upgraded custom components?)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:border-indigo-500 focus:outline-hidden"
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Sending...' : 'Send Counter Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
