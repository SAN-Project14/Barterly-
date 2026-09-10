import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Star, 
  Send,
  Truck,
  Building,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Trade, TradeMeeting, TradeStatus } from '../../types';
import { Badge } from '../common/Badge';
import { tradeService } from '../../services/tradeService';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { SAFE_EXCHANGE_SPOTS } from '../../services/mockData';

interface TradeRoomProps {
  trade: Trade;
  onRefresh: () => void;
  onOpenReviewModal: (trade: Trade) => void;
}

export function TradeRoom({ trade, onRefresh, onOpenReviewModal }: TradeRoomProps) {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState<boolean>(false);
  const [meetingMethod, setMeetingMethod] = useState<'in_person' | 'shipping' | 'dropoff_locker'>(
    trade.meeting?.method || 'in_person'
  );
  const [meetingSpot, setMeetingSpot] = useState<string>(
    trade.meeting?.locationName || SAFE_EXCHANGE_SPOTS[0].name
  );
  const [meetingDate, setMeetingDate] = useState<string>(
    trade.meeting?.scheduledDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [meetingNotes, setMeetingNotes] = useState<string>(
    trade.meeting?.notes || ''
  );
  const [isSavingMeeting, setIsSavingMeeting] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [showDisputeForm, setShowDisputeForm] = useState<boolean>(false);

  if (!currentUser) return null;

  const isOwner = currentUser.id === trade.owner?.id;
  const isRequester = currentUser.id === trade.requester?.id;
  const otherUser = isOwner ? trade.requester : trade.owner;

  const myConfirmed = isOwner ? trade.ownerConfirmedReceived : trade.requesterConfirmedReceived;
  const otherConfirmed = isOwner ? trade.requesterConfirmedReceived : trade.ownerConfirmedReceived;

  // Step calculations
  const steps = [
    { label: 'Agreement', active: true, completed: true },
    { 
      label: 'Logistics Set', 
      active: trade.status !== 'cancelled', 
      completed: !!trade.meeting?.scheduledDate 
    },
    { 
      label: 'Inspection', 
      active: trade.status === 'in_progress' || trade.status === 'trade_arranged' || trade.status === 'completed', 
      completed: myConfirmed || otherConfirmed 
    },
    { 
      label: 'Completed', 
      active: trade.status === 'completed', 
      completed: trade.status === 'completed' 
    },
  ];

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeeting(true);
    try {
      await tradeService.updateMeeting({
        tradeId: trade.id,
        meeting: {
          method: meetingMethod,
          locationName: meetingSpot,
          scheduledDate: meetingDate,
          notes: meetingNotes,
        },
        agreedByRole: isOwner ? 'owner' : 'requester',
      });
      showToast('Logistics Updated', 'Exchange location & schedule recorded.', 'success');
      setIsUpdatingMeeting(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating meeting logistics';
      showToast('Error', msg, 'error');
    } finally {
      setIsSavingMeeting(false);
    }
  };

  const handleConfirmVerification = async () => {
    setIsVerifying(true);
    try {
      const updated = await tradeService.confirmReceived(trade.id, currentUser.id);
      if (updated.status === 'completed') {
        showToast(
          'Trade Completed!',
          'Both parties verified their barter exchange. Please leave a review!',
          'success'
        );
        onOpenReviewModal(updated);
      } else {
        showToast(
          'Receipt Confirmed',
          `Awaiting verification from ${otherUser.name}.`,
          'info'
        );
      }
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to confirm receipt';
      showToast('Error', msg, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      await tradeService.openDispute(trade.id, currentUser.id, disputeReason.trim());
      showToast('Dispute Submitted', 'Support team will review this trade room.', 'warning');
      setShowDisputeForm(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to report dispute';
      showToast('Error', msg, 'error');
    }
  };

  const ownerItem = trade.exchangedItems?.fromOwner || trade.listing;
  const requesterItems = trade.exchangedItems?.fromRequester || [];
  const cashAdjustment = trade.exchangedItems?.cashAdjustment;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden text-neutral-900">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 bg-neutral-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Trade Room #{trade.id.substring(0, 8)}
            </span>
            <Badge value={trade.status} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Barter Trade with {otherUser.name}
          </h2>
          <p className="text-xs text-neutral-400">
            Created on {new Date(trade.createdAt).toLocaleDateString()} • Both parties must physically inspect before confirming
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/messages')}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          {trade.status === 'completed' && (
            <button
              onClick={() => onOpenReviewModal(trade)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Leave Review</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Step Progress Bar */}
      <div className="p-4 sm:p-6 bg-neutral-50/70 border-b border-neutral-200/80">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {steps.map((s, idx) => (
            <div key={s.label} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  s.completed
                    ? 'bg-emerald-500'
                    : s.active
                    ? 'bg-neutral-800'
                    : 'bg-neutral-200'
                }`}
              />
              <span
                className={`text-[11px] font-semibold block truncate ${
                  s.completed ? 'text-emerald-700' : s.active ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {idx + 1}. {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Trade Items Manifesto */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Owner's Items */}
          <div className="md:col-span-5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
              <img
                src={trade.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                alt=""
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-neutral-800">{trade.owner?.name || 'Owner'}'s Item</span>
              {trade.ownerConfirmedReceived && (
                <span className="ml-auto text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Received
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <img
                src={ownerItem?.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'}
                alt=""
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-900 truncate">{ownerItem?.title}</p>
                <p className="text-[10px] text-neutral-500 capitalize">{ownerItem?.condition?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Center Arrows */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
            </div>
            {cashAdjustment ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1">
                +${cashAdjustment}
              </span>
            ) : null}
          </div>

          {/* Requester's Items */}
          <div className="md:col-span-5 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
              <img
                src={trade.requester?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                alt=""
                referrerPolicy="no-referrer"
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-neutral-800">{trade.requester?.name || 'Requester'}'s Items</span>
              {trade.requesterConfirmedReceived && (
                <span className="ml-auto text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Received
                </span>
              )}
            </div>

            <div className="space-y-2">
              {requesterItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5">
                  <img
                    src={item.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-lg object-cover border border-neutral-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{item.title}</p>
                    <p className="text-[10px] text-neutral-500 capitalize">{item.condition.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Meeting & Safe Spot Logistics */}
        <div className="p-6 rounded-2xl border border-neutral-200 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Safe Spot & Exchange Logistics</h3>
                <p className="text-xs text-neutral-500">Agree on a monitored public location</p>
              </div>
            </div>

            {trade.status !== 'completed' && trade.status !== 'cancelled' && (
              <button
                onClick={() => setIsUpdatingMeeting(!isUpdatingMeeting)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                {isUpdatingMeeting ? 'Cancel Editing' : 'Edit Logistics'}
              </button>
            )}
          </div>

          {!isUpdatingMeeting ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Method</span>
                <span className="font-bold text-neutral-800 flex items-center gap-1.5 capitalize">
                  {trade.meeting?.method?.replace('_', ' ') || 'In-Person Safe Spot'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Exchange Location</span>
                <span className="font-bold text-neutral-800 truncate block">
                  {trade.meeting?.locationName || 'Location being coordinated'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Date & Notes</span>
                <span className="font-bold text-neutral-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {trade.meeting?.scheduledDate || 'Date TBD'}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveMeeting} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Exchange Method</label>
                  <select
                    value={meetingMethod}
                    onChange={(e) => setMeetingMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                  >
                    <option value="in_person">In-Person Monitored Safe Spot</option>
                    <option value="shipping">Tracked Postal Shipping</option>
                    <option value="dropoff_locker">Public Smart Dropoff Locker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Safe Spot Location</label>
                  <input
                    type="text"
                    value={meetingSpot}
                    onChange={(e) => setMeetingSpot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                    placeholder="e.g. Police Station lobby, Ayala Malls security desk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Instructions / Notes</label>
                  <input
                    type="text"
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs focus:outline-hidden"
                    placeholder="e.g. Bring extra batteries, meet at 2 PM"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdatingMeeting(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMeeting}
                  className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                >
                  {isSavingMeeting ? 'Saving...' : 'Save Logistics'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section: Mutual Verification & Receipt Check */}
        <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Mutual Item Inspection Verification</h3>
            </div>
            {trade.status === 'completed' && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Trade Completed
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed max-w-xl">
            Inspect all items in person prior to confirmation. Once both traders click "Confirm Receipt", this barter transaction is locked and completed permanently.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-neutral-800">
            <div className="space-y-1 text-xs">
              <p className="text-neutral-400">
                Your Status:{' '}
                <strong className={myConfirmed ? 'text-emerald-400' : 'text-amber-400'}>
                  {myConfirmed ? 'Verified & Received' : 'Pending Physical Inspection'}
                </strong>
              </p>
              <p className="text-neutral-400">
                {otherUser.name}'s Status:{' '}
                <strong className={otherConfirmed ? 'text-emerald-400' : 'text-neutral-400'}>
                  {otherConfirmed ? 'Verified & Received' : 'Pending Physical Inspection'}
                </strong>
              </p>
            </div>

            {trade.status !== 'completed' && trade.status !== 'cancelled' && (
              <button
                onClick={handleConfirmVerification}
                disabled={myConfirmed || isVerifying}
                className={`px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                  myConfirmed
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-neutral-950'
                }`}
              >
                {myConfirmed ? '✓ You Confirmed Receipt' : 'Confirm Item Inspection & Receipt'}
              </button>
            )}
          </div>
        </div>

        {/* Dispute Section */}
        {trade.status !== 'completed' && trade.status !== 'cancelled' && (
          <div className="pt-2 flex justify-between items-center text-xs">
            <button
              onClick={() => setShowDisputeForm(!showDisputeForm)}
              className="text-neutral-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer font-medium"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report issue or discrepancy with this trade</span>
            </button>
          </div>
        )}

        {showDisputeForm && (
          <form onSubmit={handleOpenDispute} className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="font-bold text-xs text-rose-900">File Trade Room Dispute</h4>
            <p className="text-[11px] text-rose-700">
              If the other trader failed to appear or items do not match photos, describe the issue for moderator review.
            </p>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain the issue with the items or meetup..."
              className="w-full p-2.5 rounded-xl border border-rose-300 text-xs bg-white text-neutral-900 focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDisputeForm(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Submit Dispute
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
