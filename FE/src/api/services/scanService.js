import { apiRequest, unwrap } from '../client';

export const scanService = {
  /**
   * Tải ảnh chụp tủ lạnh hoặc món ăn để AI nhận diện nguyên liệu & độ tươi
   * @param {File|Blob} imageFile - Tệp ảnh JPEG/PNG/WEBP <= 8MB
   */
  uploadScan: async (imageFile) => {
    const formData = new FormData();
    formData.append('Image', imageFile);
    formData.append('image', imageFile);

    const raw = await apiRequest('/scans', {
      method: 'POST',
      body: formData,
      timeout: 90000, // Nhận diện ảnh AI có thể mất 10-30s
    });
    return unwrap(raw);
  },

  /**
   * Người dùng xác nhận hoặc sửa lại danh sách ID nguyên liệu sau khi AI nhận diện
   * @param {number} scanId
   * @param {number[]} ingredientIds
   */
  confirmScan: async (scanId, ingredientIds) => {
    const raw = await apiRequest(`/scans/${scanId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ ingredientIds }),
    });
    return unwrap(raw);
  },

  /**
   * Lấy kết quả quét ảnh theo ID
   */
  getScanById: async (scanId) => {
    const raw = await apiRequest(`/scans/${scanId}`);
    return unwrap(raw);
  },

  /**
   * Lịch sử các lần quét ảnh
   */
  getScanHistory: async (page = 1, pageSize = 10) => {
    const raw = await apiRequest(`/scans?page=${page}&pageSize=${pageSize}`);
    return unwrap(raw);
  },
};

export default scanService;
