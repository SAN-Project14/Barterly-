import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, MapPin, Repeat, ShieldCheck, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Listing, ListingCondition, ListingStatus } from '../../types';
import { CATEGORIES } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { listingService } from '../../services/listingService';
import { useToast } from '../../context/ToastContext';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  initialListing?: Listing | null;
}

const SAMPLE_IMAGE_PRESETS = [
  { label: 'Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Mirrorless Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80' },
  { label: 'Vinyl Turntable', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80' },
  { label: 'Leather Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Stratocaster Guitar', url: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Watch Horology', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80' },
  { label: 'Audio Mixer', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80' },
];

export function CreateListingModal({ isOpen, onClose, onCreated, initialListing }: CreateListingModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Electronics');
  const [condition, setCondition] = useState<ListingCondition>('like_new');
  const [conditionDetails, setConditionDetails] = useState<string>('');
  const [city, setCity] = useState<string>(currentUser?.location?.city || 'Quezon City');
  const [region, setRegion] = useState<string>(currentUser?.location?.region || 'Metro Manila');
  const [desiredExchange, setDesiredExchange] = useState<string>('');
  const [estimatedValue, setEstimatedValue] = useState<string>('');
  const [images, setImages] = useState<string[]>([SAMPLE_IMAGE_PRESETS[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [agreedToPolicy, setAgreedToPolicy] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialListing) {
        setTitle(initialListing.title || '');
        setDescription(initialListing.description || '');
        setCategory(initialListing.category || 'Electronics');
        setCondition(initialListing.condition || 'like_new');
        setConditionDetails(initialListing.conditionDetails || '');
        setCity(initialListing.location?.city || currentUser?.location?.city || 'Quezon City');
        setRegion(initialListing.location?.region || currentUser?.location?.region || 'Metro Manila');
        setDesiredExchange(initialListing.desiredExchange || '');
        setEstimatedValue(initialListing.estimatedValue !== undefined ? String(initialListing.estimatedValue) : '');
        setImages(initialListing.images && initialListing.images.length > 0 ? initialListing.images : [SAMPLE_IMAGE_PRESETS[0].url]);
        setAgreedToPolicy(true);
      } else {
        setTitle('');
        setDescription('');
        setCategory('Electronics');
        setCondition('like_new');
        setConditionDetails('');
        setCity(currentUser?.location?.city || 'Quezon City');
        setRegion(currentUser?.location?.region || 'Metro Manila');
        setDesiredExchange('');
        setEstimatedValue('');
        setImages([SAMPLE_IMAGE_PRESETS[0].url]);
        setAgreedToPolicy(false);
      }
    }
  }, [isOpen, initialListing, currentUser]);

  if (!isOpen) return null;

  const handleAddPreset = (url: string) => {
    if (!images.includes(url) && images.length < 5) {
      setImages([...images, url]);
    }
  };

  const handleAddCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl.trim() && images.length < 5) {
      setImages([...images, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (status: ListingStatus) => {
    if (!currentUser) {
      showToast('Authentication', 'You must be signed in to manage listings', 'warning');
      return;
    }
    if (!title.trim() || !description.trim() || !desiredExchange.trim()) {
      showToast('Validation Error', 'Please complete title, description, and desired exchange', 'warning');
      return;
    }
    if (images.length === 0) {
      showToast('Images Required', 'Please add at least one item photo', 'warning');
      return;
    }
    if (!agreedToPolicy && status === 'published') {
      showToast('Policy Agreement', 'Please confirm that your item is not prohibited', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialListing) {
        // Enforce ownership verification
        if (initialListing.ownerId !== currentUser.id) {
          showToast('Authorization Error', 'You can only edit your own listings', 'error');
          return;
        }

        await listingService.updateListing(initialListing.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          condition,
          conditionDetails: conditionDetails.trim() || undefined,
          location: { city, region },
          images,
          desiredExchange: desiredExchange.trim(),
          estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
          status,
        });

        showToast(
          'Listing Updated!',
          `"${title}" changes have been saved.`,
          'success'
        );
      } else {
        await listingService.createListing({
          title: title.trim(),
          description: description.trim(),
          category,
          condition,
          conditionDetails: conditionDetails.trim() || undefined,
          location: { city, region },
          images,
          ownerId: currentUser.id,
          owner: currentUser,
          desiredExchange: desiredExchange.trim(),
          estimatedValue: estimatedValue ? Number(estimatedValue) : undefined,
          status,
        });

        showToast(
          status === 'published' ? 'Listing Published!' : 'Draft Saved!',
          `"${title}" is now available in your inventory.`,
          'success'
        );
      }

      onCreated?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving listing';
      showToast('Submission Failed', msg, 'error');
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
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {initialListing ? 'Edit Barter Listing' : 'List an Item for Barter'}
            </h2>
            <p className="text-xs text-neutral-500">
              {initialListing
                ? 'Update your item specifications, condition notes, or desired trade items'
                : 'Provide accurate details and specify what you want in exchange'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Listing Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fujifilm X-T30 Camera Body or Custom Keyboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ListingCondition)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="brand_new">Brand New (Sealed in box)</option>
                <option value="like_new">Like New (Mint, barely used)</option>
                <option value="good">Good (Light signs of normal use)</option>
                <option value="fair">Fair (Fully functional, cosmetic wear)</option>
              </select>
            </div>
          </div>

          {/* Condition Details */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Condition & Flaw Details</label>
            <input
              type="text"
              placeholder="e.g. 2 months old, tiny hairline scratch on baseplate, includes original box"
              value={conditionDetails}
              onChange={(e) => setConditionDetails(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Images Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-700">Item Photos ({images.length}/5) *</label>
              <span className="text-[11px] text-neutral-400">Click presets below or enter image URL</span>
            </div>

            {/* Selected Images Grid */}
            <div className="flex flex-wrap gap-2.5 items-center">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 group">
                  <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-neutral-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-neutral-900/70 text-[9px] font-bold text-white text-center py-0.5">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Preset quick picker */}
            <div className="pt-1">
              <span className="text-[11px] font-medium text-neutral-500 block mb-1.5">Quick photo presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddPreset(preset.url)}
                    className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-neutral-700 transition-colors cursor-pointer"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="Or paste an image URL (https://...)"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddCustomImage}
                disabled={!customImageUrl.trim() || images.length >= 5}
                className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Add Photo
              </button>
            </div>
          </div>

          {/* Desired Exchange (Crucial) */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Repeat className="w-4 h-4 text-emerald-600" />
              <span>What do you want in exchange? *</span>
            </div>
            <textarea
              required
              rows={2}
              placeholder="e.g. Looking for Sony WH-1000XM4 headphones, an Apple iPad Mini, or espresso gear."
              value={desiredExchange}
              onChange={(e) => setDesiredExchange(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-emerald-300 text-sm text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Item Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Detail the features, accessories included, history, or reasons for trading..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Location & Estimated Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Approximate City Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Estimated Value ($ USD, Optional)</label>
              <input
                type="number"
                placeholder="e.g. 250"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Prohibited items safety checkbox */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs flex items-start gap-3">
            <input
              id="policy-agreement"
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-md border-neutral-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="policy-agreement" className="text-neutral-600 leading-relaxed cursor-pointer">
              I certify that this item does not violate the Barterly Prohibited Items Policy (no weapons, counterfeit goods, hazardous chemicals, controlled medications, or stolen devices).
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Save as Draft
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : initialListing ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
