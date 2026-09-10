import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Repeat, 
  ArrowLeftRight, 
  CheckCircle2, 
  MessageSquare, 
  ShieldAlert, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { Notification, NotificationType } from '../types';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export function NotificationsView() {
  const { currentUser } = useAuth();
  const { navigate } = useNavigation();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = () => {
    if (!currentUser) return;
    setIsLoading(true);
    notificationService.getUserNotifications(currentUser.id).then((items) => {
      setNotifications(items);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(currentUser.id);
    showToast('Notifications Cleared', 'All notifications marked as read', 'info');
    fetchNotifications();
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.id);
    }
    if (notif.linkRoute) {
      navigate(`/app/${notif.linkRoute}`);
    } else if (notif.type.includes('offer')) {
      navigate('/app/offers');
    } else if (notif.type.includes('trade')) {
      navigate('/app/trades');
    } else if (notif.type.includes('message')) {
      navigate('/app/messages');
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_offer':
      case 'offer_countered':
        return <Repeat className="w-5 h-5 text-emerald-600" />;
      case 'offer_accepted':
      case 'trade_completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'trade_updated':
        return <ArrowLeftRight className="w-5 h-5 text-indigo-600" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 text-neutral-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
            Activity & Notifications
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time updates regarding your barter proposals, trade room schedules, and messages
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                !notif.isRead
                  ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                  : 'bg-white border-neutral-200/80 hover:bg-neutral-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900">{notif.title}</h4>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are all caught up! New trade updates and offer events will appear here."
        />
      )}
    </div>
  );
}
