import { apiRequest } from '../client';

export const recipeService = {
  getRecipes: signal => apiRequest('/recipes', { signal }),
  getRecipeById: (id, signal) => apiRequest('/recipes/' + encodeURIComponent(id), { signal }),
  getFavorites: (page, signal) => apiRequest('/recipes/favorites?page=' + page + '&pageSize=20', { signal }),
  favorite: (id, saved) => apiRequest('/recipes/' + encodeURIComponent(id) + '/favorite', { method: saved ? 'POST' : 'DELETE' }),
};
