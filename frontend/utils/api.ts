import { appStorage } from './storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

type TokenUpdateCallback = (accessToken: string, refreshToken: string, user: any) => void;
type AuthErrorCallback = () => void;

let currentAccessToken: string | null = null;
let onTokenUpdateCallback: TokenUpdateCallback | null = null;
let onAuthErrorCallback: AuthErrorCallback | null = null;

export const setAuthCallbacks = (
  onUpdate: TokenUpdateCallback,
  onError: AuthErrorCallback
) => {
  onTokenUpdateCallback = (acc, ref, user) => {
    currentAccessToken = acc;
    onUpdate(acc, ref, user);
  };
  onAuthErrorCallback = () => {
    currentAccessToken = null;
    onError();
  };
};

export const setMemoryAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// --- SINGLE-FLIGHT MUTEX TO PREVENT RACE CONDITIONS ON CONCURRENT 401s ---
let refreshPromise: Promise<string | null> | null = null;

async function executeRefresh(): Promise<string | null> {
  try {
    const currentRefreshToken = await appStorage.getItem(REFRESH_TOKEN_KEY);
    if (!currentRefreshToken) {
      if (onAuthErrorCallback) onAuthErrorCallback();
      return null;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: currentRefreshToken }),
    });

    if (!response.ok) {
      console.warn('Refresh token rejected or expired (status:', response.status, ')');
      await appStorage.deleteItem(ACCESS_TOKEN_KEY);
      await appStorage.deleteItem(REFRESH_TOKEN_KEY);
      await appStorage.deleteItem(USER_KEY);
      if (onAuthErrorCallback) onAuthErrorCallback();
      return null;
    }

    const data = await response.json();
    await appStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    await appStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    await appStorage.setItem(USER_KEY, JSON.stringify(data.user));

    if (onTokenUpdateCallback) {
      onTokenUpdateCallback(data.access_token, data.refresh_token, data.user);
    }

    return data.access_token as string;
  } catch (err) {
    console.error('Error during token refresh:', err);
    if (onAuthErrorCallback) onAuthErrorCallback();
    return null;
  } finally {
    refreshPromise = null;
  }
}

export function getRefreshedToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = executeRefresh();
  }
  return refreshPromise;
}

export const useApi = () => {
  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    let token = currentAccessToken || (await appStorage.getItem(ACCESS_TOKEN_KEY));

    const makeRequest = async (authToken: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
      };

      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
    };

    try {
      let response = await makeRequest(token);

      // If token expired (401), use the single-flight mutex to refresh once
      if (response.status === 401) {
        console.log(`[useApi] 401 received for ${endpoint}. Waiting for token refresh...`);
        const newToken = await getRefreshedToken();

        if (newToken) {
          console.log(`[useApi] Retrying ${endpoint} with fresh token.`);
          response = await makeRequest(newToken);
        } else {
          throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed for ${endpoint}:`, error);
      throw error;
    }
  };

  return { fetchWithAuth };
};
