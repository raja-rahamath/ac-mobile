import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '../constants/api';
import { setOnLogout, STORAGE_KEYS } from '../services/apiClient';
import type { User, Employee } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  updateProfile: (data: Partial<Employee>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    console.log('[Auth] Attempting employee login to:', loginUrl);

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('[Auth] Login response status:', response.status);

      if (!response.ok) {
        return { success: false, error: data.error?.message || data.error || 'Login failed' };
      }

      const { accessToken, refreshToken, user } = data.data;

      // Verify this is a technician account
      if (!user.role || user.role.name !== 'technician') {
        return { success: false, error: 'This account does not have technician access' };
      }

      // Fetch employee data
      let userWithEmployee = user;
      try {
        const employeeResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.PROFILE}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (employeeResponse.ok) {
          const employeeData = await employeeResponse.json();
          // Add employee data to user object
          userWithEmployee = {
            ...user,
            employee: employeeData.data || employeeData,
          };
          console.log('[Auth] Employee data fetched, ID:', userWithEmployee.employee?.id);
        }
      } catch (empError) {
        console.warn('[Auth] Failed to fetch employee data:', empError);
        // Continue without employee data - some features may be limited
      }

      await saveAuth(accessToken, refreshToken, userWithEmployee);

      setState({
        user: userWithEmployee,
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

      if (error?.message?.includes('Network request failed')) {
        return {
          success: false,
          error: `Cannot connect to server. Please check your network connection. (${API_CONFIG.BASE_URL})`,
        };
      }
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

  const updateProfile = (data: Partial<Employee>) => {
    if (state.user && state.user.employee) {
      const updatedUser = {
        ...state.user,
        employee: { ...state.user.employee, ...data },
      };
      setState(prev => ({ ...prev, user: updatedUser }));
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshAuth,
        updateProfile,
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
