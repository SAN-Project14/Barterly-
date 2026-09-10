import React, { useState } from 'react';
import { X, ArrowLeftRight, Mail, Lock, User as UserIcon, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register, allPersonas = [], switchPersona } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [city, setCity] = useState<string>('Quezon City');
  const [region, setRegion] = useState<string>('Metro Manila');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [forgotSubmitted, setForgotSubmitted] = useState<boolean>(false);

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Validation', 'Please enter your email address', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch {
      // Toast already shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !username) {
      showToast('Validation', 'Please fill in all required fields', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ name, username, email, password, city, region });
    } catch {
      // Toast already shown
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Validation', 'Please enter your email', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setForgotSubmitted(true);
      showToast('Request Sent', res.message, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending instructions';
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
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-neutral-900">
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 flex items-center justify-center text-emerald-400">
              <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-neutral-900 tracking-tight text-lg">Barterly</span>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-100 px-6 pt-2 bg-neutral-50/50">
          <button
            onClick={() => { openAuthModal('login'); setForgotSubmitted(false); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center ${
              authModalMode === 'login'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { openAuthModal('register'); setForgotSubmitted(false); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center ${
              authModalMode === 'register'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {authModalMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">Password</label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot_password')}
                    className="text-xs text-emerald-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Demo Persona Quick Login Section */}
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 text-center mb-2">
                  Quick Demo Login (Click to Sign In)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(allPersonas || []).filter(p => p.role !== 'admin').slice(0, 4).map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => {
                        switchPersona(persona.id);
                        closeAuthModal();
                      }}
                      className="p-2 rounded-xl border border-neutral-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <img
                        src={persona.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                        alt={persona.name || 'Trader'}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-800 truncate group-hover:text-emerald-800">
                          {persona.name ? persona.name.split(' ')[0] : 'Trader'}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {persona.role === 'admin' ? 'Admin' : 'Trader'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {authModalMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Cruz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/10 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="jordanc"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 text-sm focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Approx. City</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Quezon City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full pl-8 pr-2 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 text-sm focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 text-[11px] text-neutral-500 leading-relaxed">
                By joining Barterly, you agree to trade fairly, use safe public meeting locations, and adhere to our zero-tolerance prohibited items policy.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {authModalMode === 'forgot_password' && (
            <div className="space-y-4">
              {!forgotSubmitted ? (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Enter the email address registered with your Barterly account. We will send you instructions to reset your password.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Password Reset Link'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Reset Email Dispatched</h4>
                  <p className="text-xs text-emerald-700">
                    If an account exists for {email}, you will receive password reset instructions shortly.
                  </p>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-xs text-neutral-500 hover:text-neutral-900 font-medium cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
