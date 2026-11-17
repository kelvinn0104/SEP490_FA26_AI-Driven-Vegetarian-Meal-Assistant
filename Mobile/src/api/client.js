import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL = 'https://veggieai-api.onrender.com/api';

const TOKEN_KEY = 'veggie_token';
const USER_KEY = 'veggie_user';

// In-memory token cache for sync read in interceptors
let memoryToken = null;

export const getAuthToken = async () => {
  if (memoryToken) return memoryToken;
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    memoryToken = token;
    return token;
  } catch (error) {
    console.warn('Lỗi đọc token từ SecureStore:', error);
    return null;
  }
};

export const setAuthToken = async (token) => {
  memoryToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.warn('Lỗi ghi token vào SecureStore:', error);
  }
};

export const getStoredUser = async () => {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = async (user) => {
  try {
    if (user) {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.warn('Lỗi ghi user vào SecureStore:', error);
  }
};

export const clearAuth = async () => {
  memoryToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (error) {
    console.warn('Lỗi xóa auth:', error);
  }
};

/**
 * Helper gỡ bọc dữ liệu ApiResponse<T>
 */
export function unwrap(res) {
  if (res === null || res === undefined) return null;
  if (typeof res === 'object') {
    if ('data' in res && ('success' in res || 'message' in res)) {
      return res.data;
    }
  }
  return res;
}

/**
 * Xử lý link ảnh trả về từ BE
 */
export const imgUrl = (path) => {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${host}${cleanPath}`;
};

export const recipeImageUrl = (path, fallback = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600') => {
  if (!path) return fallback;
  const p = String(path);
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  if (p.startsWith('/') || p.startsWith('uploads/')) return imgUrl(p);
  return imgUrl(`/uploads/${p}`);
};

/**
 * Hàm gọi API chung tương thích chuẩn fetch của React Native
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const token = await getAuthToken();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const timeoutMs = options.timeout || 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

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
      if (response.status === 401) {
        console.warn('[VeggieAI Mobile] Token đã hết hạn (401)');
      }
      let errorMessage = 'Lỗi máy chủ';
      if (data && typeof data === 'object') {
        if (data.detail) errorMessage = data.detail;
        else if (data.message) errorMessage = data.message;
        else if (data.title) errorMessage = data.title;
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }
      const err = new Error(errorMessage);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Yêu cầu quá thời gian chờ (Timeout). Vui lòng thử lại.');
    }
    throw error;
  }
}
