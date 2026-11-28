/**
 * Admin & Mod APIs for VeggieAI Management Portal
 * Synchronized from VeggieAIv3 with support for all Management Features & Endpoints
 */
import { apiRequest, setAuthToken, setStoredUser, clearAuthStorage, getAuthToken, API_BASE_URL } from './client';

export const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const r = String(rawRole).trim().toLowerCase();
  if (['superadmin', 'super_admin', 'super admin', 'admin', 'role-1'].includes(r)) {
    return 'SuperAdmin';
  }
  if (['mod', 'moderator', 'role-2', 'chuyên gia dinh dưỡng', 'điều phối viên'].includes(r)) {
    return 'Mod';
  }
  return 'User';
};

export const getRoleDisplayLabel = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'SuperAdmin') return 'Super Admin';
  if (normalized === 'Mod') return 'Điều phối viên (Mod)';
  return 'Người dùng';
};

export const isJwtExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// ================= AUTH API =================
export const authApi = {
  login: async (email, password, portalOnly = true) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, portalOnly }),
    });
    if (res?.data?.token && res?.data?.user) {
      const normalizedUser = {
        ...res.data.user,
        role: normalizeRole(res.data.user.role),
      };
      setAuthToken(res.data.token);
      setStoredUser(normalizedUser);
      return { ...res.data, user: normalizedUser };
    }
    return res?.data;
  },

  register: async ({ name, email, password, role = 'Mod', inviteCode = '' }) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        displayName: name,
        email,
        password,
        role,
        inviteCode,
      }),
    });
    if (res?.data?.token && res?.data?.user) {
      const normalizedUser = {
        ...res.data.user,
        role: normalizeRole(res.data.user.role),
      };
      setAuthToken(res.data.token);
      setStoredUser(normalizedUser);
      return { ...res.data, user: normalizedUser };
    }
    return res?.data;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      clearAuthStorage();
    }
  },

  getMe: async () => {
    const res = await apiRequest('/auth/me');
    if (res?.data) {
      const normalizedUser = {
        ...res.data,
        role: normalizeRole(res.data.role),
      };
      setStoredUser(normalizedUser);
      return normalizedUser;
    }
    return null;
  },
};

// ================= USERS & MOD MANAGEMENT API =================
export const usersApi = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.diet && params.diet !== 'all') query.append('diet', params.diet);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/users${qs}`);
    return res?.data || [];
  },

  getUserById: async (id) => {
    const res = await apiRequest(`/users/${id}`);
    return res?.data;
  },

  createUser: async (userData) => {
    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res?.data;
  },

  lockUser: async (id, reason = '') => {
    const res = await apiRequest(`/users/${id}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return res?.data;
  },

  unlockUser: async (id) => {
    const res = await apiRequest(`/users/${id}/unlock`, { method: 'PUT' });
    return res?.data;
  },

  updateUserRole: async (id, role) => {
    const res = await apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return res?.data;
  },

  deleteUser: async (id) => {
    const res = await apiRequest(`/users/${id}`, { method: 'DELETE' });
    return res?.data;
  },
};

// ================= ROLES & PERMISSIONS API =================
export const rolesApi = {
  getRoles: async () => {
    const res = await apiRequest('/roles');
    return res?.data || [];
  },

  getPermissions: async () => {
    const res = await apiRequest('/roles/permissions');
    return res?.data || [];
  },

  getMyPermissions: async () => {
    const res = await apiRequest('/roles/my-permissions');
    return res?.data || [];
  },

  saveRole: async (roleData, id) => {
    if (!id) {
      throw new Error('Chỉ cho phép cập nhật ma trận quyền của các vai trò hệ thống hiện có.');
    }
    const res = await apiRequest(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
    return res?.data;
  },

  deleteRole: async (id) => {
    const res = await apiRequest(`/roles/${id}`, { method: 'DELETE' });
    return res?.data;
  },
};

// ================= SYSTEM SETTINGS API =================
export const settingsApi = {
  getSettings: async (search = '') => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await apiRequest(`/system-settings${qs}`);
    return res?.data || [];
  },

  saveSetting: async (data) => {
    const res = await apiRequest('/system-settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteSetting: async (key) => {
    const res = await apiRequest(`/system-settings/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    return res?.data;
  },
};

// ================= SYSTEM LOGS API =================
export const logsApi = {
  getSystemLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/logs${qs}`);
    return res?.data || [];
  },

  createSystemLog: async (logData) => {
    const res = await apiRequest('/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
    return res?.data;
  },
};

// ================= AI MONITORING & ANALYSIS API =================
export const aiApi = {
  getHealth: async () => {
    const res = await apiRequest('/ai/health');
    return res?.data;
  },

  getModels: async () => {
    const res = await apiRequest('/ai/models');
    return res?.data || [];
  },

  updateModelStatus: async (id, status) => {
    const res = await apiRequest(`/ai/models/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res?.data;
  },

  getTelemetry: async (limit = 30) => {
    const res = await apiRequest(`/ai/telemetry?limit=${limit}`);
    return res?.data || [];
  },

  parseNutrition: async (recipeText) => {
    const res = await apiRequest('/ai/recipe/parse-macros', {
      method: 'POST',
      body: JSON.stringify({ recipeText }),
      timeoutMs: 20000,
    });
    return res?.data;
  },
};

// ================= DASHBOARD API =================
export const dashboardApi = {
  getStats: async () => {
    const res = await apiRequest('/dashboard/stats');
    return res?.data;
  },

  getDietDistribution: async () => {
    const res = await apiRequest('/dashboard/diet-distribution');
    return res?.data || [];
  },

  getCharts: async (days = 7) => {
    const res = await apiRequest(`/dashboard/charts?days=${days}`);
    return res?.data || [];
  },

  getActivities: async () => {
    const res = await apiRequest('/dashboard/activities');
    return res?.data || [];
  },
};

// ================= CATEGORIES API =================
export const categoriesApi = {
  getCategories: async (type) => {
    const qs = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
    const res = await apiRequest(`/categories${qs}`);
    return res?.data || [];
  },

  createCategory: async (data) => {
    const res = await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateCategory: async (id, data) => {
    const res = await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteCategory: async (id) => {
    const res = await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    return res?.data;
  },
};

// ================= MODERATION API =================
export const moderationApi = {
  getPending: async (type) => {
    const qs = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
    const res = await apiRequest(`/moderation/pending${qs}`);
    return res?.data || [];
  },

  getHistory: async (limit = 30) => {
    const res = await apiRequest(`/moderation/history?limit=${limit}`);
    return res?.data || [];
  },

  getPendingCount: async () => {
    const res = await apiRequest('/moderation/count');
    return res?.data ?? 0;
  },

  approve: async (id, reason = '') => {
    const res = await apiRequest(`/moderation/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'approved', reason }),
    });
    return res?.data;
  },

  reject: async (id, reason = '') => {
    const res = await apiRequest(`/moderation/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'rejected', reason }),
    });
    return res?.data;
  },

  requestRevision: async (id, reason = '') => {
    const res = await apiRequest(`/moderation/${id}/revision`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'revision', reason }),
    });
    return res?.data;
  },
};

// ================= RECIPES API =================
export const recipesApi = {
  getRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/recipes${qs}`);
    return res?.data || [];
  },

  getRecipeById: async (id) => {
    const res = await apiRequest(`/recipes/${id}`);
    return res?.data;
  },

  createRecipe: async (data) => {
    const res = await apiRequest('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateRecipe: async (id, data) => {
    const res = await apiRequest(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateStatus: async (id, status) => {
    const res = await apiRequest(`/recipes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res?.data;
  },

  deleteRecipe: async (id) => {
    const res = await apiRequest(`/recipes/${id}`, { method: 'DELETE' });
    return res?.data;
  },
};

// ================= INGREDIENTS & NUTRITION API =================
export const ingredientsApi = {
  getIngredients: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.allergyId && params.allergyId !== 'all') query.append('allergyId', params.allergyId);
    if (params.sortBy && params.sortBy !== 'default') query.append('sortBy', params.sortBy);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/ingredients${qs}`);
    return res?.data || [];
  },

  getIngredientById: async (id) => {
    const res = await apiRequest(`/ingredients/${id}`);
    return res?.data;
  },

  createIngredient: async (data) => {
    const res = await apiRequest('/ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateIngredient: async (id, data) => {
    const res = await apiRequest(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteIngredient: async (id) => {
    const res = await apiRequest(`/ingredients/${id}`, { method: 'DELETE' });
    return res?.data;
  },

  getAllergies: async () => {
    const res = await apiRequest('/ingredients/allergies');
    return res?.data || [];
  },

  getNutrientStandards: async () => {
    const res = await apiRequest('/ingredients/standards');
    return res?.data || [];
  },
};

// ================= FEEDBACKS & REPORTS API =================
export const feedbacksApi = {
  getFeedbacks: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/feedbacks${qs}`);
    return res?.data || [];
  },

  getStats: async () => {
    const res = await apiRequest('/feedbacks/stats');
    return res?.data;
  },

  resolveFeedback: async (id, data, feedbackType = 'report') => {
    const res = await apiRequest(`/feedbacks/${id}/resolve?feedbackType=${encodeURIComponent(feedbackType)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  createReport: async (data) => {
    const res = await apiRequest('/feedbacks/report', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  submitAiFeedback: async (data) => {
    const res = await apiRequest('/feedbacks/ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },
};

// ================= VEGAN CHALLENGES API =================
export const challengesApi = {
  getChallenges: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.difficulty && params.difficulty !== 'all') query.append('difficulty', params.difficulty);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/challenges${qs}`);
    return res?.data || [];
  },

  getStats: async () => {
    const res = await apiRequest('/challenges/stats');
    return res?.data;
  },

  getChallengeById: async (id) => {
    const res = await apiRequest(`/challenges/${id}`);
    return res?.data;
  },

  createChallenge: async (data) => {
    const res = await apiRequest('/challenges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateChallenge: async (id, data) => {
    const res = await apiRequest(`/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteChallenge: async (id) => {
    const res = await apiRequest(`/challenges/${id}`, { method: 'DELETE' });
    return res?.data;
  },

  getCheckinsQueue: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.challengeId) query.append('challengeId', params.challengeId);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/challenges/checkins${qs}`);
    return res?.data || [];
  },

  reviewCheckin: async (id, data) => {
    const res = await apiRequest(`/challenges/checkins/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },
};

// ================= NUTRITION ANALYTICS API =================
export const analyticsApi = {
  getOverview: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.periodDays) query.append('periodDays', params.periodDays);
    if (params.averagingMode) query.append('averagingMode', params.averagingMode);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/nutritionanalytics/overview${qs}`);
    return res?.data;
  },

  getDeficits: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.periodDays) query.append('periodDays', params.periodDays);
    if (params.averagingMode) query.append('averagingMode', params.averagingMode);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/nutritionanalytics/deficits${qs}`);
    return res?.data || [];
  },

  getTrends: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.periodDays) query.append('periodDays', params.periodDays);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/nutritionanalytics/trends${qs}`);
    return res?.data || [];
  },
};

// ================= BROADCAST NOTIFICATIONS API =================
export const broadcastsApi = {
  getBroadcasts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/broadcasts${qs}`);
    return res?.data || [];
  },

  getStats: async () => {
    const res = await apiRequest('/broadcasts/stats');
    return res?.data;
  },

  createBroadcast: async (data) => {
    const res = await apiRequest('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateBroadcast: async (id, data) => {
    const res = await apiRequest(`/broadcasts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteBroadcast: async (id) => {
    const res = await apiRequest(`/broadcasts/${id}`, { method: 'DELETE' });
    return res?.data;
  },

  sendNow: async (id) => {
    const res = await apiRequest(`/broadcasts/${id}/send-now`, { method: 'POST' });
    return res?.data;
  },
};

// ================= ECO REWARDS API =================
export const rewardsApi = {
  getRewards: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/rewards${qs}`);
    return res?.data || [];
  },

  getStats: async () => {
    const res = await apiRequest('/rewards/stats');
    return res?.data;
  },

  createReward: async (data) => {
    const res = await apiRequest('/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateReward: async (id, data) => {
    const res = await apiRequest(`/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteReward: async (id) => {
    const res = await apiRequest(`/rewards/${id}`, { method: 'DELETE' });
    return res?.data;
  },

  getClaims: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/rewards/claims${qs}`);
    return res?.data || [];
  },

  processClaim: async (id, data) => {
    const res = await apiRequest(`/rewards/claims/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },
};

// ================= VEGAN PRODUCT SCANNER API =================
export const productScansApi = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/productscans${qs}`);
    return res?.data || [];
  },

  getStats: async () => {
    const res = await apiRequest('/productscans/stats');
    return res?.data;
  },

  getProductById: async (id) => {
    const res = await apiRequest(`/productscans/${id}`);
    return res?.data;
  },

  createProduct: async (data) => {
    const res = await apiRequest('/productscans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  updateProduct: async (id, data) => {
    const res = await apiRequest(`/productscans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data;
  },

  deleteProduct: async (id) => {
    const res = await apiRequest(`/productscans/${id}`, { method: 'DELETE' });
    return res?.data;
  },

  reviewProduct: async (id, data) => {
    const res = await apiRequest(`/productscans/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data;
  },
};

// ================= FILE UPLOAD API =================
export const uploadsApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiRequest('/uploads/image', {
      method: 'POST',
      body: formData,
      timeoutMs: 30000,
    });
    return res?.data;
  },
};

