// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4001',
  AI_URL: process.env.EXPO_PUBLIC_AI_URL || 'http://localhost:8001',
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  REFRESH_TOKEN: '/api/v1/auth/refresh',

  // Service Requests
  SERVICE_REQUESTS: '/api/v1/service-requests',
  SERVICE_REQUEST_DETAIL: (id: string) => `/api/v1/service-requests/${id}`,

  // Chat
  CHAT_SESSION: '/api/v1/chat/session',
  CHAT_MESSAGE: '/api/v1/chat/message',

  // Profile
  PROFILE: '/api/v1/profile',

  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',
};
