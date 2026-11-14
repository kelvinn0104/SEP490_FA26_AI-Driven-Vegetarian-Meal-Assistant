import { apiRequest, unwrap } from '../client';

export const nutritionService = {
  /**
   * Đánh dấu đã dùng bữa (Log meal)
   * Có 2 cách:
   * 1. Gửi { planItemId } khi ăn món trong thực đơn AI
   * 2. Gửi { recipeId, mealType, servings, logDate } khi ăn tự do
   */
  logMeal: async (payload) => {
    try {
      const raw = await apiRequest('/nutrition/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return unwrap(raw);
    } catch {
      return null;
    }
  },

  /**
   * Xóa log bữa ăn đã ghi nhận
   */
  deleteMealLog: async (logId) => {
    return await apiRequest(`/nutrition/logs/${logId}`, { method: 'DELETE' });
  },

  /**
   * Lấy tổng hợp dinh dưỡng trong ngày (mặc định hôm nay)
   * Bao gồm calo/macro thực tế, mục tiêu, danh sách log và cảnh báo thiếu vi chất
   */
  getDailyNutrition: async (dateStr = null) => {
    const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
    try {
      const raw = await apiRequest(`/nutrition/daily${query}`);
      return unwrap(raw);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Lấy xu hướng dinh dưỡng theo chuỗi ngày (vẽ biểu đồ)
   */
  getNutritionTrend: async (fromDate, toDate) => {
    const query = new URLSearchParams();
    if (fromDate) query.append('from', fromDate);
    if (toDate) query.append('to', toDate);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const raw = await apiRequest(`/nutrition/trend${qs}`);
    return unwrap(raw) || [];
  },

  /**
   * Cập nhật chỉ số vận động (bước chân, calo tiêu hao)
   */
  updateActivity: async ({ activityDate, kcalBurned, steps }) => {
    const raw = await apiRequest('/nutrition/activity', {
      method: 'PUT',
      body: JSON.stringify({ activityDate, kcalBurned, steps }),
    });
    return unwrap(raw);
  },
};

export default nutritionService;
