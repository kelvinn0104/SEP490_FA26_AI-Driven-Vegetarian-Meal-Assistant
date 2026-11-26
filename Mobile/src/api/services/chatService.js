import { apiRequest, unwrap } from '../client';

export const chatService = {
  createSession: async (planId = null) => {
    const raw = await apiRequest('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
    return unwrap(raw);
  },

  getSessions: async () => {
    const raw = await apiRequest('/chat/sessions');
    return unwrap(raw) || [];
  },

  getMessages: async (sessionId) => {
    const raw = await apiRequest(`/chat/sessions/${sessionId}/messages`);
    return unwrap(raw) || [];
  },

  sendMessage: async (sessionId, content) => {
    const raw = await apiRequest(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      timeout: 60000,
    });
    return unwrap(raw);
  },

  deleteSession: async (sessionId) => {
    return await apiRequest(`/chat/sessions/${sessionId}`, { method: 'DELETE' });
  },
};

export default chatService;
