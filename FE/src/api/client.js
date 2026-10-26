/**
 * VeggieAI API Client
 * Enterprise-grade HTTP Client connecting to ASP.NET Core 8 Backend
 * Compliant with VeggieAI_API_Frontend_Guide.md
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://veggieai-api.onrender.com/api';

// Resolve image path to absolute backend URL
export const imgUrl = (path) => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Strip trailing /api if present to get server host
  const host = API_BASE_URL.startsWith('http')
    ? API_BASE_URL.replace(/\/api\/?$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${host}${cleanPath}`;
};

// Token storage (compliant with both 'token' and 'veggie_token')
export const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('veggie_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('veggie_token', token);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('veggie_token');
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('veggie_user') || localStorage.getItem('veggieai_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    const serialized = JSON.stringify(user);
    localStorage.setItem('veggie_user', serialized);
    localStorage.setItem('veggieai_user', serialized);
  } else {
    localStorage.removeItem('veggie_user');
    localStorage.removeItem('veggieai_user');
  }
};

/**
 * Unwrap backend response helper.
 * Seamlessly handles:
 * 1. Standard ASP.NET Core DTO: { id: 1, ... } or [ ... ]
 * 2. Wrapped ApiResponse<T>: { success: true, data: T, message: "..." }
 */
export function unwrap(res) {
  if (res === null || res === undefined) return null;
  if (typeof res === 'object') {
    // If wrapped in { success: true, data: ... }
    if ('data' in res && ('success' in res || 'message' in res)) {
      return res.data;
    }
  }
  return res;
}

/**
 * Core API Request function with auto JWT, timeout, multipart handling & error normalization
 */
export async function apiRequest(endpoint, options = {}) {
  // Normalize endpoint to prevent double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const token = getAuthToken();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Configure timeout controller (100 seconds for AI operations & cold starts)
  const timeoutMs = options.timeout || 100000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json') || contentType.includes('application/problem+json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // 401 Unauthorized handling
      if (response.status === 401) {
        console.warn('[VeggieAI API] Token hết hạn hoặc không hợp lệ (401).');
      }

      // Format error message from ProblemDetails or ASP.NET validation errors
      let errorMessage = 'Lỗi máy chủ';
      if (data && typeof data === 'object') {
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.errors && typeof data.errors === 'object') {
          errorMessage = Object.values(data.errors).flat().join('\n');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.title) {
          errorMessage = data.title;
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Quá thời gian phản hồi từ máy chủ (Timeout 60s).');
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    throw err;
  }
}

export default {
  API_BASE_URL,
  imgUrl,
  getAuthToken,
  setAuthToken,
  getStoredUser,
  setStoredUser,
  unwrap,
  apiRequest,
};
