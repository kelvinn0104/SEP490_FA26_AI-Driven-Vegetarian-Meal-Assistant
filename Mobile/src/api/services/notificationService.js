import { apiRequest } from '../client';

export const notificationService = {
  getNotifications: (page = 1, unreadOnly = false, signal) =>
    apiRequest(`/notifications?unreadOnly=${unreadOnly}&page=${page}&pageSize=20`, { signal }),
  getUnreadCount: async signal => {
    try {
      const res = await apiRequest('/notifications/unread-count', { signal });
      return typeof res === 'number' ? res : Number(res?.count) || 0;
    } catch {
      return 0;
    }
  },
  markRead: id => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' }),
};
