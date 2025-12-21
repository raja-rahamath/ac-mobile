// API Configuration
// For Expo Go testing, use your local IP address or remote server
// For web testing, use localhost
import { Platform } from 'react-native';

// Remote server IP (Hetzner)
const REMOTE_SERVER = '116.203.196.139';

// Use localhost for web (avoids CORS issues), remote server for mobile
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return Platform.OS === 'web' ? 'http://localhost:4001' : `http://${REMOTE_SERVER}:4001`;
};

const getAiUrl = () => {
  if (process.env.EXPO_PUBLIC_AI_URL) return process.env.EXPO_PUBLIC_AI_URL;
  return Platform.OS === 'web' ? 'http://localhost:8003' : `http://${REMOTE_SERVER}:8003`;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  AI_URL: getAiUrl(),
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  // Customer Auth
  REGISTER_INDIVIDUAL: '/api/v1/customer/auth/register/individual',
  REGISTER_COMPANY: '/api/v1/customer/auth/register/company',
  LOGIN: '/api/v1/customer/auth/login',
  VERIFY_EMAIL: '/api/v1/customer/auth/verify',
  RESEND_VERIFICATION: '/api/v1/customer/auth/resend-verification',
  FORGOT_PASSWORD: '/api/v1/customer/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/customer/auth/reset-password',
  REFRESH_TOKEN: '/api/v1/customer/auth/refresh',
  LOGOUT: '/api/v1/customer/auth/logout',
  PROFILE: '/api/v1/customer/auth/me',

  // Service Requests (customer-specific endpoint)
  SERVICE_REQUESTS: '/api/v1/customer/auth/service-requests',
  SERVICE_REQUEST_DETAIL: (id: string) => `/api/v1/customer/auth/service-requests/${id}`,

  // Chat (AI Service)
  CHAT: '/api/v1/chat/',

  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',

  // Customer Properties (via customer auth)
  MY_PROPERTIES: '/api/v1/customer/auth/properties',
  REGISTER_PROPERTY: '/api/v1/customer/auth/properties',
  SET_PRIMARY_PROPERTY: (propertyId: string) => `/api/v1/customer/auth/properties/${propertyId}/primary`,
  AREAS: '/api/v1/customer/auth/areas',

  // Service Types
  SERVICE_TYPES: '/api/v1/customer/auth/service-types',

  // AI Classification
  CLASSIFY_SERVICE: '/api/v1/customer/auth/classify-service',
};
