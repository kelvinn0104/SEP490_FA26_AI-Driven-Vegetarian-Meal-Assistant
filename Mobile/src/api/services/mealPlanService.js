import { apiRequest, unwrap } from '../client';

export const mealPlanService = {
  getCurrentPlan: async () => {
    try {
      const raw = await apiRequest('/meal-plans/current');
      return unwrap(raw);
    } catch (err) {
      if (err.status === 204 || err.status === 404) return null;
      throw err;
    }
  },

  generatePlan: async (params = {}) => {
    try {
      const raw = await apiRequest('/meal-plans/ai/generate', {
        method: 'POST',
        body: JSON.stringify(params),
        timeout: 180000,
      });
      return unwrap(raw);
    } catch (err) {
      if (err.status === 404) {
        const fallbackRaw = await apiRequest('/meal-plans/generate', {
          method: 'POST',
          body: JSON.stringify(params),
          timeout: 180000,
        });
        return unwrap(fallbackRaw);
      }
      throw err;
    }
  },

  getHistory: async (page = 1, pageSize = 10) => {
    try {
      const raw = await apiRequest(`/meal-plans/history?page=${page}&pageSize=${pageSize}`);
      return unwrap(raw) || [];
    } catch {
      return [];
    }
  },

  markItemCompleted: async (planId, itemId, completed = true) => {
    try {
      const raw = await apiRequest(`/meal-plans/${planId}/items/${itemId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ completed }),
      });
      return unwrap(raw);
    } catch {
      return null;
    }
  },
};

export default mealPlanService;
