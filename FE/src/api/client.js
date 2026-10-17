/**
 * VeggieAI API Client
 * Seamlessly connects to .NET 10 RESTful API Backend
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => {
  return localStorage.getItem('veggie_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('veggie_token', token);
  } else {
    localStorage.removeItem('veggie_token');
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('veggie_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('veggie_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('veggie_user');
  }
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = data?.message || data?.title || (typeof data === 'string' ? data : 'Lỗi kết nối máy chủ');
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ================= AUTH API =================
export const authApi = {
  login: async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setStoredUser(res.data.user);
    }
    return res.data;
  },

  register: async ({ name, email, password, role = 'user', inviteCode = '' }) => {
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
    if (res.data?.token) {
      setAuthToken(res.data.token);
      setStoredUser(res.data.user);
    }
    return res.data;
  },

  getMe: async () => {
    const res = await apiRequest('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
      setStoredUser(null);
    }
  },
};

// ================= USERS API =================
export const usersApi = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.diet && params.diet !== 'all') query.append('diet', params.diet);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.status && params.status !== 'all') query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/users${queryString}`);
    return res.data || [];
  },

  getUserById: async (id) => {
    const res = await apiRequest(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return res.data;
  },

  lockUser: async (id) => {
    const res = await apiRequest(`/users/${id}/lock`, { method: 'PUT' });
    return res.data;
  },

  unlockUser: async (id) => {
    const res = await apiRequest(`/users/${id}/unlock`, { method: 'PUT' });
    return res.data;
  },

  updateUserRole: async (id, role) => {
    const res = await apiRequest(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await apiRequest(`/users/${id}`, { method: 'DELETE' });
    return res.data;
  },
};

// ================= ROLES & PERMISSIONS API =================
export const rolesApi = {
  getRoles: async () => {
    const res = await apiRequest('/roles');
    return res.data || [];
  },

  getPermissions: async () => {
    const res = await apiRequest('/roles/permissions');
    return res.data || [];
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
    return res.data;
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
    return res.data || [];
  },

  createLog: async (logData) => {
    const res = await apiRequest('/logs', {
      method: 'POST',
      body: JSON.stringify(logData),
    });
    return res.data;
  },
};

// ================= AI MONITORING API =================
export const aiApi = {
  getHealth: async () => {
    const res = await apiRequest('/ai/health');
    return res.data;
  },

  getModels: async () => {
    const res = await apiRequest('/ai/models');
    return res.data || [];
  },

  getTelemetry: async () => {
    const res = await apiRequest('/ai/telemetry');
    return res.data || [];
  },

  parseNutrition: async (recipeText) => {
    const res = await apiRequest('/ai/recipe/parse-macros', {
      method: 'POST',
      body: JSON.stringify({ recipeText }),
    });
    return res.data;
  },
};

// ================= DASHBOARD API =================
export const dashboardApi = {
  getStats: async () => {
    const res = await apiRequest('/dashboard/stats');
    return res.data;
  },

  getDietDistribution: async () => {
    const res = await apiRequest('/dashboard/diet-distribution');
    return res.data || [];
  },

  getCharts: async () => {
    const res = await apiRequest('/dashboard/charts');
    return res.data || [];
  },

  getActivities: async () => {
    const res = await apiRequest('/dashboard/activities');
    return res.data || [];
  },
};

// ================= CATEGORIES API =================
export const categoriesApi = {
  getCategories: async (type = null) => {
    const qs = type ? `?type=${encodeURIComponent(type)}` : '';
    const res = await apiRequest(`/categories${qs}`);
    return res.data || [];
  },

  createCategory: async (categoryData) => {
    const res = await apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return res.data;
  },

  updateCategory: async (id, categoryData) => {
    const res = await apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await apiRequest(`/categories/${id}`, { method: 'DELETE' });
    return res.data;
  },
};

// ================= MODERATION API =================
export const moderationApi = {
  getPending: async (type = null) => {
    const qs = type && type !== 'all' ? `?type=${encodeURIComponent(type)}` : '';
    const res = await apiRequest(`/moderation/pending${qs}`);
    return res.data || [];
  },

  getPendingCount: async () => {
    const res = await apiRequest('/moderation/count');
    return res.data ?? 0;
  },

  approve: async (id, reason = 'Nội dung đạt chuẩn thuần chay và dinh dưỡng.') => {
    const res = await apiRequest(`/moderation/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'approved', reason }),
    });
    return res.data;
  },

  reject: async (id, reason = 'Nội dung vi phạm tiêu chuẩn cộng đồng.') => {
    const res = await apiRequest(`/moderation/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'rejected', reason }),
    });
    return res.data;
  },

  requestRevision: async (id, reason = 'Vui lòng bổ sung đầy đủ thông tin định lượng.') => {
    const res = await apiRequest(`/moderation/${id}/revision`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'revision', reason }),
    });
    return res.data;
  },
};

// ================= RECIPES API =================
export const recipesApi = {
  getRecipes: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest(`/recipes${qs}`);
    return res.data || [];
  },

  getRecipeById: async (id) => {
    const res = await apiRequest(`/recipes/${id}`);
    return res.data;
  },

  createRecipe: async (recipeData) => {
    const res = await apiRequest('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData),
    });
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await apiRequest(`/recipes/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  deleteRecipe: async (id) => {
    const res = await apiRequest(`/recipes/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};

const api = {
  authApi,
  usersApi,
  rolesApi,
  logsApi,
  aiApi,
  dashboardApi,
  categoriesApi,
  moderationApi,
  recipesApi,
};

export default api;
