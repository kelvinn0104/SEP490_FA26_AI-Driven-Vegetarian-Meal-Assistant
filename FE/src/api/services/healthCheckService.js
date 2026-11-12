import { apiRequest, unwrap } from '../client';

// Render free tier ngủ sau ~15 phút không có request; cold start mất 30–60 giây.
// Timeout phải đủ dài, nếu không FE sẽ coi BE "mất kết nối" và bỏ qua toàn bộ việc tải dữ liệu.
const HEALTH_TIMEOUT_MS = 60000;

export const healthCheckService = {
  /**
   * Kiểm tra tình trạng hoạt động của Backend API.
   * `/health` là endpoint công khai (AllowAnonymous) — gọi trước; `/ai/health` là alias dự phòng.
   */
  checkHealth: async () => {
    try {
      const raw = await apiRequest('/health', { timeout: HEALTH_TIMEOUT_MS });
      return unwrap(raw);
    } catch {
      try {
        const raw = await apiRequest('/ai/health', { timeout: 15000 });
        return unwrap(raw);
      } catch {
        return null;
      }
    }
  },
};

export default healthCheckService;
