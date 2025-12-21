import { ENDPOINTS } from '../constants/api';
import { api } from './apiClient';
import type { Property } from '../types';

export type OwnershipType = 'OWNER' | 'TENANT' | 'PROPERTY_MANAGER' | 'AUTHORIZED_CONTACT';

export interface RegisterPropertyInput {
  flat: string;
  building: string;
  road: string;
  block: string;
  areaName: string;
  ownershipType?: OwnershipType;
  isPrimary?: boolean;
}

export interface Area {
  id: string;
  name: string;
  nameAr?: string;
}

export async function getMyProperties(): Promise<Property[]> {
  console.log('[PropertyService] getMyProperties called');

  try {
    const data = await api.get(ENDPOINTS.MY_PROPERTIES);
    console.log('[PropertyService] Raw response data:', JSON.stringify(data));

    // Transform the backend response to match our Property type
    const properties: Property[] = (data.data || data || []).map((item: any) => ({
      id: item.unitId || item.id,
      unitNo: item.unit?.unitNo || item.unit || '',
      building: item.unit?.building || item.building,
      type: item.unit?.type || item.type || item.propertyType,
      ownershipType: item.ownershipType || 'TENANT',
      isPrimary: item.isPrimary || false,
      address: item.address || item.name || formatAddress(item),
    }));

    console.log('[PropertyService] Transformed properties count:', properties.length);
    return properties;
  } catch (error: any) {
    // If endpoint doesn't exist yet, return empty array
    if (error.message?.includes('404')) {
      console.log('[PropertyService] 404 - returning empty array');
      return [];
    }
    throw error;
  }
}

function formatAddress(item: any): string {
  // Use direct address field if available
  if (item.address) {
    return item.address;
  }

  // Build address from components
  const parts: string[] = [];

  // Handle unit - can be string or object
  const unitNo = typeof item.unit === 'string' ? item.unit : item.unit?.unitNo || item.unitNo;
  if (unitNo) {
    parts.push(`Unit ${unitNo}`);
  }

  // Handle building - can be string or object
  const buildingName = typeof item.building === 'string' ? item.building : item.building?.name;
  if (buildingName) {
    parts.push(`Building ${buildingName}`);
  }

  // Handle area
  const areaName = item.area || item.building?.area?.name;
  if (areaName) {
    parts.push(areaName);
  }

  return parts.join(', ') || 'Unknown Address';
}

export async function registerProperty(input: RegisterPropertyInput): Promise<Property> {
  const data = await api.post(ENDPOINTS.REGISTER_PROPERTY, {
    flat: input.flat,
    building: input.building,
    road: input.road,
    block: input.block,
    areaName: input.areaName,
    ownershipType: input.ownershipType || 'TENANT',
    isPrimary: input.isPrimary ?? true,
  });
  return data.data || data;
}

export async function getAreas(search?: string): Promise<Area[]> {
  try {
    let url = ENDPOINTS.AREAS;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const data = await api.get(url);
    const areas = data.data || data || [];

    // Ensure we always return an array
    if (!Array.isArray(areas)) {
      console.warn('[PropertyService] Areas response is not an array:', areas);
      return [];
    }

    return areas;
  } catch (error) {
    console.error('[PropertyService] Failed to fetch areas:', error);
    throw error;
  }
}
