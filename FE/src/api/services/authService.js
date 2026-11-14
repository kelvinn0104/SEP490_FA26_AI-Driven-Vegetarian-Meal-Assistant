import { apiRequest, setAuthToken, setStoredUser, unwrap } from '../client';

export const authService = {
  /**
   * Đăng nhập với email và mật khẩu
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ token: string, user: Object, expiresAt: string }>}
   */
  login: async (email, password) => {
    const raw = await apiRequest('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
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
   * Đăng ký tài khoản người dùng mới (Bước 1: sinh tài khoản pending và gửi mã OTP 6 số qua email)
   * @param {{ email: string, password: string, displayName: string, role?: string }} param0
   * @returns {Promise<{ email: string, status: string, requiresVerification: boolean, codeSent: boolean, expiresInSeconds: number, resendAfterSeconds: number }>}
   */
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

  /**
   * Xác thực mã OTP 6 số (Bước 2: kiểm tra OTP và nhận token đăng nhập chính thức)
   * @param {{ email: string, otpCode: string }} param0
   * @returns {Promise<{ token: string, refreshToken: string, expiresAt: string, user: Object }>}
   */
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
      setAuthToken(token);
    }
    if (data?.user) {
      setStoredUser(data.user);
    }
    return data;
  },

  /**
   * Gửi lại mã OTP qua email (tôn trọng thời gian resendAfterSeconds / countdown)
   * @param {{ email: string }} param0
   */
  resendCode: async ({ email }) => {
    const raw = await apiRequest('/Auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
      }),
    });
    return unwrap(raw);
  },

  /**
   * Lấy thông tin tài khoản hiện tại (cần token)
   */
  getMe: async () => {
    const raw = await apiRequest('/Auth/me');
    return unwrap(raw);
  },

  /**
   * Cập nhật tên hiển thị
   */
  updateMe: async ({ displayName }) => {
    const raw = await apiRequest('/Auth/me', {
      method: 'PUT',
      body: JSON.stringify({ displayName }),
    });
    return unwrap(raw);
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async ({ currentPassword, newPassword }) => {
    return await apiRequest('/Auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Đăng xuất & dọn token
   */
  logout: async () => {
    try {
      await apiRequest('/Auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout server notification ignored:', e);
    } finally {
      setAuthToken(null);
      setStoredUser(null);
    }
  },
};

export default authService;
