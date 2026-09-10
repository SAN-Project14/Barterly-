import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  Bell, 
  MessageSquare, 
  Heart, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Package, 
  Repeat, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { notificationService } from '../../services/notificationService';
import { messageService } from '../../services/messageService';

export function Header() {
  const { currentUser, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { currentRoute, navigate, setShowCreateListing, setShowProhibitedModal, replayBrandIntro } = useNavigation();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      notificationService.getUnreadCount(currentUser.id).then(setUnreadCount).catch(() => {});
      messageService.getConversations(currentUser.id).then((convs) => {
        const unread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadMessages(unread);
      }).catch(() => {});
    }
  }, [currentUser, currentRoute]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/browse', searchQuery.trim());
      setMobileSearchOpen(false);
    } else {
      navigate('/browse');
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              id="header-brand-logo"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-xs">
                <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-neutral-900 leading-none block">
                  Barterly
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
                  Item Marketplace
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/browse')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentRoute === '/browse'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Browse Items
              </button>
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate('/app')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentRoute === '/app'
                        ? 'bg-neutral-100 text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/app/offers')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentRoute === '/app/offers'
                        ? 'bg-neutral-100 text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    Offers & Trades
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Center Search Bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="header-search-input"
                type="text"
                placeholder="Search items to trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-100/90 focus:bg-white text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5" ref={menuRef}>
            {/* Mobile Search Toggle Button */}
            <button
              id="header-mobile-search-btn"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Search"
              aria-label="Search items"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Prohibited items policy link */}
            <button
              id="header-safety-btn"
              onClick={() => setShowProhibitedModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Prohibited Items Policy"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Safety Rules</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* List New Item Button */}
                <button
                  id="header-create-listing-btn"
                  onClick={() => setShowCreateListing(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>List Item</span>
                </button>

                {/* Favorites */}
                <button
                  id="header-favorites-btn"
                  onClick={() => navigate('/app/favorites')}
                  className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Favorites"
                  aria-label="Favorites"
                >
                  <Heart className="w-5 h-5" />
                </button>

                {/* Messages with unread badge */}
                <button
                  id="header-messages-btn"
                  onClick={() => navigate('/app/messages')}
                  className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Messages"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </button>

                {/* Notifications */}
                <button
                  id="header-notifications-btn"
                  onClick={() => navigate('/app/notifications')}
                  className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    id="header-user-menu-btn"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all cursor-pointer"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                      alt={currentUser?.name || 'Account'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-neutral-200"
                    />
                    <span className="hidden lg:inline text-xs font-semibold text-neutral-800 max-w-[100px] truncate">
                      {currentUser?.name ? currentUser.name.split(' ')[0] : 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 text-sm text-neutral-700 animate-in fade-in zoom-in-95 duration-150 z-50">
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-3">
                        <img
                          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                          alt={currentUser?.name || 'User'}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-neutral-900 truncate">{currentUser?.name || 'Barterly Member'}</p>
                          <p className="text-xs text-neutral-500">@{currentUser?.username || 'member'}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-amber-600 font-semibold">★ {currentUser?.rating ?? '5.0'}</span>
                            <span className="text-[10px] text-neutral-400">• {currentUser?.completedTradesCount ?? 0} trades</span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1">
                        <button
                          onClick={() => { navigate('/app'); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-neutral-400" />
                          <span>My Dashboard</span>
                        </button>
                        <button
                          onClick={() => { navigate('/app/listings'); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-neutral-400" />
                          <span>My Listed Items</span>
                        </button>
                        <button
                          onClick={() => { navigate('/app/offers'); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 cursor-pointer"
                        >
                          <Repeat className="w-4 h-4 text-neutral-400" />
                          <span>Offers & Active Trades</span>
                        </button>
                        <button
                          onClick={() => { navigate('/app/profile'); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-neutral-400" />
                          <span>Public Profile</span>
                        </button>
                        <button
                          onClick={() => { navigate('/app/settings'); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-700 cursor-pointer"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                          <span>Account Settings & Security</span>
                        </button>
                      </div>

                      {/* Admin Panel Direct Link (Only for authorized administrators) */}
                      {isAdmin && (
                        <div className="border-t border-neutral-100 py-1">
                          <button
                            onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                            className="w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-2.5 text-neutral-900 font-medium cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            <span>Admin Console</span>
                            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Active
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Replay Brand Intro */}
                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => { replayBrandIntro(); setUserMenuOpen(false); }}
                          className="w-full px-4 py-1.5 text-left hover:bg-neutral-50 text-xs text-neutral-500 flex items-center gap-2 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Replay Brand Intro</span>
                        </button>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 text-xs font-semibold cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Public / Unauthenticated Controls */
              <div className="flex items-center gap-2">
                <button
                  id="header-signin-btn"
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Expanded Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-neutral-100 animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="header-mobile-search-input"
                type="text"
                autoFocus
                placeholder="Search items to trade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-neutral-100 text-sm text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
