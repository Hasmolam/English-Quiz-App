import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Cross-platform storage helper.
 * Uses `expo-secure-store` on native platforms (iOS/Android)
 * and `localStorage` on Web (browser).
 */
export const appStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        console.warn('[Storage] localStorage getItem error:', e);
      }
      return null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn('[Storage] SecureStore getItem error:', e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {
        console.warn('[Storage] localStorage setItem error:', e);
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn('[Storage] SecureStore setItem error:', e);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('[Storage] localStorage deleteItem error:', e);
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn('[Storage] SecureStore deleteItem error:', e);
    }
  },
};
