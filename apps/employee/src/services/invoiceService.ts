import { api } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import type { Invoice, Payment, Receipt, ApiResponse } from '../types';

// Generate invoice from service request
export async function generateInvoice(serviceRequestId: string): Promise<Invoice> {
  const response = await api.post<ApiResponse<Invoice>>(
    ENDPOINTS.INVOICE_FROM_SERVICE_REQUEST(serviceRequestId),
    {}
  );
  return response.data;
}

// Get invoice by ID
export async function getInvoiceById(id: string): Promise<Invoice> {
  const response = await api.get<ApiResponse<Invoice>>(ENDPOINTS.INVOICE_DETAIL(id));
  return response.data;
}

// Get invoices for a work order
export async function getInvoicesForWorkOrder(workOrderId: string): Promise<Invoice[]> {
  const response = await api.get<ApiResponse<Invoice[]>>(
    `${ENDPOINTS.INVOICES}?workOrderId=${workOrderId}`
  );
  return response.data || [];
}

// Update invoice
export async function updateInvoice(
  id: string,
  data: {
    items?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      itemType?: string;
    }>;
    notes?: string;
    taxRate?: number;
    discount?: number;
  }
): Promise<Invoice> {
  const response = await api.put<ApiResponse<Invoice>>(ENDPOINTS.INVOICE_DETAIL(id), data);
  return response.data;
}

// Record payment for invoice
export async function recordPayment(
  invoiceId: string,
  data: {
    amount: number;
    paymentMethod: 'CASH' | 'BENEFIT_PAY' | 'CARD' | 'BANK_TRANSFER';
    referenceNumber?: string;
    notes?: string;
  }
): Promise<Payment> {
  const response = await api.post<ApiResponse<Payment>>(
    ENDPOINTS.INVOICE_PAYMENTS(invoiceId),
    data
  );
  return response.data;
}

// Get payments for an invoice
export async function getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const response = await api.get<ApiResponse<Payment[]>>(ENDPOINTS.INVOICE_PAYMENTS(invoiceId));
  return response.data || [];
}

// Generate receipt from payment
export async function generateReceipt(paymentId: string): Promise<Receipt> {
  const response = await api.post<ApiResponse<Receipt>>(ENDPOINTS.RECEIPT_FROM_PAYMENT, {
    paymentId,
  });
  return response.data;
}

// Get receipt by ID
export async function getReceiptById(id: string): Promise<Receipt> {
  const response = await api.get<ApiResponse<Receipt>>(ENDPOINTS.RECEIPT_DETAIL(id));
  return response.data;
}

// Email receipt to customer
export async function emailReceipt(receiptId: string, email?: string): Promise<void> {
  await api.post(ENDPOINTS.RECEIPT_EMAIL(receiptId), { email });
}

// Helper to format currency
export function formatCurrency(amount: number, currency: string = 'BHD'): string {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Helper to calculate invoice totals
export function calculateInvoiceTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  taxRate: number = 0,
  discount: number = 0
): {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const discountAmount = discount;
  const total = subtotal + tax - discountAmount;

  return {
    subtotal,
    tax,
    discount: discountAmount,
    total: Math.max(0, total),
  };
}
