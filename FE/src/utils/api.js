import { API_BASE_URL, apiRequest, unwrap } from '../api/client';
import { scanService } from '../api/services/scanService';
import { chatService } from '../api/services/chatService';
import { mealPlanService } from '../api/services/mealPlanService';
import { healthCheckService } from '../api/services/healthCheckService';

/**
 * Kiểm tra trạng thái máy chủ AI
 */
export async function fetchHealth() {
  return await healthCheckService.checkHealth();
}

/**
 * Lập thực đơn tuần thông qua AI máy chủ Render
 * @param {Object} params
 */
export async function generateMealPlan(params = {}) {
  return await mealPlanService.generatePlan(params);
}

/**
 * Nhận diện nguyên liệu qua YOLOv8/Gemini trên máy chủ
 * @param {File} imageFile
 */
export async function detectIngredients(imageFile) {
  if (!imageFile) return null;
  return await scanService.uploadScan(imageFile);
}

/**
 * Trò chuyện trực tiếp cùng Chuyên gia Dinh dưỡng AI (Gemini Live)
 * @param {string} query
 * @param {number|null} sessionId
 */
export async function askChatbot(query, sessionId = null) {
  let sid = sessionId;
  if (!sid) {
    const session = await chatService.createSession();
    sid = session?.id;
  }
  if (!sid) throw new Error('Không thể khởi tạo phiên trò chuyện với AI.');
  const res = await chatService.sendMessage(sid, query);
  return res;
}

/**
 * Lấy danh sách kiểm duyệt bài viết cho Moderator/Admin
 */
export async function fetchPendingModeration() {
  const res = await apiRequest('/Moderation/pending');
  return unwrap(res) || [];
}
