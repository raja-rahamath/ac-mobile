import { api, uploadFile } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import type {
  WorkOrder,
  WorkOrderStatus,
  WorkOrderItem,
  WorkOrderPhoto,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// Get list of work orders assigned to the current technician
export async function getMyJobs(filters?: {
  status?: WorkOrderStatus | WorkOrderStatus[];
  priority?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<WorkOrder>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach(s => params.append('status', s));
    } else {
      params.append('status', filters.status);
    }
  }
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  // Filter by assigned to me
  params.append('assignedToMe', 'true');

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.WORK_ORDERS}?${queryString}` : ENDPOINTS.WORK_ORDERS;

  const response = await api.get<ApiResponse<WorkOrder[]>>(url);

  // Handle both array response and paginated response
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      pagination: {
        page: 1,
        limit: response.data.length,
        total: response.data.length,
        totalPages: 1,
      },
    };
  }

  return response as unknown as PaginatedResponse<WorkOrder>;
}

// Get a single work order by ID
export async function getJobById(id: string): Promise<WorkOrder> {
  const response = await api.get<WorkOrder | ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_DETAIL(id));
  // Handle both direct response and wrapped response
  return 'data' in response && response.data ? response.data as WorkOrder : response as WorkOrder;
}

// Mark technician as en route to job site
export async function startRoute(id: string, data?: { employeeId: string; notes?: string; latitude?: number; longitude?: number }): Promise<WorkOrder> {
  const response = await api.post<WorkOrder | ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_EN_ROUTE(id), data || {});
  // Handle both direct response and wrapped response
  return 'data' in response && response.data ? response.data as WorkOrder : response as WorkOrder;
}

// Mark technician as arrived at job site
export async function markArrived(id: string, data?: { employeeId: string; notes?: string; latitude?: number; longitude?: number }): Promise<WorkOrder> {
  const response = await api.post<WorkOrder | ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_ARRIVE(id), data || {});
  // Handle both direct response and wrapped response
  return 'data' in response && response.data ? response.data as WorkOrder : response as WorkOrder;
}

// Start work on the job
export async function startWork(id: string, data?: { employeeId: string; notes?: string }): Promise<WorkOrder> {
  const response = await api.post<WorkOrder | ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_START(id), data || {});
  // Handle both direct response and wrapped response
  return 'data' in response && response.data ? response.data as WorkOrder : response as WorkOrder;
}

// Clock in to work order
export async function clockIn(
  id: string,
  data: { employeeId: string; notes?: string }
): Promise<WorkOrder> {
  const response = await api.post<WorkOrder | ApiResponse<WorkOrder>>(
    ENDPOINTS.WORK_ORDER_CLOCK_IN(id),
    {
      employeeId: data.employeeId,
      notes: data.notes,
    }
  );
  // Handle both direct response and wrapped response
  return 'data' in response && response.data ? response.data as WorkOrder : response as WorkOrder;
}

// Clock out from work order
export async function clockOut(
  id: string,
  data: { employeeId: string; breakMinutes?: number; notes?: string }
): Promise<WorkOrder> {
  const response = await api.post<WorkOrder | ApiResponse<WorkOrder>>(
    ENDPOINTS.WORK_ORDER_CLOCK_OUT(id),
    {
      employeeId: data.employeeId,
      breakMinutes: data.breakMinutes || 0,
      notes: data.notes,
    }
  );
  // Handle both direct response and wrapped response
  return 'data' in response && response.data ? response.data as WorkOrder : response as WorkOrder;
}

// Put work order on hold
export async function putOnHold(id: string, data: { reason: string }): Promise<WorkOrder> {
  const response = await api.post<ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_HOLD(id), data);
  return response.data;
}

// Resume work order from hold
export async function resumeWork(id: string, data?: { notes?: string }): Promise<WorkOrder> {
  const response = await api.post<ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_RESUME(id), data || {});
  return response.data;
}

// Complete work order
export async function completeJob(
  id: string,
  data: {
    workPerformed?: string;
    technicianNotes?: string;
    customerFeedback?: string;
    technicianSignature?: string;
    customerSignature?: string;
  }
): Promise<WorkOrder> {
  const response = await api.post<ApiResponse<WorkOrder>>(ENDPOINTS.WORK_ORDER_COMPLETE(id), data);
  return response.data;
}

// Add item/material to work order
export async function addItem(
  workOrderId: string,
  item: {
    description: string;
    quantity: number;
    unitPrice: number;
    itemType: 'MATERIAL' | 'PART' | 'CONSUMABLE';
  }
): Promise<WorkOrderItem> {
  const response = await api.post<ApiResponse<WorkOrderItem>>(
    ENDPOINTS.WORK_ORDER_ITEMS(workOrderId),
    item
  );
  return response.data;
}

// Remove item from work order
export async function removeItem(workOrderId: string, itemId: string): Promise<void> {
  await api.delete(`${ENDPOINTS.WORK_ORDER_ITEMS(workOrderId)}/${itemId}`);
}

// Upload photo to work order
export async function uploadPhoto(
  workOrderId: string,
  photo: {
    uri: string;
    type: string;
    name: string;
  },
  photoType: 'BEFORE' | 'DURING' | 'AFTER' | 'ISSUE' | 'OTHER',
  caption?: string,
  location?: { latitude: number; longitude: number }
): Promise<WorkOrderPhoto> {
  const formData = new FormData();

  // Add the file
  formData.append('file', {
    uri: photo.uri,
    type: photo.type || 'image/jpeg',
    name: photo.name || 'photo.jpg',
  } as any);

  // Add metadata
  formData.append('photoType', photoType);
  if (caption) formData.append('caption', caption);
  if (location) {
    formData.append('latitude', String(location.latitude));
    formData.append('longitude', String(location.longitude));
  }

  const response = await uploadFile<ApiResponse<WorkOrderPhoto>>(
    ENDPOINTS.WORK_ORDER_PHOTOS(workOrderId),
    formData
  );

  return response.data;
}

// Get photos for a work order
export async function getPhotos(workOrderId: string): Promise<WorkOrderPhoto[]> {
  const response = await api.get<ApiResponse<WorkOrderPhoto[]>>(
    ENDPOINTS.WORK_ORDER_PHOTOS(workOrderId)
  );
  return response.data || [];
}

// Delete photo from work order
export async function deletePhoto(workOrderId: string, photoId: string): Promise<void> {
  await api.delete(`${ENDPOINTS.WORK_ORDER_PHOTOS(workOrderId)}/${photoId}`);
}

// Update checklist item
export async function updateChecklist(
  workOrderId: string,
  checklistId: string,
  data: { isCompleted: boolean; notes?: string }
): Promise<void> {
  await api.put(`${ENDPOINTS.WORK_ORDER_CHECKLIST(workOrderId)}/${checklistId}`, data);
}

// Update employee location
export async function updateLocation(latitude: number, longitude: number): Promise<void> {
  await api.post(ENDPOINTS.EMPLOYEE_LOCATION, { latitude, longitude });
}

// Helper to get status display info
export function getStatusInfo(status: WorkOrderStatus): {
  label: string;
  color: string;
  icon: string;
} {
  const statusMap: Record<WorkOrderStatus, { label: string; color: string; icon: string }> = {
    PENDING: { label: 'Pending', color: '#f59e0b', icon: 'time' },
    SCHEDULED: { label: 'Scheduled', color: '#3b82f6', icon: 'calendar' },
    CONFIRMED: { label: 'Confirmed', color: '#06b6d4', icon: 'checkmark-circle' },
    EN_ROUTE: { label: 'En Route', color: '#8b5cf6', icon: 'navigate' },
    ARRIVED: { label: 'Arrived', color: '#14b8a6', icon: 'location' },
    IN_PROGRESS: { label: 'In Progress', color: '#10b981', icon: 'construct' },
    ON_HOLD: { label: 'On Hold', color: '#f59e0b', icon: 'pause' },
    COMPLETED: { label: 'Completed', color: '#22c55e', icon: 'checkmark-done' },
    CANCELLED: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle' },
    REQUIRES_FOLLOWUP: { label: 'Follow-up', color: '#f97316', icon: 'alert-circle' },
  };

  return statusMap[status] || { label: status, color: '#6b7280', icon: 'help-circle' };
}

// Helper to get priority display info
export function getPriorityInfo(priority: string): { label: string; color: string } {
  const priorityMap: Record<string, { label: string; color: string }> = {
    LOW: { label: 'Low', color: '#22c55e' },
    MEDIUM: { label: 'Medium', color: '#f59e0b' },
    HIGH: { label: 'High', color: '#ef4444' },
    EMERGENCY: { label: 'Emergency', color: '#dc2626' },
  };

  return priorityMap[priority] || { label: priority, color: '#6b7280' };
}
