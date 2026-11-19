import { apiRequest, unwrap } from '../client';

export const healthProfileService = {
  getProfile: async () => {
    const raw = await apiRequest('/HealthProfile');
    return unwrap(raw);
  },

  updateProfile: async (data) => {
    const raw = await apiRequest('/HealthProfile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(raw);
  },

  getAllergens: async () => {
    const raw = await apiRequest('/HealthProfile/allergens');
    return unwrap(raw) || [];
  },
};

export default healthProfileService;
