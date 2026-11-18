import { apiRequest, unwrap } from '../client';

export const recipeService = {
  getRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    const searchTerm = params.search || params.keyword;
    if (searchTerm) {
      query.append('search', searchTerm);
      query.append('keyword', searchTerm);
    }
    if (params.status) query.append('status', params.status);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.maxKcal) query.append('maxKcal', params.maxKcal);
    if (params.minProtein) query.append('minProtein', params.minProtein);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.pageSize) query.append('pageSize', params.pageSize);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const raw = await apiRequest(`/recipes${qs}`);
    return unwrap(raw);
  },

  getRecipeById: async (id) => {
    const raw = await apiRequest(`/recipes/${id}`);
    return unwrap(raw);
  },

  suggestRecipes: async (ingredientIds = [], take = 10) => {
    const query = new URLSearchParams();
    ingredientIds.forEach(id => query.append('ingredientIds', id));
    if (take) query.append('take', take);

    const raw = await apiRequest(`/recipes/suggest?${query.toString()}`);
    return unwrap(raw) || [];
  },

  getFavorites: async (page = 1, pageSize = 20) => {
    try {
      const raw = await apiRequest(`/recipes/favorites?page=${page}&pageSize=${pageSize}`);
      return unwrap(raw) || [];
    } catch {
      return [];
    }
  },

  addFavorite: async (recipeId) => {
    try {
      return await apiRequest(`/recipes/${recipeId}/favorite`, { method: 'POST' });
    } catch {
      return null;
    }
  },

  removeFavorite: async (recipeId) => {
    try {
      return await apiRequest(`/recipes/${recipeId}/favorite`, { method: 'DELETE' });
    } catch {
      return null;
    }
  },
};

export default recipeService;
