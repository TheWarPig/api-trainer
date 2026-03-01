import type { User, Product, Order, Category, Review, Coupon } from './store';

const STORAGE_KEY = 'api-trainer-mock-data';

export interface MockData {
  users: User[];
  products: Product[];
  orders: Order[];
  categories: Category[];
  reviews: Review[];
  coupons: Coupon[];
  nextUserId: number;
  nextProductId: number;
  nextOrderId: number;
  nextCategoryId: number;
  nextReviewId: number;
  nextCouponId: number;
}

export function getMockData(): MockData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as MockData;
    // Migrate stale localStorage from before categories/reviews/coupons were added
    if (!Array.isArray(data.categories)) data.categories = [];
    if (!Array.isArray(data.reviews))    data.reviews    = [];
    if (!Array.isArray(data.coupons))    data.coupons    = [];
    if (!data.nextCategoryId) data.nextCategoryId = 1;
    if (!data.nextReviewId)   data.nextReviewId   = 1;
    if (!data.nextCouponId)   data.nextCouponId   = 1;
    return data;
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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // Treat stale data (missing new collections) as not initialized so it re-seeds
    return Array.isArray(data.categories) && Array.isArray(data.reviews) && Array.isArray(data.coupons);
  } catch {
    return false;
  }
}
