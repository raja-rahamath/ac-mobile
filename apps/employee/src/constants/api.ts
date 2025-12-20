// API Configuration for Employee/Technician App
import { Platform } from 'react-native';

// UAT API URL
const UAT_API_URL = 'http://116.203.196.139:4001';

// Production API URL
const PRODUCTION_API_URL = 'https://api.agentcareai.com';

// Use UAT for development/testing
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // For now, use UAT API for all platforms during development
  return UAT_API_URL;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  // Technician Auth
  LOGIN: '/api/v1/auth/login',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  PROFILE: '/api/v1/employees/me',

  // Work Orders (Jobs)
  WORK_ORDERS: '/api/v1/work-orders',
  WORK_ORDER_DETAIL: (id: string) => `/api/v1/work-orders/${id}`,
  WORK_ORDER_EN_ROUTE: (id: string) => `/api/v1/work-orders/${id}/en-route`,
  WORK_ORDER_ARRIVE: (id: string) => `/api/v1/work-orders/${id}/arrive`,
  WORK_ORDER_START: (id: string) => `/api/v1/work-orders/${id}/start`,
  WORK_ORDER_CLOCK_IN: (id: string) => `/api/v1/work-orders/${id}/clock-in`,
  WORK_ORDER_CLOCK_OUT: (id: string) => `/api/v1/work-orders/${id}/clock-out`,
  WORK_ORDER_HOLD: (id: string) => `/api/v1/work-orders/${id}/hold`,
  WORK_ORDER_RESUME: (id: string) => `/api/v1/work-orders/${id}/resume`,
  WORK_ORDER_COMPLETE: (id: string) => `/api/v1/work-orders/${id}/complete`,
  WORK_ORDER_PHOTOS: (id: string) => `/api/v1/work-orders/${id}/photos`,
  WORK_ORDER_ITEMS: (id: string) => `/api/v1/work-orders/${id}/items`,
  WORK_ORDER_CHECKLIST: (id: string) => `/api/v1/work-orders/${id}/checklist`,

  // Service Requests (for reference)
  SERVICE_REQUESTS: '/api/v1/service-requests',
  SERVICE_REQUEST_DETAIL: (id: string) => `/api/v1/service-requests/${id}`,

  // Invoices
  INVOICES: '/api/v1/invoices',
  INVOICE_DETAIL: (id: string) => `/api/v1/invoices/${id}`,
  INVOICE_FROM_SERVICE_REQUEST: (serviceRequestId: string) =>
    `/api/v1/invoices/from-service-request/${serviceRequestId}`,
  INVOICE_PAYMENTS: (invoiceId: string) => `/api/v1/invoices/${invoiceId}/payments`,

  // Receipts
  RECEIPTS: '/api/v1/receipts',
  RECEIPT_DETAIL: (id: string) => `/api/v1/receipts/${id}`,
  RECEIPT_FROM_PAYMENT: '/api/v1/receipts/from-payment',
  RECEIPT_EMAIL: (id: string) => `/api/v1/receipts/${id}/email`,

  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',
  REGISTER_PUSH_TOKEN: '/api/v1/notifications/push-token',

  // Employee
  EMPLOYEE_LOCATION: '/api/v1/employees/location',

  // Inventory
  INVENTORY_ITEMS: '/api/v1/inventory-items',
  INVENTORY_ITEM_DETAIL: (id: string) => `/api/v1/inventory-items/${id}`,
  INVENTORY_CATEGORIES: '/api/v1/inventory-categories',

  // Settings/Configuration
  CURRENCIES: '/api/v1/currencies',
  SETTINGS: '/api/v1/settings',
};
