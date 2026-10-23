import { apiRequest, unwrap } from '../client';

export const healthCheckService = {
  /**
   * Kiểm tra tình trạng hoạt động của Backend API
   */
  checkHealth: async () => {
    try {
      const raw = await apiRequest('/ai/health', { timeout: 4000 });
      return unwrap(raw);
    } catch {
      try {
        const raw = await apiRequest('/health', { timeout: 2000 });
        return unwrap(raw);
      } catch (err) {
        return null;
      }
    }
  },
};

export default healthCheckService;
