import { apiRequest, unwrap } from '../client';

export const healthProfileService = {
  /**
   * Lấy hồ sơ sức khỏe người dùng (404 nếu chưa có)
   */
  getHealthProfile: async () => {
    try {
      const raw = await apiRequest('/health-profile');
      return unwrap(raw);
    } catch (err) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  /**
   * Tạo mới hoặc cập nhật hồ sơ sức khỏe
   * @param {{ gender: string, dateOfBirth: string, heightCm: number, weightKg: number, activityLevel: string, healthGoal: string, allergyIds?: number[] }} data
   */
  updateHealthProfile: async (data) => {
    const raw = await apiRequest('/health-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(raw);
  },

  /**
   * Tính toán trước nhu cầu dinh dưỡng/ngày theo chỉ số (không lưu vào DB)
   */
  previewHealthProfile: async (data) => {
    const raw = await apiRequest('/health-profile/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(raw);
  },

  /**
   * Lấy danh sách dị ứng của người dùng hiện tại
   */
  getUserAllergies: async () => {
    const raw = await apiRequest('/health-profile/allergies');
    return unwrap(raw) || [];
  },

  /**
   * Cập nhật danh sách ID dị ứng của người dùng
   * @param {number[]} allergyIds
   */
  updateUserAllergies: async (allergyIds) => {
    const raw = await apiRequest('/health-profile/allergies', {
      method: 'PUT',
      body: JSON.stringify({ allergyIds }),
    });
    return unwrap(raw) || [];
  },

  /**
   * Lấy danh mục tất cả dị ứng trong hệ thống (Public)
   */
  getAllAllergies: async () => {
    const raw = await apiRequest('/allergies');
    return unwrap(raw) || [];
  },
};

export default healthProfileService;
