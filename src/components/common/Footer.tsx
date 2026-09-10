import React from 'react';
import { ArrowLeftRight, ShieldCheck, Repeat, Heart, HelpCircle, FileText } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export function Footer() {
  const { navigate, setShowProhibitedModal, replayBrandIntro } = useNavigation();

  return (
    <footer className="bg-neutral-900 text-neutral-400 text-sm border-t border-neutral-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Barterly</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Trade What You Have. Get What You Want. A modern, cashless marketplace platform designed for structured item-to-item exchanges.
            </p>
            <div className="pt-2">
              <button
                onClick={replayBrandIntro}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Replay Brand Intro</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/browse')} className="hover:text-white transition-colors cursor-pointer">
                  Browse All Items
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app')} className="hover:text-white transition-colors cursor-pointer">
                  Trader Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/offers')} className="hover:text-white transition-colors cursor-pointer">
                  Offers & Counter-Offers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/app/trades')} className="hover:text-white transition-colors cursor-pointer">
                  Active Trades
                </button>
              </li>
            </ul>
          </div>

          {/* Safety & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-3">Trust & Safety</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/safety')} className="hover:text-white transition-colors cursor-pointer">
                  Safety Guidelines & Exchange Rules
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/prohibited-items')} className="hover:text-white transition-colors cursor-pointer">
                  Prohibited Items Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin')} className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
                  Admin Operations Console
                </button>
              </li>
            </ul>
          </div>

          {/* Technical Note / Client Architecture */}
          <div className="rounded-xl p-4 bg-neutral-800/60 border border-neutral-700/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Client Architecture</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Barterly Frontend Application connected via isolated REST service layer. Ready for integration with backend endpoints (<code className="text-emerald-400 font-mono">/api/v1</code>).
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© 2026 Barterly Inc. All rights reserved.</p>
          <p className="text-[11px]">Built with React, Vite & TypeScript</p>
        </div>
      </div>
    </footer>
  );
}
