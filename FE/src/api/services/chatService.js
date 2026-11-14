import { apiRequest, unwrap } from '../client';

export const chatService = {
  /**
   * Tạo phiên trò chuyện mới với AI
   * @param {number|null} planId - Gắn ID thực đơn nếu muốn AI tư vấn đổi món thực đơn
   */
  createSession: async (planId = null) => {
    const raw = await apiRequest('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    return unwrap(raw);
  },

  /**
   * Lấy danh sách các phiên trò chuyện
   */
  getSessions: async () => {
    const raw = await apiRequest('/chat/sessions');
    return unwrap(raw) || [];
  },

  /**
   * Lấy lịch sử tin nhắn của phiên chat (từ cũ đến mới)
   */
  getMessages: async (sessionId) => {
    const raw = await apiRequest(`/chat/sessions/${sessionId}/messages`);
    return unwrap(raw) || [];
  },

  /**
   * Gửi tin nhắn đến AI Assistant (Gemini)
   * @param {number} sessionId
   * @param {string} content
   * @returns {Promise<{ userMessage: Object, aiMessage: Object }>}
   */
  sendMessage: async (sessionId, content) => {
    const raw = await apiRequest(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      timeout: 60000, // AI có thể phản hồi từ 5-20s
    });
    return unwrap(raw);
  },

  /**
   * Xóa một phiên chat
   */
  deleteSession: async (sessionId) => {
    return await apiRequest(`/chat/sessions/${sessionId}`, { method: 'DELETE' });
  },
};

export default chatService;
