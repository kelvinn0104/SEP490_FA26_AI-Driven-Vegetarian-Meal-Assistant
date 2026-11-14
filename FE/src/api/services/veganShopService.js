import { apiRequest, unwrap } from '../client';

export const veganShopService = {
  /**
   * Tìm kiếm các quán chay, nhà hàng thuần chay lân cận
   * @param {{ lat?: number, lng?: number, radiusKm?: number, keyword?: string }} params
   */
  getShops: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.lat !== undefined) query.append('lat', params.lat);
    if (params.lng !== undefined) query.append('lng', params.lng);
    if (params.radiusKm) query.append('radiusKm', params.radiusKm);
    if (params.keyword) query.append('keyword', params.keyword);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const raw = await apiRequest(`/vegan-shops${qs}`);
    return unwrap(raw) || [];
  },
};

export default veganShopService;
