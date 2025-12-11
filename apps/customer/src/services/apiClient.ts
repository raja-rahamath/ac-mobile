import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '../constants/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@agentcare_access_token',
  REFRESH_TOKEN: '@agentcare_refresh_token',
  USER: '@agentcare_user',
};

// Track if we're currently refreshing to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Callback to notify auth context of logout
let onLogout: (() => void) | null = null;

export function setOnLogout(callback: () => void) {
  onLogout = callback;
}

async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        console.log('[ApiClient] No refresh token available');
        return false;
      }

      console.log('[ApiClient] Attempting to refresh access token...');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.log('[ApiClient] Token refresh failed:', response.status);
        // Clear auth data and trigger logout
        await clearAuthData();
        return false;
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

      // Save new tokens
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken),
      ]);

      console.log('[ApiClient] Token refresh successful');
      return true;
    } catch (error) {
      console.error('[ApiClient] Token refresh error:', error);
      await clearAuthData();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function clearAuthData() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.USER),
  ]);

  // Notify auth context to update state
  if (onLogout) {
    onLogout();
  }
}

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
  baseUrl?: string;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = true, baseUrl = API_CONFIG.BASE_URL, ...fetchOptions } = options;

  let accessToken: string | null = null;

  if (requiresAuth) {
    accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!accessToken) {
      throw new Error('Not authenticated');
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = `${baseUrl}${endpoint}`;

  // First attempt
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // If 401 and we have auth, try to refresh token
  if (response.status === 401 && requiresAuth) {
    console.log('[ApiClient] Received 401, attempting token refresh...');

    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Get new token and retry request
      const newAccessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (newAccessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;

        console.log('[ApiClient] Retrying request with new token...');
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      }
    } else {
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    const errorMessage = errorData.detail || errorData.error?.message || errorData.error || errorData.message || `Request failed with status ${response.status}`;
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }

  return response.json();
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
