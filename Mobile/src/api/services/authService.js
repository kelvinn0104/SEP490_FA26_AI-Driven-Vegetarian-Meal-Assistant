import { apiRequest, writeJson } from '../client';

const guest = { anonymous: true };
export const authService = {
  login: (email, password) => writeJson('/Auth/login', { email, password }, 'POST', guest),
  register: (email, password, displayName) => writeJson('/Auth/register', {
    email, password, displayName, role: 'user',
  }, 'POST', guest),
  verifyCode: (email, otpCode) => writeJson('/Auth/verify-code', { email, otpCode }, 'POST', guest),
  resend: email => writeJson('/Auth/resend-code', { email }, 'POST', guest),
  getMe: () => apiRequest('/Auth/me'),
};
