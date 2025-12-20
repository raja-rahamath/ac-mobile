// Employee/Technician Types

export interface Employee {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string;
  lastNameAr?: string;
  email: string;
  phone?: string;
  jobTitle?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
  zones?: EmployeeZone[];
  isActive: boolean;
}

export interface EmployeeZone {
  zoneId: string;
  zoneName: string;
  role: 'PRIMARY_HEAD' | 'SECONDARY_HEAD' | 'TECHNICIAN' | 'HELPER';
  isPrimary: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
    displayName: string;
  };
  employee?: Employee;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Work Order Types
export type WorkOrderStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REQUIRES_FOLLOWUP';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export interface WorkOrder {
  id: string;
  workOrderNo: string;
  title: string;
  description?: string;
  scope?: string;
  specialInstructions?: string;
  notes?: string;
  workPerformed?: string;
  status: WorkOrderStatus;
  priority: Priority;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: number; // minutes
  startedAt?: string;
  completedAt?: string;
  actualDuration?: number; // minutes
  serviceRequest?: ServiceRequest;
  serviceRequestId?: string;
  customer?: Customer;
  property?: Property;
  team?: WorkOrderTeamMember[];
  items?: WorkOrderItem[];
  labor?: WorkOrderLabor[];
  photos?: WorkOrderPhoto[];
  checklist?: WorkOrderChecklistItem[];
  checklists?: WorkOrderChecklist[];
  technicianNotes?: string;
  customerFeedback?: string;
  technicianSignature?: string;
  customerSignature?: string;
  signedAt?: string;
  laborCost?: number;
  materialCost?: number;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface ServiceRequest {
  id: string;
  requestNo: string;
  title: string;
  description?: string;
  status: string;
  priority: Priority;
  customer?: Customer;
  property?: Property;
  unit?: Unit;
  complaintType?: {
    id: string;
    code: string;
    name: string;
  };
  zone?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt?: string;
  attachments?: RequestAttachment[];
}

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerNo: string;
  firstName?: string;
  lastName?: string;
  orgName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  customerType: 'INDIVIDUAL' | 'ORGANIZATION';
}

export interface Property {
  id: string;
  propertyNo: string;
  name?: string;
  address?: string;
  building?: string;
  floor?: string;
  unit?: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  areaRef?: Area;
}

export interface Area {
  id: string;
  name: string;
  nameAr?: string;
  code?: string;
}

export interface Block {
  id: string;
  blockNo: string;
  name?: string;
  area?: Area;
}

export interface Road {
  id: string;
  roadNo: string;
  name?: string;
}

export interface Building {
  id: string;
  buildingNo: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  block?: Block;
  road?: Road;
  area?: Area;
}

export interface Unit {
  id: string;
  unitNo: string;
  flatNumber?: string;
  floor?: number;
  building?: Building;
}

export interface WorkOrderTeamMember {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  role: 'LEAD' | 'HELPER';
  isLead: boolean;
}

export interface WorkOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType: 'MATERIAL' | 'PART' | 'CONSUMABLE';
}

export interface WorkOrderLabor {
  id: string;
  employeeId: string;
  employeeName?: string;
  clockInAt: string;
  clockOutAt?: string;
  breakTime?: number; // minutes
  travelTime?: number; // minutes
  actualWorkTime?: number; // minutes
}

export interface WorkOrderPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  photoType: 'BEFORE' | 'DURING' | 'AFTER' | 'ISSUE' | 'SIGNATURE' | 'OTHER';
  caption?: string;
  takenAt: string;
  latitude?: number;
  longitude?: number;
}

export interface WorkOrderChecklist {
  id: string;
  checklistItem: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

// Invoice Types
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNo: string;
  serviceRequestId?: string;
  workOrderId?: string;
  customerId: string;
  customer?: Customer;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  totalAmount?: number; // Alias for total
  paidAmount: number;
  dueDate?: string;
  paidAt?: string;
  items: InvoiceItem[];
  payments?: Payment[];
  createdAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemType: 'SERVICE' | 'MATERIAL' | 'LABOR';
}

// Payment Types
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'BENEFIT_PAY' | 'CHEQUE' | 'ONLINE';

export interface Payment {
  id: string;
  paymentNo: string;
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
  receivedAt: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  invoiceId: string;
  paymentId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: 'ACTIVE' | 'VOIDED';
  receiptDate: string;
  customer?: Customer;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Job Filter for UI
export type JobFilter = 'all' | 'pending' | 'active' | 'completed';

// Inventory Types
export interface InventoryCategory {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  itemNo: string;
  name: string;
  nameAr?: string;
  categoryId: string;
  category?: InventoryCategory;
  description?: string;
  unit: string;
  unitPrice: number;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  isActive: boolean;
}

// Currency Types
export interface Currency {
  id: string;
  code: string;
  name: string;
  nameAr?: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalPlaces: number;
  isDefault: boolean;
  isActive: boolean;
}

// App Settings
export interface AppSettings {
  currency: Currency;
  language: 'en' | 'ar';
}
