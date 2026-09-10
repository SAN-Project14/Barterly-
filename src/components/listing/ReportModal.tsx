import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Listing, ReportReason, User } from '../../types';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetListing?: Listing | null;
  targetUser?: User | null;
}

export function ReportModal({ isOpen, onClose, targetListing, targetUser }: ReportModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState<ReportReason>('suspicious');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || (!targetListing && !targetUser)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      showToast('Details Required', 'Please provide an explanation for this report.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitReport({
        reporterId: currentUser?.id || 'anonymous_reporter',
        reporterName: currentUser?.name || 'Anonymous User',
        targetType: targetListing ? 'listing' : 'user',
        targetId: targetListing ? targetListing.id : targetUser!.id,
        targetTitle: targetListing ? targetListing.title : `User @${targetUser!.username}`,
        reason,
        details: details.trim(),
      });

      showToast(
        'Report Submitted',
        'Thank you for keeping Barterly safe. Our moderation team will investigate promptly.',
        'success'
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      showToast('Error', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 text-neutral-900 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 text-rose-600">
            <Flag className="w-5 h-5" />
            <h3 className="font-bold text-base text-neutral-900">
              Report {targetListing ? 'Listing' : 'User'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
            Reporting:{' '}
            <strong className="text-neutral-900">
              {targetListing ? targetListing.title : `@${targetUser?.username}`}
            </strong>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Reason for Report</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value="suspicious">Suspicious Activity / Potential Scam</option>
              <option value="fake_item">Fake, Counterfeit, or Replica Item</option>
              <option value="prohibited_item">Prohibited Good (Weapons, Drugs, etc.)</option>
              <option value="inappropriate">Inappropriate, Offensive, or Adult Content</option>
              <option value="harassment">Harassment or Threatening Behavior</option>
              <option value="spam">Spam or Irrelevant Listing</option>
              <option value="other">Other Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Description & Evidence</label>
            <textarea
              required
              rows={4}
              placeholder="Please explain what is wrong with this listing or user. Include any specific quotes or observations..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-3 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Reports are handled confidentially by Barterly Trust & Safety. The reported party is not told who filed the report.
          </p>

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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
