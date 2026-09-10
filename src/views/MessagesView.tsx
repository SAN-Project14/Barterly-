import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ShieldAlert, ArrowLeft, ExternalLink, ChevronDown } from 'lucide-react';
import { Conversation, Message } from '../types';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { EmptyState } from '../components/common/EmptyState';

interface MessagesViewProps {
  initialConversationId?: string;
}

export function MessagesView({ initialConversationId }: MessagesViewProps) {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasUnreadBelow, setHasUnreadBelow] = useState<boolean>(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if scroll position is within 90px of bottom
  const checkIsNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom < 90;
  };

  // Scroll only the message list container (never the page/window)
  const scrollToBottom = (smooth = true) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (checkIsNearBottom()) {
      setHasUnreadBelow(false);
    }
  };

  const loadConversations = () => {
    if (!currentUser) return;
    messageService.getUserConversations(currentUser.id).then((convs) => {
      setConversations(convs);
      if (initialConversationId) {
        const found = convs.find(c => c.id === initialConversationId);
        if (found) {
          setActiveConv(found);
          loadMessages(found.id, true);
        }
      } else if (convs.length > 0 && !activeConv) {
        setActiveConv(convs[0]);
        loadMessages(convs[0].id, true);
      }
      setIsLoading(false);
    });
  };

  const loadMessages = (convId: string, isInitialOrForced = false) => {
    const wasNearBottom = checkIsNearBottom();
    messageService.getMessages(convId).then((msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        if (isInitialOrForced || wasNearBottom) {
          scrollToBottom(!isInitialOrForced);
          setHasUnreadBelow(false);
        } else {
          // User is reading earlier messages; preserve position and show pill
          setHasUnreadBelow(true);
        }
      }, 30);
    });
  };

  useEffect(() => {
    loadConversations();
  }, [currentUser, initialConversationId]);

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setHasUnreadBelow(false);
    loadMessages(conv.id, true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !activeConv || !currentUser) return;

    const content = textInput.trim();
    setTextInput('');

    // Keep input focus without triggering window/viewport jump
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }

    await messageService.sendMessage(activeConv.id, currentUser.id, content);
    
    // User explicitly sent a message -> smoothly scroll container to newest message
    messageService.getMessages(activeConv.id).then((msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        scrollToBottom(true);
        setHasUnreadBelow(false);
      }, 40);
    });
    loadConversations();
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-16 text-neutral-900">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          Messages & Barter Coordination
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Chat directly with prospective traders regarding items, specs, and meetup details
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-13rem)] sm:h-[650px] min-h-[480px] max-h-[80vh]">
        {/* Conversations Sidebar */}
        <div className={`lg:col-span-4 border-r border-neutral-200 flex flex-col h-full min-h-0 ${activeConv ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Inbox ({conversations.length})
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100 touch-scroll">
            {conversations.map((conv) => {
              const other = conv.participants.find(p => p.id !== currentUser.id) || conv.participants[0];
              const isSelected = activeConv?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/60' : 'hover:bg-neutral-50'
                  }`}
                >
                  <img
                    src={other?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-neutral-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-neutral-900 truncate">{other?.name || 'User'}</h4>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {conv.listing && (
                      <p className="text-[11px] text-emerald-700 font-medium truncate mt-0.5">
                        Item: {conv.listing.title}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {conv.lastMessage?.text || 'Start conversation...'}
                    </p>
                  </div>
                </div>
              );
            })}

            {conversations.length === 0 && (
              <div className="p-8 text-center text-xs text-neutral-500">
                No active conversations yet. Reach out to item owners from the marketplace to get started.
              </div>
            )}
          </div>
        </div>

        {/* Message Thread Area */}
        <div className={`lg:col-span-8 flex flex-col h-full min-h-0 ${!activeConv ? 'hidden lg:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Thread Header with Item Context */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                    aria-label="Back to conversations list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {(() => {
                    const other = activeConv.participants.find(p => p.id !== currentUser.id);
                    return (
                      <div className="flex items-center gap-2.5">
                        <img
                          src={other?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-neutral-900 leading-none">{other?.name || 'User'}</h3>
                          <span className="text-[11px] text-neutral-500">@{other?.username || 'user'}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {activeConv.listing && (
                  <div
                    onClick={() => navigate('/listing', activeConv.listing!.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:border-emerald-400 text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <img
                      src={activeConv.listing.images[0]}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-md object-cover"
                    />
                    <span className="max-w-[140px] truncate text-neutral-800">{activeConv.listing.title}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Safety Warning Banner */}
              <div className="px-4 py-2 bg-amber-50/70 border-b border-amber-100 text-[11px] text-amber-800 flex items-center gap-2 shrink-0">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Barter Safety: Never send advance cash. Use public designated safe spots for in-person inspection.</span>
              </div>

              {/* Messages Stream */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 relative touch-scroll"
              >
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-neutral-900 text-white rounded-br-xs'
                            : 'bg-neutral-100 text-neutral-900 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Unobtrusive New Messages Below Indicator */}
              {hasUnreadBelow && (
                <div className="px-4 py-1.5 flex justify-center bg-white/80 backdrop-blur-xs border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      scrollToBottom(true);
                      setHasUnreadBelow(false);
                    }}
                    className="px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:bg-black"
                  >
                    <span>New messages below</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-100 flex items-center gap-2 bg-white shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message or discuss barter trade details..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-40 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={MessageSquare}
                title="Select a Conversation"
                description="Choose an existing message thread from the left or contact an item owner on the marketplace."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

