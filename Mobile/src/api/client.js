import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const storage = Platform.OS === 'web'
  ? {
      getItemAsync: async key => globalThis.sessionStorage?.getItem(key) ?? null,
      setItemAsync: async (key, value) => { globalThis.sessionStorage?.setItem(key, value); },
      deleteItemAsync: async key => { globalThis.sessionStorage?.removeItem(key); },
    }
  : SecureStore;

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://veggieai-api.onrender.com/api').replace(/\/$/, '');
const SESSION_KEY = 'veggie_mobile_session';
const VERIFICATION_KEY = 'veggie_mobile_verification';
let session = null;
let onExpired = () => {};
let writes = Promise.resolve();

export function setSessionExpiredHandler(handler) {
  onExpired = handler;
}

export async function restoreSession() {
  const saved = await storage.getItemAsync(SESSION_KEY);
  session = saved ? JSON.parse(saved) : null;
  if (!session) {
    // Migrate the original mobile app's stored session.
    const [token, userJson] = await Promise.all([
      storage.getItemAsync('veggie_token'), storage.getItemAsync('veggie_user'),
    ]);
    if (token && userJson) {
      await saveSession({ token, user: JSON.parse(userJson) });
      await Promise.all(['veggie_token', 'veggie_user'].map(key => storage.deleteItemAsync(key)));
    }
  }
  return session;
}

export function saveSession(next) {
  if (!next) session = null;
  const pending = writes.then(async () => {
    if (next) {
      await storage.setItemAsync(SESSION_KEY, JSON.stringify(next));
      session = next;
    } else {
      session = null;
      await Promise.all([SESSION_KEY, 'veggie_token', 'veggie_user'].map(key => storage.deleteItemAsync(key)));
    }
  });
  writes = pending.catch(() => {});
  return pending;
}

export async function restoreVerification() {
  const saved = await storage.getItemAsync(VERIFICATION_KEY);
  return saved ? JSON.parse(saved) : null;
}

export function saveVerification(pending) {
  return pending ? storage.setItemAsync(VERIFICATION_KEY, JSON.stringify(pending))
    : storage.deleteItemAsync(VERIFICATION_KEY);
}

export function unwrap(value) {
  return value && typeof value === 'object' && 'data' in value ? value.data : value;
}

export function imgUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const path = value.trim();
  if (/^https?:\/\//i.test(path)) return path;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return undefined;
  return API_BASE_URL.replace(/\/api$/i, '') + '/' + path.replace(/^\/+/, '');
}

export async function apiRequest(endpoint, options = {}) {
  const { timeout = 90000, signal, anonymous = false, ...request } = options;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeout);
  const sentSession = anonymous ? null : session;
  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      ...request,
      headers: {
        ...(typeof request.body === 'string' && { 'Content-Type': 'application/json' }),
        ...(sentSession?.token && { Authorization: 'Bearer ' + sentSession.token }),
        ...request.headers,
      },
      signal: controller.signal,
    });
    if (response.status === 204) return null;
    if (response.status === 401 && sentSession?.token && session?.token === sentSession.token) {
      onExpired();
    }
    const data = response.headers.get('content-type')?.includes('json') ? await response.json() : null;
    if (!response.ok || data?.success === false) {
      const fields = data?.errors && !Array.isArray(data.errors) ? Object.values(data.errors).flat() : [];
      const err = new Error(data?.detail || fields.join('\n') || data?.message || 'Máy chủ chưa thể xử lý yêu cầu.');
      const retry = response.headers.get('Retry-After') || (Array.isArray(data?.errors) && data.errors.find(item => typeof item === 'string' && item.startsWith('retryAfterSeconds='))?.split('=')[1]);
      Object.assign(err, { status: response.status, data, retryAfterSeconds: Number(retry) || 0 });
      throw err;
    }
    if (data === null) throw new Error('Máy chủ trả về dữ liệu không hợp lệ.');
    return unwrap(data);
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) throw new Error('Máy chủ phản hồi chậm. Bạn có thể thử lại.');
    if (error instanceof TypeError) throw new Error('Không thể kết nối. Kiểm tra mạng rồi thử lại.');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

export function writeJson(endpoint, body, method = 'POST', options) {
  return apiRequest(endpoint, { ...options, method, body: JSON.stringify(body) });
}
