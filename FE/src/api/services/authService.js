import { apiRequest, setAuthToken, setStoredUser, unwrap } from '../client';

export const authService = {
  /**
   * Đăng nhập với email và mật khẩu
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ accessToken: string, user: Object, expiresAt: string }>}
   */
  login: async (email, password) => {
    const raw = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = unwrap(raw);
    
    // Lưu token theo chuẩn guide
    const token = data?.accessToken || data?.token;
    if (token) {
      setAuthToken(token);
    }
    if (data?.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  /**
   * Đăng ký tài khoản người dùng mới
   * @param {{ email: string, password: string, displayName: string }} param0
   */
  register: async ({ email, password, displayName }) => {
    const raw = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        displayName: displayName || email.split('@')[0],
      }),
    });
    const data = unwrap(raw);
    const token = data?.accessToken || data?.token;
    if (token) {
      setAuthToken(token);
    }
    if (data?.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  /**
   * Lấy thông tin tài khoản hiện tại (cần token)
   */
  getMe: async () => {
    const raw = await apiRequest('/auth/me');
    return unwrap(raw);
  },

  /**
   * Cập nhật tên hiển thị
   */
  updateMe: async ({ displayName }) => {
    const raw = await apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    });
    return unwrap(raw);
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async ({ currentPassword, newPassword }) => {
    return await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Đăng xuất & dọn token
   */
  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout server notification ignored:', e);
    } finally {
      setAuthToken(null);
      setStoredUser(null);
    }
  },
};

export default authService;
