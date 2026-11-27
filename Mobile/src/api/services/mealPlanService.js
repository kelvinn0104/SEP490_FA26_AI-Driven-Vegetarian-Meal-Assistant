import { apiRequest, writeJson } from '../client';

export const mealPlanService = {
  getCurrentPlan: signal => apiRequest('/meal-plans/current', { signal }),
  getPlan: (id, signal) => apiRequest('/meal-plans/' + id, { signal }),
  generatePlan: params => writeJson('/meal-plans/ai/generate', params, 'POST', { timeout: 300000 }),
  getHistory: (page, signal, status = '') => apiRequest('/meal-plans?page=' + page + '&pageSize=12' + (status ? '&status=' + status : ''), { signal }),
  activate: id => writeJson('/meal-plans/' + id + '/status', { status: 'active' }, 'PATCH'),
  swap: (id, itemId) => writeJson('/meal-plans/ai/' + id + '/items/' + itemId + '/swap', {}, 'POST', { timeout: 120000 }),
  daily: (date, signal) => apiRequest('/nutrition/daily?date=' + date, { signal }),
  log: planItemId => writeJson('/nutrition/logs', { planItemId }),
  shopping: async id => {
    const path = '/meal-plans/' + id + '/shopping-list';
    try { return await apiRequest(path); }
    catch (error) {
      if (error.status !== 404) throw error;
      return writeJson(path, {});
    }
  },
  buy: (id, itemId, isBought) => writeJson('/meal-plans/' + id + '/shopping-list/items/' + itemId, { isBought }, 'PATCH'),
};
