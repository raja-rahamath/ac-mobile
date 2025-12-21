import { ENDPOINTS } from '../constants/api';
import { api } from './apiClient';
import type { ServiceRequest, ServiceCategory } from '../types';

interface ServiceRequestsResponse {
  data: ServiceRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Map complaint type names to mobile categories
const COMPLAINT_TYPE_TO_CATEGORY: Record<string, ServiceCategory> = {
  'Plumbing': 'plumbing',
  'Electrical': 'electrical',
  'AC Maintenance': 'hvac',
  'HVAC': 'hvac',
  'General Maintenance': 'general',
  'Cleaning': 'cleaning',
  'Pest Control': 'pest_control',
  'Landscaping': 'landscaping',
};

// Build formatted address from property components
function formatPropertyAddress(property: any): string {
  if (!property) return 'No address specified';

  // If full address is available, use it
  if (property.address) {
    return property.address;
  }

  // Build address from components: Flat, Building, Road, Block, Area
  const parts: string[] = [];

  if (property.flat || property.unitNo) {
    parts.push(`Flat: ${property.flat || property.unitNo}`);
  }
  if (property.building) {
    parts.push(`Building: ${property.building}`);
  }
  if (property.road) {
    parts.push(`Road: ${property.road}`);
  }
  if (property.block) {
    parts.push(`Block: ${property.block}`);
  }
  if (property.area || property.areaName) {
    parts.push(`Area: ${property.area || property.areaName}`);
  }

  if (parts.length > 0) {
    return parts.join(', ');
  }

  // Fallback to name if available
  return property.name || 'No address specified';
}

// Transform API response to mobile-friendly format
function transformServiceRequest(apiItem: any): ServiceRequest {
  // Build property address from unit/building or property
  let propertyAddress = 'No address specified';
  if (apiItem.unit) {
    const building = apiItem.unit.building;
    const parts: string[] = [];

    if (apiItem.unit.unitNo || apiItem.unit.flatNumber) {
      parts.push(`Flat: ${apiItem.unit.unitNo || apiItem.unit.flatNumber}`);
    }
    if (building?.name) {
      parts.push(`Building: ${building.name}`);
    }
    if (building?.road) {
      parts.push(`Road: ${building.road}`);
    }
    if (building?.block) {
      parts.push(`Block: ${building.block}`);
    }
    if (building?.area?.name) {
      parts.push(`Area: ${building.area.name}`);
    }

    propertyAddress = parts.length > 0 ? parts.join(', ') : 'No address specified';
  } else if (apiItem.property) {
    propertyAddress = formatPropertyAddress(apiItem.property);
  }

  // Map complaint type to category
  const category: ServiceCategory = apiItem.complaintType?.name
    ? COMPLAINT_TYPE_TO_CATEGORY[apiItem.complaintType.name] || 'general'
    : 'general';

  // Map assigned employee to technician
  const assignedTechnician = apiItem.assignedTo
    ? {
        id: apiItem.assignedTo.id,
        name: `${apiItem.assignedTo.firstName || ''} ${apiItem.assignedTo.lastName || ''}`.trim() || 'Unknown',
        phone: apiItem.assignedTo.phone,
      }
    : undefined;

  return {
    id: apiItem.id,
    requestNo: apiItem.requestNo, // SR-00001 format
    title: apiItem.title,
    description: apiItem.description || '',
    category,
    status: apiItem.status,
    priority: (apiItem.priority || 'MEDIUM').toLowerCase() as any,
    propertyId: apiItem.unit?.id || apiItem.property?.id,
    propertyAddress,
    scheduledDate: apiItem.startedAt,
    assignedTechnician,
    createdAt: apiItem.createdAt,
    updatedAt: apiItem.createdAt, // API doesn't return updatedAt in list view
  };
}

// Statuses that are considered "active" (not completed/cancelled/closed)
const ACTIVE_STATUSES = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'pending', 'confirmed', 'assigned', 'en_route', 'in_progress'];

export async function getServiceRequests(
  filter?: 'all' | 'active' | 'completed'
): Promise<ServiceRequestsResponse> {
  let url = ENDPOINTS.SERVICE_REQUESTS;

  // Add filter query params
  const params = new URLSearchParams();
  if (filter === 'completed') {
    params.append('status', 'COMPLETED');
  }
  // For 'active' and 'all', fetch all and filter client-side
  // This is because API may not support multiple status values

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const data = await api.get(url);
  let rawData = data.data || [];

  // Client-side filter for active requests
  if (filter === 'active') {
    rawData = rawData.filter((item: any) => ACTIVE_STATUSES.includes(item.status));
  }

  return {
    data: rawData.map(transformServiceRequest),
    pagination: data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest> {
  const data = await api.get(ENDPOINTS.SERVICE_REQUEST_DETAIL(id));
  return data.data || data;
}

export interface CreateServiceRequestInput {
  title: string;
  description: string;
  category: string;
  priority: string;
  propertyId?: string;
}

export async function createServiceRequest(
  input: CreateServiceRequestInput
): Promise<ServiceRequest> {
  const data = await api.post(ENDPOINTS.SERVICE_REQUESTS, input);
  const rawData = data.data || data;
  // Return raw data with requestNo preserved
  return {
    ...rawData,
    requestNo: rawData.requestNo || rawData.request_no, // Handle both formats
  };
}

export async function cancelServiceRequest(id: string): Promise<{ message: string; requestNo: string }> {
  const data = await api.post(`${ENDPOINTS.SERVICE_REQUESTS}/${id}/cancel`, {});
  return data.data || data;
}

export interface ClassificationResult {
  suggestedTypeId: string;
  suggestedTypeName: string;
  confidence: 'high' | 'medium' | 'low';
  matches: boolean;
  explanation: string;
}

export async function classifyServiceType(
  title: string,
  description: string,
  selectedTypeId?: string
): Promise<ClassificationResult> {
  const data = await api.post(ENDPOINTS.CLASSIFY_SERVICE, {
    title,
    description,
    selectedTypeId,
  });
  return data.data || data;
}
