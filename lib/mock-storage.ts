import type { User, Product, Order } from './store';

const STORAGE_KEY = 'api-trainer-mock-data';

export interface MockData {
  users: User[];
  products: Product[];
  orders: Order[];
  nextUserId: number;
  nextProductId: number;
  nextOrderId: number;
}

export function getMockData(): MockData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockData) : null;
  } catch {
    return null;
  }
}

export const MOCK_DATA_EVENT = 'mock-data-updated';

export function setMockData(data: MockData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(MOCK_DATA_EVENT));
  } catch { /* quota exceeded — silently ignore */ }
}

export function isMockDataInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
