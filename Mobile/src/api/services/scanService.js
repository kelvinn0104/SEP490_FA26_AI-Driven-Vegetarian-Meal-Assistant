import { apiRequest, unwrap } from '../client';

export const scanService = {
  /**
   * Upload ảnh chụp tủ lạnh hoặc nguyên liệu từ camera điện thoại
   * @param {{ uri: string, name?: string, type?: string }} imageFile
   */
  uploadScan: async (imageFile) => {
    const formData = new FormData();
    
    // React Native FormData format
    formData.append('Image', {
      uri: imageFile.uri,
      name: imageFile.name || 'scan_ingredient.jpg',
      type: imageFile.type || 'image/jpeg',
    });

    const raw = await apiRequest('/scans', {
      method: 'POST',
      body: formData,
      timeout: 120000,
    });
    return unwrap(raw);
  },

  confirmScan: async (scanId, ingredientIds) => {
    const raw = await apiRequest(`/scans/${scanId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ ingredientIds }),
    });
    return unwrap(raw);
  },

  getScanById: async (scanId) => {
    const raw = await apiRequest(`/scans/${scanId}`);
    return unwrap(raw);
  },

  getScanHistory: async (page = 1, pageSize = 10) => {
    const raw = await apiRequest(`/scans?page.Page=${page}&page.PageSize=${pageSize}`);
    return unwrap(raw);
  },
};

export default scanService;
