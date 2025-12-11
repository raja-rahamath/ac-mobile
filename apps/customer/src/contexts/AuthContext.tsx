import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '../constants/api';
import { setOnLogout } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  customer: {
    id: string;
    customerNo: string;
    customerType: 'INDIVIDUAL' | 'ORGANIZATION';
    companyName?: string | null;
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerIndividual: (data: RegisterIndividualData) => Promise<{ success: boolean; error?: string }>;
  registerCompany: (data: RegisterCompanyData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

interface RegisterIndividualData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface RegisterCompanyData {
  email: string;
  password: string;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@agentcare_access_token',
  REFRESH_TOKEN: '@agentcare_refresh_token',
  USER: '@agentcare_user',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Handle logout callback from API client (when token refresh fails)
  const handleApiLogout = useCallback(() => {
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Wire up the logout callback for the API client
  useEffect(() => {
    setOnLogout(handleApiLogout);
  }, [handleApiLogout]);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [accessToken, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        setState({
          user,
          accessToken,
          refreshToken,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuth = async (accessToken: string, refreshToken: string, user: User) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  };

  const clearAuth = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const loginUrl = `${API_CONFIG.BASE_URL}${ENDPOINTS.LOGIN}`;
    console.log('[Auth] Attempting login to:', loginUrl);

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[Auth] Login response status:', response.status);

      if (!response.ok) {
        return { success: false, error: data.error?.message || 'Login failed' };
      }

      const { accessToken, refreshToken, user } = data.data;
      await saveAuth(accessToken, refreshToken, user);

      setState({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
        isAuthenticated: true,
      });

      console.log('[Auth] Login successful for:', email);
      return { success: true };
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      console.error('[Auth] Login URL was:', loginUrl);
      console.error('[Auth] Error type:', error?.name);
      console.error('[Auth] Error message:', error?.message);

      // Provide more helpful error messages
      if (error?.message?.includes('Network request failed')) {
        return { success: false, error: `Cannot connect to server. Make sure you are on the same network as the development machine. (${API_CONFIG.BASE_URL})` };
      }
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const registerIndividual = async (data: RegisterIndividualData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REGISTER_INDIVIDUAL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error?.message || 'Registration failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const registerCompany = async (data: RegisterCompanyData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REGISTER_COMPANY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error?.message || 'Registration failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint (optional, mainly for token invalidation on server)
      if (state.accessToken) {
        fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${state.accessToken}` },
        }).catch(() => {}); // Ignore errors
      }
    } finally {
      await clearAuth();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    if (!state.refreshToken) return false;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      });

      if (!response.ok) {
        await logout();
        return false;
      }

      const data = await response.json();
      const { accessToken, refreshToken } = data.data;

      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      setState(prev => ({
        ...prev,
        accessToken,
        refreshToken,
      }));

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        registerIndividual,
        registerCompany,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
