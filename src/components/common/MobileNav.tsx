import React, { useState, useEffect } from 'react';
import { Home, Compass, PlusCircle, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { messageService } from '../../services/messageService';

export function MobileNav() {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { currentRoute, navigate, setShowCreateListing } = useNavigation();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      messageService.getConversations(currentUser.id).then((convs) => {
        const unread = convs.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadMessages(unread);
      }).catch(() => {});
    } else {
      setUnreadMessages(0);
    }
  }, [currentUser, currentRoute]);

  const isHomeActive = currentRoute === '/';
  const isBrowseActive = currentRoute === '/browse' || currentRoute === '/listing';
  const isMessagesActive = currentRoute === '/app/messages';
  const isProfileActive = (currentRoute.startsWith('/app') && !isMessagesActive) || currentRoute.startsWith('/admin');

  return (
    <nav 
      id="mobile-bottom-nav" 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-lg px-2 pt-1 safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto h-14">
        {/* Home */}
        <button
          id="mobile-nav-home"
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
            isHomeActive ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* Browse */}
        <button
          id="mobile-nav-browse"
          onClick={() => navigate('/browse')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
            isBrowseActive ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Compass className={`w-5 h-5 ${isBrowseActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Browse</span>
        </button>

        {/* Center Action: List Item */}
        <button
          id="mobile-nav-list-item"
          onClick={() => {
            if (isAuthenticated) {
              setShowCreateListing(true);
            } else {
              openAuthModal('login');
            }
          }}
          className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] cursor-pointer group"
          aria-label="List an Item"
        >
          <div className="w-10 h-10 -mt-3.5 rounded-full bg-emerald-600 group-hover:bg-emerald-700 group-active:scale-95 text-white flex items-center justify-center shadow-md ring-3 ring-white transition-all">
            <PlusCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-bold text-neutral-800 tracking-tight mt-0.5">List</span>
        </button>

        {/* Messages */}
        <button
          id="mobile-nav-messages"
          onClick={() => {
            if (isAuthenticated) {
              navigate('/app/messages');
            } else {
              openAuthModal('login');
            }
          }}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
            isMessagesActive ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${isMessagesActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Messages</span>
        </button>

        {/* Profile / Dashboard */}
        <button
          id="mobile-nav-profile"
          onClick={() => {
            if (isAuthenticated) {
              navigate('/app');
            } else {
              openAuthModal('login');
            }
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors cursor-pointer ${
            isProfileActive ? 'text-emerald-700 font-bold' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
}
