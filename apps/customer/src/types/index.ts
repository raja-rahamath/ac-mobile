export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  status: ServiceStatus;
  priority: Priority;
  propertyId?: string;
  propertyAddress?: string;
  scheduledDate?: string;
  assignedTechnician?: Technician;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

export type ServiceCategory =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'appliance'
  | 'general'
  | 'cleaning'
  | 'pest_control'
  | 'landscaping';

export type ServiceStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Technician {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  specialties?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  agentName?: string;
  agentAvatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}
