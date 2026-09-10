import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Key, 
  Smartphone, 
  Laptop, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  Lock,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

interface SettingsViewProps {
  initialTab?: 'profile' | 'security';
}

export function SettingsView({ initialTab = 'profile' }: SettingsViewProps) {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>(initialTab);

  // Profile Form State
  const [name, setName] = useState<string>(currentUser?.name || '');
  const [username, setUsername] = useState<string>(currentUser?.username || '');
  const [bio, setBio] = useState<string>(currentUser?.bio || '');
  const [city, setCity] = useState<string>(currentUser?.location?.city || '');
  const [region, setRegion] = useState<string>(currentUser?.location?.region || '');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [isSendingVerification, setIsSendingVerification] = useState<boolean>(false);

  // Mock Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      device: 'MacBook Pro (Chrome 124)',
      type: 'desktop',
      ip: '112.198.**.** (Metro Manila, PH)',
      isCurrent: true,
      lastActive: 'Active now',
    },
    {
      id: 'sess_2',
      device: 'iPhone 15 (Safari Mobile)',
      type: 'mobile',
      ip: '112.198.**.** (Quezon City, PH)',
      isCurrent: false,
      lastActive: '2 days ago',
    },
  ]);

  // Account Deletion Multi-Step State (Steps 1, 2, 3, 4)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3 | 4>(1);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>('');
  const [deleteReason, setDeleteReason] = useState<string>('');
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      showToast('Validation Error', 'Name and username are required', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        username: username.trim().toLowerCase().replace(/\s+/g, ''),
        bio: bio.trim(),
        location: { city: city.trim(), region: region.trim() },
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Password Error', 'Please enter your current password', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password Error', 'New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Password Error', 'New passwords do not match', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword(currentUser.id, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password Updated', 'Your security password has been changed successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      showToast('Error', msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsSendingVerification(true);
    try {
      await authService.verifyEmail('mock_dev_token');
      showToast('Verification Sent', `A verification link has been sent to ${currentUser.email}`, 'info');
    } catch {
      showToast('Error', 'Unable to send verification email at this time', 'error');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast('Session Revoked', 'The device has been signed out', 'info');
  };

  const handleFinalAccountDeletion = async () => {
    setIsSubmittingDelete(true);
    try {
      await userService.deleteAccount(currentUser.id);
      showToast('Account Deleted', 'Your account deletion request has been processed by the API.', 'info');
      setShowDeleteModal(false);
      logout();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account';
      showToast('Error', msg, 'error');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 text-neutral-900">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          Account Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Manage your public profile, account security, active sessions, and data privacy
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile Information</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'security'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Sessions</span>
        </button>
      </div>

      {/* Tab 1: Profile Settings */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-neutral-100">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-neutral-100 shadow-2xs"
            />
            <div>
              <h3 className="font-bold text-base text-neutral-900">{currentUser.name}</h3>
              <p className="text-xs text-neutral-500">@{currentUser.username} • {currentUser.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                  Rating: {currentUser.rating}★ ({currentUser.completedTradesCount} completed trades)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                placeholder="Your display name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Username (Handle)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                  placeholder="username"
                  required
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Unique public identifier visible to all traders.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Trader Bio & Interests</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                placeholder="Tell other barterers what items you typically collect, craft, or look for..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Approximate City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                    placeholder="e.g. Quezon City"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Region / Province</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                  placeholder="e.g. Metro Manila"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Privacy */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Email Verification State */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-neutral-500" />
                  <h3 className="font-bold text-base text-neutral-900">Email Address Verification</h3>
                </div>
                <p className="text-xs text-neutral-500">
                  Current email: <strong className="text-neutral-800">{currentUser.email}</strong>
                </p>
              </div>

              {currentUser.verifiedEmail ? (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shrink-0">
                  Unverified
                </span>
              )}
            </div>

            {!currentUser.verifiedEmail && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-amber-800">
                  Verified email accounts enjoy elevated credibility badges and higher barter offer response rates.
                </p>
                <button
                  type="button"
                  onClick={handleSendVerificationEmail}
                  disabled={isSendingVerification}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 cursor-pointer transition-colors"
                >
                  {isSendingVerification ? 'Sending...' : 'Send Verification Email'}
                </button>
              </div>
            )}
          </div>

          {/* Password Change Form */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
              <Key className="w-5 h-5 text-neutral-500" />
              <h3 className="font-bold text-base text-neutral-900">Change Password</h3>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isChangingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Active Devices & Sessions */}
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-neutral-500" />
                <h3 className="font-bold text-base text-neutral-900">Active Devices & Sessions</h3>
              </div>
              <span className="text-xs text-neutral-400 font-medium">{sessions.length} registered sessions</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {sessions.map((sess) => (
                <div key={sess.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0">
                      {sess.type === 'desktop' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-neutral-900">{sess.device}</p>
                        {sess.isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500">{sess.ip} • {sess.lastActive}</p>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Deletion Section (Multi-step) */}
          <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-rose-900">Danger Zone: Delete Account</h3>
                <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
                  Permanently delete your trader account, delist all active items, cancel pending offers, and scrub your personal information from the Barterly platform.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(true); setDeleteStep(1); }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200 shadow-2xl p-6 sm:p-8 text-neutral-900 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-5 top-5 p-1 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Stepper Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                <span>Account Deletion Flow</span>
                <span>Step {deleteStep} of 4</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-neutral-100">
                <div className={`h-full ${deleteStep >= 1 ? 'bg-rose-500' : 'bg-neutral-200'}`} />
                <div className={`h-full ${deleteStep >= 2 ? 'bg-rose-500' : 'bg-neutral-200'}`} />
                <div className={`h-full ${deleteStep >= 3 ? 'bg-rose-500' : 'bg-neutral-200'}`} />
                <div className={`h-full ${deleteStep >= 4 ? 'bg-rose-600' : 'bg-neutral-200'}`} />
              </div>
            </div>

            {/* Step 1: Explain Consequences */}
            {deleteStep === 1 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Step 1: Understand What Happens</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Deleting your Barterly account involves irreversible modifications to your trading profile:
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 space-y-2 text-xs text-neutral-700">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>All active and draft listings will be immediately delisted.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Pending barter offers will be automatically cancelled.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Trade history will be anonymized in compliance with platform audits.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>Your username <strong>@{currentUser.username}</strong> will be released.</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Keep Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer"
                  >
                    I Understand, Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Warning & Reason */}
            {deleteStep === 2 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Step 2: Are you sure?</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Please let us know why you are leaving Barterly (optional):
                  </p>
                </div>

                <div className="space-y-2">
                  {[
                    'No longer trading or downsizing items',
                    'Found what I was looking for',
                    'Privacy or data security concerns',
                    'Creating a new account',
                    'Other reason',
                  ].map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        deleteReason === r ? 'border-rose-500 bg-rose-50/30 font-semibold' : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delete_reason"
                        value={r}
                        checked={deleteReason === r}
                        onChange={() => setDeleteReason(r)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Proceed to Step 3
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Text Confirmation */}
            {deleteStep === 3 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900">Step 3: Verification Confirmation</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    To prevent accidental account loss, type <strong className="text-neutral-900 select-all font-mono">DELETE MY ACCOUNT</strong> in the field below:
                  </p>
                </div>

                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 font-mono text-sm focus:border-rose-500 focus:outline-hidden"
                />

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={deleteConfirmationText.trim() !== 'DELETE MY ACCOUNT'}
                    onClick={() => setDeleteStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue to Final Confirmation
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Final Confirmation */}
            {deleteStep === 4 && (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-950">Step 4: Final Irrevocable Authorization</h3>
                  <p className="text-xs text-rose-800/80 mt-1 leading-relaxed">
                    By clicking below, you instruct the Barterly API to dispatch a DELETE request for account <strong>@{currentUser.username}</strong> ({currentUser.email}). This action cannot be reversed.
                  </p>
                </div>

                <div className="pt-4 flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancel, Keep My Account
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingDelete}
                    onClick={handleFinalAccountDeletion}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingDelete ? 'Processing Deletion...' : 'Yes, Delete Account Permanently'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
