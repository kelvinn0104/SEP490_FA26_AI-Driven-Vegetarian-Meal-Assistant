import { apiRequest, unwrap } from '../client';

export const notificationService = {
  /**
   * Lấy danh sách thông báo hệ thống
   */
  getNotifications: async (unreadOnly = false, page = 1, pageSize = 20) => {
    const raw = await apiRequest(`/notifications?unreadOnly=${unreadOnly}&page=${page}&pageSize=${pageSize}`);
    return unwrap(raw);
  },

  /**
   * Lấy số lượng thông báo chưa đọc (cho icon chuông Navbar)
   */
  getUnreadCount: async () => {
    try {
      const raw = await apiRequest('/notifications/unread-count');
      const val = unwrap(raw);
      return typeof val === 'number' ? val : (val?.count ?? 0);
    } catch {
      return 0;
    }
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead: async (notificationId) => {
    return await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async () => {
    return await apiRequest('/notifications/read-all', { method: 'PATCH' });
  },
};

export default notificationService;
