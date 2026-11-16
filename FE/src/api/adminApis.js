import { apiRequest, unwrap } from './client';
import { authService } from './services/authService';

export const authApi = authService;

export const usersApi = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.diet && params.diet !== 'all') query.append('diet', params.diet);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.status && params.status !== 'all') query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/users${queryString}`);
    return unwrap(res) || [];
  },

  getUserById: async (id) => {
    const res = await apiRequest(`/users/${id}`);
    return unwrap(res);
  },

  createUser: async (userData) => {
    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return unwrap(res);
  },

  lockUser: async (id) => {
    const res = await apiRequest(`/users/${id}/lock`, { method: 'PUT' });
    return unwrap(res);
  },

  unlockUser: async (id) => {
    const res = await apiRequest(`/users/${id}/unlock`, { method: 'PUT' });
    return unwrap(res);
  },

  updateUserRole: async (id, role) => {
    const res = await apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return unwrap(res);
  },

  deleteUser: async (id) => {
    const res = await apiRequest(`/users/${id}`, { method: 'DELETE' });
    return unwrap(res);
  },
};

export const rolesApi = {
  getRoles: async () => {
    const res = await apiRequest('/roles');
    return unwrap(res) || [];
  },

  getPermissions: async () => {
    const res = await apiRequest('/roles/permissions');
    return unwrap(res) || [];
  },

  saveRole: async (roleData, id = null) => {
    const endpoint = id ? `/roles/${id}` : '/roles';
    const method = id ? 'PUT' : 'POST';
    const res = await apiRequest(endpoint, {
      method,
      body: JSON.stringify({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
      }),
    });
    return unwrap(res);
  },
};

export const logsApi = {
  getSystemLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/logs${qs}`);
    return unwrap(res) || [];
  },

  createLog: async (logData) => {
    const res = await apiRequest('/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
    return unwrap(res);
  },
};

export const aiApi = {
  getHealth: async () => {
    const res = await apiRequest('/ai/health');
    return unwrap(res);
  },

  getModels: async () => {
    const res = await apiRequest('/ai/models');
    return unwrap(res) || [];
  },

  updateModelStatus: async (id, status) => {
    const res = await apiRequest(`/ai/models/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return unwrap(res);
  },

  getTelemetry: async () => {
    const res = await apiRequest('/ai/telemetry');
    return unwrap(res) || [];
  },

  parseNutrition: async (recipeText) => {
    const res = await apiRequest('/ai/recipe/parse-macros', {
      method: 'POST',
      body: JSON.stringify({ recipeText }),
    });
    return unwrap(res);
  },
};

export const dashboardApi = {
  getStats: async () => {
    const res = await apiRequest('/dashboard/stats');
    return unwrap(res);
  },

  getDietDistribution: async () => {
    const res = await apiRequest('/dashboard/diet-distribution');
    return unwrap(res) || [];
  },

  getCharts: async () => {
    const res = await apiRequest('/dashboard/charts');
    return unwrap(res) || [];
  },

  getActivities: async () => {
    const res = await apiRequest('/dashboard/activities');
    return unwrap(res) || [];
  },
};

export const categoriesApi = {
  getCategories: async (type = null) => {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    const res = await apiRequest(`/categories${qs}`);
    return unwrap(res) || [];
  },

  createCategory: async (categoryData) => {
    const res = await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return unwrap(res);
  },

  updateCategory: async (id, categoryData) => {
    const res = await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return unwrap(res);
  },

  deleteCategory: async (id) => {
    const res = await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    return unwrap(res);
  },
};

export const moderationApi = {
  getPending: async (type = null) => {
    const qs = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
    const res = await apiRequest(`/moderation/pending${qs}`);
    return unwrap(res) || [];
  },

  getPendingCount: async () => {
    const res = await apiRequest('/moderation/count');
    return unwrap(res) ?? 0;
  },

  approve: async (id, reason = 'Nội dung đạt chuẩn thuần chay và dinh dưỡng.') => {
    const res = await apiRequest(`/moderation/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'approved', reason }),
    });
    return unwrap(res);
  },

  reject: async (id, reason = 'Nội dung vi phạm tiêu chuẩn cộng đồng.') => {
    const res = await apiRequest(`/moderation/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'rejected', reason }),
    });
    return unwrap(res);
  },

  requestRevision: async (id, reason = 'Vui lòng bổ sung đầy đủ thông tin định lượng.') => {
    const res = await apiRequest(`/moderation/${id}/revision`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'revision', reason }),
    });
    return unwrap(res);
  },
};

export const recipesApi = {
  getRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/recipes${qs}`);
    return unwrap(res) || [];
  },

  getRecipeById: async (id) => {
    const res = await apiRequest(`/recipes/${id}`);
    return unwrap(res);
  },

  createRecipe: async (recipeData) => {
    const res = await apiRequest('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
    return unwrap(res);
  },

  updateStatus: async (id, status) => {
    const res = await apiRequest(`/recipes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return unwrap(res);
  },

  deleteRecipe: async (id) => {
    const res = await apiRequest(`/recipes/${id}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },
};

export const productScansApi = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/productscans${qs}`);
    return unwrap(res) || [];
  },

  getStats: async () => {
    const res = await apiRequest('/productscans/stats');
    return unwrap(res);
  },

  getProductById: async (id) => {
    const res = await apiRequest(`/productscans/${id}`);
    return unwrap(res);
  },

  createProduct: async (data) => {
    const res = await apiRequest('/productscans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  updateProduct: async (id, data) => {
    const res = await apiRequest(`/productscans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  deleteProduct: async (id) => {
    const res = await apiRequest(`/productscans/${id}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },

  reviewProduct: async (id, data) => {
    const res = await apiRequest(`/productscans/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },
};

export const ingredientsApi = {
  getIngredients: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.allergyId && params.allergyId !== 'all') query.append('allergyId', params.allergyId);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/ingredients${qs}`);
    return unwrap(res) || [];
  },

  getIngredientById: async (id) => {
    const res = await apiRequest(`/ingredients/${id}`);
    return unwrap(res);
  },

  createIngredient: async (data) => {
    const res = await apiRequest('/ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  updateIngredient: async (id, data) => {
    const res = await apiRequest(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  deleteIngredient: async (id) => {
    const res = await apiRequest(`/ingredients/${id}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },

  getAllergies: async () => {
    const res = await apiRequest('/ingredients/allergies');
    return unwrap(res) || [];
  },

  getNutrientStandards: async () => {
    const res = await apiRequest('/ingredients/standards');
    return unwrap(res) || [];
  },
};

export const feedbacksApi = {
  getFeedbacks: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/feedbacks${qs}`);
    return unwrap(res) || [];
  },

  getStats: async () => {
    const res = await apiRequest('/feedbacks/stats');
    return unwrap(res);
  },

  resolveFeedback: async (id, data, feedbackType = 'report') => {
    const res = await apiRequest(`/feedbacks/${id}/resolve?feedbackType=${feedbackType}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  createReport: async (data) => {
    const res = await apiRequest('/feedbacks/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  submitAiFeedback: async (data) => {
    const res = await apiRequest('/feedbacks/ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },
};

export const challengesApi = {
  getChallenges: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'all') query.append('difficulty', params.difficulty);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/challenges${qs}`);
    return unwrap(res) || [];
  },

  getStats: async () => {
    const res = await apiRequest('/challenges/stats');
    return unwrap(res);
  },

  getChallengeById: async (id) => {
    const res = await apiRequest(`/challenges/${id}`);
    return unwrap(res);
  },

  createChallenge: async (data) => {
    const res = await apiRequest('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  updateChallenge: async (id, data) => {
    const res = await apiRequest(`/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  deleteChallenge: async (id) => {
    const res = await apiRequest(`/challenges/${id}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },

  getCheckinsQueue: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.challengeId) query.append('challengeId', params.challengeId);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/challenges/checkins${qs}`);
    return unwrap(res) || [];
  },

  reviewCheckin: async (id, data) => {
    const res = await apiRequest(`/challenges/checkins/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },
};

export const analyticsApi = {
  getOverview: async () => {
    const res = await apiRequest('/nutritionanalytics/overview');
    return unwrap(res);
  },

  getDeficits: async () => {
    const res = await apiRequest('/nutritionanalytics/deficits');
    return unwrap(res) || [];
  },

  getTrends: async () => {
    const res = await apiRequest('/nutritionanalytics/trends');
    return unwrap(res) || [];
  },
};

export const broadcastsApi = {
  getBroadcasts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/broadcasts${qs}`);
    return unwrap(res) || [];
  },

  getStats: async () => {
    const res = await apiRequest('/broadcasts/stats');
    return unwrap(res);
  },

  createBroadcast: async (data) => {
    const res = await apiRequest('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  updateBroadcast: async (id, data) => {
    const res = await apiRequest(`/broadcasts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  deleteBroadcast: async (id) => {
    const res = await apiRequest(`/broadcasts/${id}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },

  sendNow: async (id) => {
    const res = await apiRequest(`/broadcasts/${id}/send-now`, {
      method: 'POST',
    });
    return unwrap(res);
  },
};

export const rewardsApi = {
  getRewards: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/rewards${qs}`);
    return unwrap(res) || [];
  },

  getStats: async () => {
    const res = await apiRequest('/rewards/stats');
    return unwrap(res);
  },

  createReward: async (data) => {
    const res = await apiRequest('/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  updateReward: async (id, data) => {
    const res = await apiRequest(`/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },

  deleteReward: async (id) => {
    const res = await apiRequest(`/rewards/${id}`, {
      method: 'DELETE',
    });
    return unwrap(res);
  },

  getClaims: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/rewards/claims${qs}`);
    return unwrap(res) || [];
  },

  processClaim: async (id, data) => {
    const res = await apiRequest(`/rewards/claims/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap(res);
  },
};
