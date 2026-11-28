import { apiRequest, writeJson } from '../client';

export const healthProfileService = {
  getProfile: async signal => {
    try {
      return await apiRequest('/health-profile', { signal });
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },
  updateProfile: data => writeJson('/health-profile', data, 'PUT'),
  getAllergens: signal => apiRequest('/allergies', { signal }),
};
