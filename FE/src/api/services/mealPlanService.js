import { apiRequest, unwrap } from '../client';

export const mealPlanService = {
  /**
   * Lấy thực đơn đang hoạt động (active) cho hôm nay/tuần này.
   * Trả về null nếu backend trả 204 No Content.
   */
  getCurrentPlan: async () => {
    try {
      const raw = await apiRequest('/meal-plans/current');
      return unwrap(raw);
    } catch (err) {
      if (err.status === 204 || err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Tạo thực đơn tự động bằng AI (Gemini hoặc rule-based)
   * @param {{ startDate?: string, days?: number, mealTypes?: string[], preferredIngredientIds?: number[], scanId?: number, note?: string, healthGoal?: string }} params
   */
  generatePlan: async (params = {}) => {
    try {
      // Endpoint chuẩn từ controller BE: [Route("api/meal-plans/ai")] -> [HttpPost("generate")]
      // AI Gemini tính toán 21 bữa ăn 7 ngày + thẩm định vi chất có thể mất 60-90s, set timeout 180s để chống rớt kết nối
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

  /**
   * Đổi món thông minh bằng AI
   * @param {number} planId
   * @param {number} itemId
   * @param {string} reason
   */
  swapMeal: async (planId, itemId, reason = 'Muốn đổi món khác phù hợp hơn') => {
    try {
      const raw = await apiRequest(`/meal-plans/ai/${planId}/items/${itemId}/swap`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        timeout: 90000,
      });
      return unwrap(raw);
    } catch (err) {
      if (err.status === 404) {
        const fallbackRaw = await apiRequest(`/meal-plans/${planId}/items/${itemId}/swap`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
          timeout: 90000,
        });
        return unwrap(fallbackRaw);
      }
      throw err;
    }
  },

  /**
   * Lấy danh sách các thực đơn của người dùng
   */
  getMealPlans: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const raw = await apiRequest(`/meal-plans${qs}`);
    return unwrap(raw);
  },

  /**
   * Lấy chi tiết thực đơn theo ID
   */
  getMealPlanById: async (planId) => {
    const raw = await apiRequest(`/meal-plans/${planId}`);
    return unwrap(raw);
  },

  /**
   * Kích hoạt hoặc thay đổi trạng thái thực đơn (draft | active | completed | cancelled)
   */
  updatePlanStatus: async (planId, status = 'active') => {
    const raw = await apiRequest(`/meal-plans/${planId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return unwrap(raw);
  },

  /**
   * Xóa thực đơn
   */
  deleteMealPlan: async (planId) => {
    return await apiRequest(`/meal-plans/${planId}`, { method: 'DELETE' });
  },

  // ================= DANH SÁCH ĐI CHỢ =================
  /**
   * Tạo hoặc làm mới danh sách đi chợ từ thực đơn tuần
   */
  createShoppingList: async (planId) => {
    const raw = await apiRequest(`/meal-plans/${planId}/shopping-list`, {
      method: 'POST',
    });
    return unwrap(raw);
  },

  /**
   * Lấy danh sách đi chợ của thực đơn
   */
  getShoppingList: async (planId) => {
    try {
      const raw = await apiRequest(`/meal-plans/${planId}/shopping-list`);
      return unwrap(raw);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Tích chọn đã mua nguyên liệu
   */
  toggleShoppingItem: async (planId, itemId, isBought = true) => {
    const raw = await apiRequest(`/meal-plans/${planId}/shopping-list/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isBought }),
    });
    return unwrap(raw);
  },
};

export default mealPlanService;
