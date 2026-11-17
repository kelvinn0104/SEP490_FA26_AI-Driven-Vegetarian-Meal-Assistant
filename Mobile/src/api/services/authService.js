import { apiRequest, setAuthToken, setStoredUser, unwrap } from '../client';

export const authService = {
  login: async (email, password) => {
    const raw = await apiRequest('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = unwrap(raw);
    const token = data?.accessToken || data?.token;
    if (token) {
      await setAuthToken(token);
    }
    if (data?.user) {
      await setStoredUser(data.user);
    }
    return data;
  },

  register: async ({ email, password, displayName, role = 'user' }) => {
    const raw = await apiRequest('/Auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        displayName: (displayName || email.split('@')[0]).trim(),
        role: role || 'user',
      }),
    });
    return unwrap(raw);
  },

  verifyCode: async ({ email, otpCode }) => {
    const raw = await apiRequest('/Auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        otpCode: String(otpCode).trim(),
      }),
    });
    const data = unwrap(raw);
    const token = data?.accessToken || data?.token;
    if (token) {
      await setAuthToken(token);
    }
    if (data?.user) {
      await setStoredUser(data.user);
    }
    return data;
  },

  getMe: async () => {
    const raw = await apiRequest('/Auth/me');
    const user = unwrap(raw);
    if (user) {
      await setStoredUser(user);
    }
    return user;
  },
};

export default authService;
