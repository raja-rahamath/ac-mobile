import { api } from './apiClient';
import { ENDPOINTS } from '../constants/api';

export interface ServiceType {
  id: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  icon: string;
  color: string;
}

interface ServiceTypesResponse {
  success: boolean;
  data: ServiceType[];
}

// Fallback service types when API is not available
const FALLBACK_SERVICE_TYPES: ServiceType[] = [
  { id: 'plumbing', name: 'Plumbing', nameAr: 'السباكة', description: null, icon: 'water', color: '#3b82f6' },
  { id: 'electrical', name: 'Electrical', nameAr: 'الكهرباء', description: null, icon: 'flash', color: '#f59e0b' },
  { id: 'hvac', name: 'AC Maintenance', nameAr: 'صيانة المكيفات', description: null, icon: 'snow', color: '#06b6d4' },
  { id: 'cleaning', name: 'Cleaning', nameAr: 'التنظيف', description: null, icon: 'sparkles', color: '#10b981' },
  { id: 'general', name: 'General Maintenance', nameAr: 'الصيانة العامة', description: null, icon: 'construct', color: '#64748b' },
];

export async function getServiceTypes(): Promise<ServiceType[]> {
  try {
    const response = await api.get<ServiceTypesResponse>(ENDPOINTS.SERVICE_TYPES);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch service types:', error);
    // Return fallback values if API fails
    return FALLBACK_SERVICE_TYPES;
  }
}
