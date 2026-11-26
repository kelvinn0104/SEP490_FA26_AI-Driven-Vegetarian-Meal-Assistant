import { create } from 'zustand';
import { getStoredUser, setStoredUser, setAuthToken, clearAuth, getAuthToken } from '../api/client';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  initAuth: async () => {
    try {
      const [token, user] = await Promise.all([getAuthToken(), getStoredUser()]);
      set({ token, user, isLoading: false });
    } catch {
      set({ token: null, user: null, isLoading: false });
    }
  },

  loginSuccess: async (token, user) => {
    await Promise.all([setAuthToken(token), setStoredUser(user)]);
    set({ token, user });
  },

  updateUser: async (partialUser) => {
    const updated = { ...get().user, ...partialUser };
    await setStoredUser(updated);
    set({ user: updated });
  },

  logout: async () => {
    await clearAuth();
    set({ user: null, token: null });
  },
}));
