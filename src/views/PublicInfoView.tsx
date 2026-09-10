import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Lock, 
  Eye, 
  Ban, 
  Scale, 
  ArrowLeft,
  Mail,
  Key
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { SAFE_EXCHANGE_SPOTS, PROHIBITED_ITEM_CATEGORIES } from '../mocks/mockData';

export type PublicPageType = 
  | 'safety' 
  | 'terms' 
  | 'privacy' 
  | 'prohibited-items' 
  | 'login' 
  | 'register' 
  | 'forgot-password' 
  | 'reset-password' 
  | 'verify-email';

interface PublicInfoViewProps {
  page: PublicPageType;
}

export function PublicInfoView({ page }: PublicInfoViewProps) {
  const { navigate } = useNavigation();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  // Auth form states
  const [email, setEmail] = useState<string>('alex.rivera@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [city, setCity] = useState<string>('Quezon City');
  const [region, setRegion] = useState<string>('Metro Manila');
  const [resetToken, setResetToken] = useState<string>('token_demo_xyz');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/app');
    } catch (err: unknown) {
      // Toast already shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({ name, username, email, city, region, password });
      navigate('/app');
    } catch (err: unknown) {
      // Toast already shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authService.requestPasswordReset(email);
      setMessage(res.message);
      showToast('Link Dispatched', res.message, 'info');
    } catch (err: unknown) {
      showToast('Error', err instanceof Error ? err.message : 'Failed to request reset', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(resetToken, newPassword);
      setMessage(res.message);
      showToast('Password Reset', 'You can now sign in with your new password.', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: unknown) {
      showToast('Error', err instanceof Error ? err.message : 'Reset failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsSubmitting(true);
    try {
      const res = await authService.verifyEmail('token_demo_verify');
      setMessage(res.message);
      showToast('Verified', 'Email address has been confirmed.', 'success');
    } catch (err: unknown) {
      showToast('Error', err instanceof Error ? err.message : 'Verification failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 text-neutral-900">
      {/* Back to Browse / Marketplace button */}
      <div>
        <button
          onClick={() => navigate('/browse')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* 1. SAFETY GUIDELINES */}
      {page === 'safety' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Barterly Trust & Community Safety</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              Safety Guidelines & Exchange Rules
            </h1>
            <p className="text-sm text-neutral-500">
              Best practices for secure, fair, and positive in-person item bartering
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Meet in Public Safe Spots</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Always schedule trades at well-lit public venues such as police station lobbies, busy shopping mall security desks, or transit centers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-neutral-900">Inspect Before Finalizing</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Power on electronics, examine serial numbers, and inspect garments thoroughly before performing the physical trade checkoff in the app.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-neutral-900">No Cash or Bank Transfers</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Barterly is purely an item-for-item exchange marketplace. Anyone requesting wire transfers or gift cards should be reported immediately.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 space-y-4">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Recommended Safe Exchange Locations</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Verified police stations and public security desks with active CCTV monitoring:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {SAFE_EXCHANGE_SPOTS.map((spot) => (
                <div key={spot.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-neutral-900">{spot.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase">
                      {spot.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">{spot.address}</p>
                  <p className="text-[10px] text-neutral-400">Available: {spot.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROHIBITED ITEMS POLICY */}
      {page === 'prohibited-items' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <Ban className="w-4 h-4" />
              <span>Marketplace Compliance</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              Prohibited Items Policy
            </h1>
            <p className="text-sm text-neutral-500">
              Items strictly banned from being listed, traded, or offered on Barterly
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Zero Tolerance Policy</strong>
              <span>
                Attempting to barter or offer any items listed below results in immediate listing delisting and account suspension or permanent banning. We collaborate with law enforcement where applicable.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROHIBITED_ITEM_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-sm text-neutral-900">{cat.name}</h3>
                </div>
                <ul className="space-y-1 text-xs text-neutral-600">
                  {cat.examples.map((ex, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TERMS OF SERVICE */}
      {page === 'terms' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-500 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Legal Agreements</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              Terms of Service
            </h1>
            <p className="text-sm text-neutral-500">
              Last updated: September 2026 • Barterly Platform Terms
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6 text-xs text-neutral-700 leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">1. Nature of the Service</h3>
              <p>
                Barterly is a technology platform connecting individuals who wish to engage in direct barter (item-for-item exchange). Barterly does not own, manufacture, store, or physically inspect items listed by users. Users enter into trades independently at their own discretion.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">2. User Representations & Item Ownership</h3>
              <p>
                By publishing a listing, you represent that you are the lawful owner of the item with the legal right to transfer ownership free and clear of liens or encumbrances. You agree that descriptions, conditions, and photos accurately represent the physical item.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">3. Physical Inspection & Trade Checkoff</h3>
              <p>
                Both participants are required to perform a physical inspection prior to completing a trade checkoff in the app. Once both parties confirm completion, ownership transfer is deemed executed. Disputes must be filed within 48 hours of meeting time if disparities arise.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">4. Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by applicable law, Barterly and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from user trades, meetings, or transactions.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* 4. PRIVACY POLICY */}
      {page === 'privacy' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-500 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Data Protection</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              Privacy Policy
            </h1>
            <p className="text-sm text-neutral-500">
              How Barterly collects, secures, and handles trader information
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6 text-xs text-neutral-700 leading-relaxed">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">1. Information We Collect</h3>
              <p>
                We collect your name, username, email address, approximate general location (city/region only; precise street coordinates are never published), listed item descriptions, photos, and messages exchanged through the platform chat service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">2. Location Privacy</h3>
              <p>
                Your exact residence or GPS location is never required or disclosed. Listings display approximate municipal areas (e.g., "Quezon City, Metro Manila") to assist in regional barter discovery while safeguarding personal privacy.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">3. Account Deletion & Right to be Forgotten</h3>
              <p>
                You may request permanent account deletion via Account Settings at any time. Upon deletion, your personal data is expunged or anonymized from active operational databases in accordance with regulatory record-keeping rules.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* 5. LOGIN FORM */}
      {page === 'login' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Sign in to Barterly</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Connect to manage your listings, barter offers, and active trades
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
            <span>Don't have an account? </span>
            <button
              onClick={() => navigate('/register')}
              className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Create an account
            </button>
          </div>
        </div>
      )}

      {/* 6. REGISTER FORM */}
      {page === 'register' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Join Barterly</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Create your account and start trading items in your community
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Username (@handle)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jordanlee"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Quezon City"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Metro Manila"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <p className="text-[11px] text-neutral-400">
              By creating an account, you agree to the{' '}
              <button type="button" onClick={() => navigate('/terms')} className="text-emerald-600 underline">Terms</button>
              {' '}and{' '}
              <button type="button" onClick={() => navigate('/safety')} className="text-emerald-600 underline">Safety Rules</button>.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Trader Account'}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-100 text-center text-xs text-neutral-500">
            <span>Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {/* 7. FORGOT PASSWORD */}
      {page === 'forgot-password' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Reset Password</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Enter your email to receive a password reset authorization token
            </p>
          </div>

          {message ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <p className="font-bold">{message}</p>
              <button
                onClick={() => navigate('/reset-password')}
                className="text-emerald-700 underline font-semibold"
              >
                Proceed to enter token & new password
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Registered Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Dispatching...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-neutral-100 text-center text-xs">
            <button
              onClick={() => navigate('/login')}
              className="text-neutral-500 hover:text-neutral-800 font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* 8. RESET PASSWORD */}
      {page === 'reset-password' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-neutral-900">Set New Password</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Provide your reset token and enter your new password
            </p>
          </div>

          {message ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <p className="font-bold">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="text-emerald-700 underline font-semibold"
              >
                Sign in with new credentials
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Reset Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 font-mono text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 9. VERIFY EMAIL */}
      {page === 'verify-email' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-2xs p-6 sm:p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-neutral-900">Email Verification</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Verify your email address to unlock verified trader badges
            </p>
          </div>

          {message ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-3">
              <p className="font-bold">{message}</p>
              <button
                onClick={() => navigate('/app')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600">
                Click below to complete verification with your authentication token:
              </p>
              <button
                onClick={handleVerifyEmail}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Verify My Email'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
