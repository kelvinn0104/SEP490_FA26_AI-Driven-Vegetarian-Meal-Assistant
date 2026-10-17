/**
 * API Service Client & Endpoints Configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.veggieai.internal/v3';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    LOCK: (id) => `/users/${id}/lock`,
    UNLOCK: (id) => `/users/${id}/unlock`,
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },
  MODERATION: {
    PENDING: '/moderation/pending',
    APPROVE: (id) => `/moderation/${id}/approve`,
    REJECT: (id) => `/moderation/${id}/reject`,
    REVISION: (id) => `/moderation/${id}/revision`,
  },
  RECIPES: {
    LIST: '/recipes',
    DETAIL: (id) => `/recipes/${id}`,
    UPDATE_STATUS: (id) => `/recipes/${id}/status`,
    DELETE: (id) => `/recipes/${id}`,
  },
  AI: {
    ANALYZE_NUTRITION: '/ai/recipe/parse-macros',
    HEALTH_CHECK: '/ai/health',
    TELEMETRY: '/ai/telemetry',
  },
};

export * from './client';
export { default } from './client';
