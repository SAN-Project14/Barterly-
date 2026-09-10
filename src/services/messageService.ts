import { Conversation, Message } from '../types';
import { mockStorage } from './storage';
import { apiClient } from './apiClient';

export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Conversation[]>(`/conversations?userId=${userId}`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.conversations.filter(c => c.participants.some(p => p.id === userId));
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.getConversations(userId);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`);
      return res.data || [];
    }

    const state = mockStorage.getState();
    return state.messages[conversationId] || [];
  },

  async sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
    if (!apiClient.isMockMode) {
      const res = await apiClient.post<Message>(`/conversations/${conversationId}/messages`, { senderId, text });
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to send message');
      return res.data;
    }

    const state = mockStorage.getState();
    const sender = state.users.find(u => u.id === senderId);
    const conv = state.conversations.find(c => c.id === conversationId);

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const recipient = conv?.participants.find(p => p.id !== senderId);

    mockStorage.updateState(prev => {
      const existingMsgs = prev.messages[conversationId] || [];
      const updatedMessages = {
        ...prev.messages,
        [conversationId]: [...existingMsgs, newMessage],
      };

      const conversations = prev.conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMessage,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      const notifications = recipient && sender ? [
        {
          id: `notif_${Date.now()}`,
          userId: recipient.id,
          type: 'new_message' as const,
          title: `New message from ${sender.name}`,
          message: text.length > 50 ? `${text.slice(0, 50)}...` : text,
          linkRoute: 'messages',
          linkId: conversationId,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...prev.notifications
      ] : prev.notifications;

      return {
        messages: updatedMessages,
        conversations,
        notifications,
      };
    });

    return newMessage;
  },

  async startOrGetConversation(userId: string, targetUserId: string, listingId?: string): Promise<Conversation> {
    const state = mockStorage.getState();
    const existing = state.conversations.find(c => 
      c.participants.some(p => p.id === userId) &&
      c.participants.some(p => p.id === targetUserId) &&
      (!listingId || c.listingId === listingId)
    );

    if (existing) return existing;

    const user1 = state.users.find(u => u.id === userId);
    const user2 = state.users.find(u => u.id === targetUserId);
    const listing = listingId ? state.listings.find(l => l.id === listingId) : undefined;

    if (!user1 || !user2) throw new Error('Participants not found');

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participants: [user1, user2],
      listingId,
      listing,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    mockStorage.updateState(prev => ({
      conversations: [newConv, ...prev.conversations],
      messages: {
        ...prev.messages,
        [newConv.id]: [],
      }
    }));

    return newConv;
  }
};
