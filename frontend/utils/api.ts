import { useAuth } from '@clerk/clerk-expo';

// Android emülatör için 10.0.2.2, iOS ve Web için localhost
// Fiziksel cihaz için bilgisayarınızın local IP'sini kullanın (örn: 192.168.1.X)
// export const API_URL = 'http://192.168.1.35:8000'; 
export const API_URL = 'http://localhost:8000';

export const useApi = () => {
  const { getToken } = useAuth();

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getToken();

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
    }
  };

  return { fetchWithAuth };
};
