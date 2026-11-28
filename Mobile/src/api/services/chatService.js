import { apiRequest, writeJson } from '../client';

export const chatService = {
  createSession: planId => writeJson('/chat/sessions', planId ? { planId } : {}),
  getSessions: signal => apiRequest('/chat/sessions', { signal }),
  getMessages: (id, signal) => apiRequest('/chat/sessions/' + id + '/messages', { signal }),
  sendMessage: (id, content) => writeJson('/chat/sessions/' + id + '/messages', { content }, 'POST', { timeout: 120000 }),
};
