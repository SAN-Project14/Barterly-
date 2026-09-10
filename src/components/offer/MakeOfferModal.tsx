import React, { useState, useEffect } from 'react';
import { X, Repeat, Plus, Trash2, CheckCircle2, DollarSign, Package } from 'lucide-react';
import { Listing, OfferItem, ListingCondition } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { listingService } from '../../services/listingService';
import { offerService } from '../../services/offerService';
import { useToast } from '../../context/ToastContext';

interface MakeOfferModalProps {
  targetListing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MakeOfferModal({ targetListing, isOpen, onClose, onSuccess }: MakeOfferModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<OfferItem[]>([]);
  const [showCustomItemForm, setShowCustomItemForm] = useState<boolean>(false);
  const [customItemTitle, setCustomItemTitle] = useState<string>('');
  const [customItemCategory, setCustomItemCategory] = useState<string>('Electronics');
  const [customItemCondition, setCustomItemCondition] = useState<ListingCondition>('like_new');
  const [customItemImage, setCustomItemImage] = useState<string>('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80');
  const [cashAdjustment, setCashAdjustment] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      listingService.getUserListings(currentUser.id).then((items) => {
        // Only active/published items owned by user
        setUserListings(items.filter(i => i.id !== targetListing?.id));
      });
    }
  }, [currentUser, isOpen, targetListing]);

  if (!isOpen || !targetListing || !currentUser) return null;

  const toggleSelectListing = (id: string) => {
    if (selectedListingIds.includes(id)) {
      setSelectedListingIds(selectedListingIds.filter(item => item !== id));
    } else {
      setSelectedListingIds([...selectedListingIds, id]);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItemTitle.trim()) {
      showToast('Validation', 'Please enter an item title', 'warning');
      return;
    }
    const newItem: OfferItem = {
      id: `custom_off_${Date.now()}`,
      title: customItemTitle.trim(),
      category: customItemCategory,
      condition: customItemCondition,
      image: customItemImage,
    };
    setCustomItems([...customItems, newItem]);
    setCustomItemTitle('');
    setShowCustomItemForm(false);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems(customItems.filter(i => i.id !== id));
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map selected inventory items to OfferItems
    const inventoryOfferItems: OfferItem[] = userListings
      .filter(l => selectedListingIds.includes(l.id))
      .map(l => ({
        id: `item_${l.id}`,
        title: l.title,
        category: l.category,
        condition: l.condition,
        image: l.images[0] || '',
        estimatedValue: l.estimatedValue,
        description: l.description,
      }));

    const allOfferedItems = [...inventoryOfferItems, ...customItems];

    if (allOfferedItems.length === 0) {
      showToast('Items Required', 'Please choose at least 1 item to offer for this barter', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await offerService.createOffer({
        listingId: targetListing.id,
        requesterId: currentUser.id,
        offeredItems: allOfferedItems,
        cashAdjustment: cashAdjustment ? Number(cashAdjustment) : 0,
        note: note.trim(),
      });

      showToast(
        'Barter Offer Sent!',
        `Your offer has been submitted to ${targetListing.owner.name}.`,
        'success'
      );
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit offer';
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
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Repeat className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Make Barter Offer</h2>
              <p className="text-xs text-neutral-500">
                To: <span className="font-semibold text-neutral-800">{targetListing.owner.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitOffer} className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* Target Listing Summary Card */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <img
              src={targetListing.images[0]}
              alt={targetListing.title}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-200"
            />
            <div className="min-w-0 flex-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-700">{targetListing.category}</span>
              <h4 className="font-bold text-neutral-900 truncate text-sm">{targetListing.title}</h4>
              <p className="text-neutral-500 truncate mt-0.5">
                Owner wants: <span className="italic font-medium">{targetListing.desiredExchange}</span>
              </p>
            </div>
          </div>

          {/* Section 1: Choose from user's existing inventory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                1. Select Items From Your Listed Inventory
              </label>
              <span className="text-[11px] text-neutral-400">
                {selectedListingIds.length} selected
              </span>
            </div>

            {userListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {userListings.map((l) => {
                  const isSelected = selectedListingIds.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      onClick={() => toggleSelectListing(l.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <img
                        src={l.images[0]}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate">{l.title}</p>
                        <p className="text-[10px] text-neutral-500">{l.condition}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-500">
                You do not have any published items listed yet. You can add an item below or list one first.
              </div>
            )}
          </div>

          {/* Section 2: Quick add unlisted item to offer */}
          <div className="space-y-3 pt-1 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                2. Or Add Another Item to Offer
              </label>
              {!showCustomItemForm && (
                <button
                  type="button"
                  onClick={() => setShowCustomItemForm(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item to Offer</span>
                </button>
              )}
            </div>

            {/* Form for adding an ad-hoc offered item */}
            {showCustomItemForm && (
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-800">New Item Details</h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomItemForm(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Item title (e.g. Sony XM4 Headphones, iPad Mini 6)"
                    value={customItemTitle}
                    onChange={(e) => setCustomItemTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-300 text-xs focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={customItemCondition}
                    onChange={(e) => setCustomItemCondition(e.target.value as ListingCondition)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs cursor-pointer"
                  >
                    <option value="brand_new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Include in Offer
                  </button>
                </div>
              </div>
            )}

            {/* List of custom items */}
            {customItems.length > 0 && (
              <div className="space-y-1.5">
                {customItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-neutral-800">{item.title}</span>
                      <span className="text-neutral-500">({item.condition})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomItem(item.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Cash Adjustment / Sweetener */}
          <div className="pt-1 border-t border-neutral-100">
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Optional Cash Adjustment / Sweetener ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="number"
                placeholder="e.g. 20 (Add cash sweetener to balance the barter)"
                value={cashAdjustment}
                onChange={(e) => setCashAdjustment(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Used strictly for balancing values in fair trades (e.g. +$20 cash with your item).
            </p>
          </div>

          {/* Proposal Note */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Barter Proposal Note
            </label>
            <textarea
              rows={3}
              placeholder="Hi! I noticed your wishlist and have these items in great condition. Would love to trade!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-neutral-600 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Offer...' : 'Send Barter Offer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
