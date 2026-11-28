import { create } from 'zustand';
import { restoreSession, saveSession, restoreVerification, saveVerification, setSessionExpiredHandler } from '../api/client';
import { authService } from '../api/services/authService';

const isUser = user => user?.role?.toLowerCase() === 'user';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  notice: '',
  pendingVerification: null,
  rememberVerification: (email, response = {}) => {
    const deadline = seconds => typeof seconds === 'number' ? Date.now() + seconds * 1000 : null;
    const next = { email, expiresAt: deadline(response.expiresInSeconds), resendAt: deadline(response.resendAfterSeconds) };
    set({ pendingVerification: next });
    saveVerification(next).catch(() => {});
  },
  initAuth: async () => {
    try {
      const pending = await restoreVerification().catch(() => null);
      if (typeof pending?.email === 'string') set({ pendingVerification: pending });
      const saved = await restoreSession();
      if (!saved?.token) return;
      if (!isUser(saved.user)) {
        await saveSession(null);
        return;
      }
      set({ token: saved.token, user: saved.user, isLoading: false });
      try {
        const user = await authService.getMe();
        if (get().token !== saved.token) return;
        if (!isUser(user)) {
          await get().logout();
          return;
        }
        await saveSession({ token: saved.token, user });
        if (get().token === saved.token) set({ user });
      } catch (error) {
        if (get().token === saved.token && [401, 403].includes(error.status)) {
          await get().logout('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
    } catch {
      await saveSession(null).catch(() => {});
    } finally {
      set({ isLoading: false });
    }
  },
  loginSuccess: async data => {
    const token = data?.accessToken || data?.token;
    if (!token || !data?.user) throw new Error('Chưa nhận được phiên đăng nhập.');
    if (!isUser(data.user)) throw new Error('Ứng dụng chỉ hỗ trợ tài khoản người dùng.');
    await saveSession({ token, user: data.user });
    await saveVerification(null).catch(() => {});
    set({ token, user: data.user, notice: '', pendingVerification: null });
  },
  updateUser: partial => {
    const { user, token } = get();
    if (!token) return;
    set({ user: { ...user, ...partial } });
  },
  logout: async (notice = '') => {
    set({ user: null, token: null, notice });
    await saveSession(null);
  },
}));

setSessionExpiredHandler(() => {
  useAuthStore.getState().logout('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.').catch(() => {});
});
