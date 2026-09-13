import React, { createContext, useContext, useEffect, useState } from 'react';
import { appStorage } from '@/utils/storage';
import { API_URL, setAuthCallbacks } from '@/utils/api';

export interface User {
  id: number;
  username: string;
  email: string;
  total_score: number;
  level: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
  setAuthData: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
}

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveToStorage = async (accToken: string, refToken: string, userData: User) => {
    try {
      await appStorage.setItem(ACCESS_TOKEN_KEY, accToken);
      await appStorage.setItem(REFRESH_TOKEN_KEY, refToken);
      await appStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save auth tokens to storage', e);
    }
  };

  const clearStorage = async () => {
    try {
      await appStorage.deleteItem(ACCESS_TOKEN_KEY);
      await appStorage.deleteItem(REFRESH_TOKEN_KEY);
      await appStorage.deleteItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  };

  const setAuthData = async (accToken: string, refToken: string, userData: User) => {
    setAccessToken(accToken);
    setRefreshToken(refToken);
    setUser(userData);
    await saveToStorage(accToken, refToken, userData);
  };

  const updateUser = (newUserData: User) => {
    setUser(newUserData);
    appStorage.setItem(USER_KEY, JSON.stringify(newUserData)).catch(console.error);
  };

  const signOut = async () => {
    const currentRefreshToken = refreshToken || await appStorage.getItem(REFRESH_TOKEN_KEY);
    if (currentRefreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: currentRefreshToken }),
        });
      } catch (e) {
        console.warn('Logout request failed (clearing local session anyway)', e);
      }
    }
    await clearStorage();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const signIn = async (identifier: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });

    if (!response.ok) {
      let errorMsg = 'Giriş yapılamadı.';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    await setAuthData(data.access_token, data.refresh_token, data.user);
  };

  const signUp = async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        email: email.trim(),
        password,
      }),
    });

    if (!response.ok) {
      let errorMsg = 'Kayıt yapılamadı.';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    await setAuthData(data.access_token, data.refresh_token, data.user);
  };

  // Restore session on mount
  useEffect(() => {
    setAuthCallbacks(
      (newAccessToken, newRefreshToken, updatedUser) => {
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setUser(updatedUser);
      },
      () => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      }
    );

    const restoreSession = async () => {
      try {
        const storedAccessToken = await appStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = await appStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUserJson = await appStorage.getItem(USER_KEY);

        if (!storedAccessToken || !storedRefreshToken) {
          setIsLoading(false);
          return;
        }

        // Test if access token is still valid
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedAccessToken}` },
        });

        if (meResponse.ok) {
          const freshUser = await meResponse.json();
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(freshUser);
          await appStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } else if (meResponse.status === 401) {
          // Access token expired, attempt refresh
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: storedRefreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            await setAuthData(refreshData.access_token, refreshData.refresh_token, refreshData.user);
          } else {
            // Refresh token invalid or revoked
            await clearStorage();
          }
        } else {
          // Offline or other error - use cached user if available
          if (storedUserJson) {
            try {
              setUser(JSON.parse(storedUserJson));
              setAccessToken(storedAccessToken);
              setRefreshToken(storedRefreshToken);
            } catch {
              await clearStorage();
            }
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        signIn,
        signUp,
        signOut,
        updateUser,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
