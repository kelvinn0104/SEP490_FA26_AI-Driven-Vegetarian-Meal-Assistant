import { apiRequest, writeJson } from '../client';

export const scanService = {
  uploadScan: asset => {
    const formData = new FormData();
    formData.append('Image', {
      uri: asset.uri,
      name: asset.fileName || 'nguyen-lieu.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
    return apiRequest('/scans', { method: 'POST', body: formData, timeout: 120000 });
  },
  confirmScan: (id, ingredientIds) => writeJson('/scans/' + id + '/confirm', { ingredientIds }),
  getScanById: (id, signal) => apiRequest('/scans/' + id, { signal }),
  getScanHistory: (page, signal) => apiRequest('/scans?page=' + page + '&pageSize=12', { signal }),
};
