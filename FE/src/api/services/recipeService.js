import { apiRequest, unwrap } from '../client';

export const recipeService = {
  /**
   * Lấy danh sách công thức có phân trang & bộ lọc
   */
  getRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.keyword) query.append('keyword', params.keyword);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.maxKcal) query.append('maxKcal', params.maxKcal);
    if (params.minProtein) query.append('minProtein', params.minProtein);
    if (params.excludeMyAllergens !== undefined) query.append('excludeMyAllergens', params.excludeMyAllergens);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const raw = await apiRequest(`/recipes${qs}`);
    return unwrap(raw);
  },

  /**
   * Lấy chi tiết công thức kèm định lượng & bước nấu
   */
  getRecipeById: async (id) => {
    const raw = await apiRequest(`/recipes/${id}`);
    return unwrap(raw);
  },

  /**
   * Gợi ý món ăn theo danh sách ID nguyên liệu có sẵn
   * @param {number[]} ingredientIds
   * @param {number} take
   */
  suggestRecipes: async (ingredientIds = [], take = 10) => {
    const query = new URLSearchParams();
    ingredientIds.forEach(id => query.append('ingredientIds', id));
    if (take) query.append('take', take);

    const raw = await apiRequest(`/recipes/suggest?${query.toString()}`);
    return unwrap(raw) || [];
  },

  /**
   * Lấy danh sách món ăn đã yêu thích
   */
  getFavorites: async (page = 1, pageSize = 20) => {
    const raw = await apiRequest(`/recipes/favorites?page=${page}&pageSize=${pageSize}`);
    return unwrap(raw);
  },

  /**
   * Thêm vào mục yêu thích
   */
  addFavorite: async (recipeId) => {
    return await apiRequest(`/recipes/${recipeId}/favorite`, { method: 'POST' });
  },

  /**
   * Xóa khỏi mục yêu thích
   */
  removeFavorite: async (recipeId) => {
    return await apiRequest(`/recipes/${recipeId}/favorite`, { method: 'DELETE' });
  },

  /**
   * Lấy danh mục món ăn (Public)
   */
  getCategories: async (type = 'recipe') => {
    const raw = await apiRequest(`/categories?type=${encodeURIComponent(type)}`);
    return unwrap(raw) || [];
  },
};

export default recipeService;
