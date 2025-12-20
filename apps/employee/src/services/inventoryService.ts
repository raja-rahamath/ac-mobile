import { api } from './apiClient';
import { ENDPOINTS } from '../constants/api';
import type { InventoryItem, InventoryCategory, Currency, ApiResponse } from '../types';

// Get all inventory items
export async function getInventoryItems(filters?: {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
}): Promise<InventoryItem[]> {
  const params = new URLSearchParams();

  if (filters?.categoryId) params.append('categoryId', filters.categoryId);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

  const queryString = params.toString();
  const url = queryString ? `${ENDPOINTS.INVENTORY_ITEMS}?${queryString}` : ENDPOINTS.INVENTORY_ITEMS;

  const response = await api.get<ApiResponse<InventoryItem[]> | InventoryItem[]>(url);

  // Handle both direct array and wrapped response
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || [];
}

// Get inventory item by ID
export async function getInventoryItemById(id: string): Promise<InventoryItem> {
  const response = await api.get<ApiResponse<InventoryItem> | InventoryItem>(
    ENDPOINTS.INVENTORY_ITEM_DETAIL(id)
  );

  // Handle both direct response and wrapped response
  if ('data' in response && response.data) {
    return response.data as InventoryItem;
  }
  return response as InventoryItem;
}

// Get inventory categories
export async function getInventoryCategories(): Promise<InventoryCategory[]> {
  const response = await api.get<ApiResponse<InventoryCategory[]> | InventoryCategory[]>(
    ENDPOINTS.INVENTORY_CATEGORIES
  );

  // Handle both direct array and wrapped response
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || [];
}

// Get default currency (BHD)
export async function getDefaultCurrency(): Promise<Currency> {
  try {
    const response = await api.get<ApiResponse<Currency[]> | Currency[]>(ENDPOINTS.CURRENCIES);

    let currencies: Currency[];
    if (Array.isArray(response)) {
      currencies = response;
    } else {
      currencies = response.data || [];
    }

    // Find default currency or return BHD
    const defaultCurrency = currencies.find((c) => c.isDefault) || currencies[0];

    if (defaultCurrency) {
      return defaultCurrency;
    }
  } catch (error) {
    console.log('Error fetching currencies, using default BHD:', error);
  }

  // Fallback to BHD
  return {
    id: 'default',
    code: 'BHD',
    name: 'Bahraini Dinar',
    symbol: 'BD',
    symbolPosition: 'before',
    decimalPlaces: 3,
    isDefault: true,
    isActive: true,
  };
}

// Format currency value
export function formatCurrency(
  amount: number,
  currency: Currency = {
    id: 'default',
    code: 'BHD',
    name: 'Bahraini Dinar',
    symbol: 'BD',
    symbolPosition: 'before',
    decimalPlaces: 3,
    isDefault: true,
    isActive: true,
  }
): string {
  const formattedAmount = amount.toFixed(currency.decimalPlaces);

  if (currency.symbolPosition === 'after') {
    return `${formattedAmount} ${currency.symbol}`;
  }
  return `${currency.symbol} ${formattedAmount}`;
}
