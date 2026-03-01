export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  age: number;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  featured: boolean;
  stock: number;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  active: boolean;
  expiresAt: string;
}

function createInitialData() {
  return {
    users: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' as const, age: 28, createdAt: '2024-01-15T10:00:00Z' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' as const, age: 34, createdAt: '2024-02-20T14:30:00Z' },
      { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'moderator' as const, age: 25, createdAt: '2024-03-10T09:15:00Z' },
      { id: 4, name: 'David Chen', email: 'david@example.com', role: 'user' as const, age: 29, createdAt: '2024-04-05T11:00:00Z' },
      { id: 5, name: 'Eva Martinez', email: 'eva@example.com', role: 'user' as const, age: 22, createdAt: '2024-05-01T08:30:00Z' },
      { id: 6, name: 'Frank Wilson', email: 'frank@example.com', role: 'admin' as const, age: 41, createdAt: '2024-06-12T16:45:00Z' },
    ] as User[],
    products: [
      { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'electronics', featured: true, stock: 50, createdAt: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Mechanical Keyboard', price: 149.99, category: 'electronics', featured: false, stock: 30, createdAt: '2024-01-02T00:00:00Z' },
      { id: 3, name: 'Ergonomic Mouse', price: 59.99, category: 'electronics', featured: true, stock: 100, createdAt: '2024-01-03T00:00:00Z' },
      { id: 4, name: 'JavaScript: The Good Parts', price: 29.99, category: 'books', featured: false, stock: 200, createdAt: '2024-02-01T00:00:00Z' },
      { id: 5, name: 'Running Shoes', price: 79.99, category: 'sports', featured: true, stock: 45, createdAt: '2024-02-15T00:00:00Z' },
      { id: 6, name: 'Cotton T-Shirt', price: 19.99, category: 'clothing', featured: false, stock: 500, createdAt: '2024-03-01T00:00:00Z' },
      { id: 7, name: 'VS Code Extension Pack', price: 9.99, category: 'software', featured: false, stock: 999, createdAt: '2024-03-20T00:00:00Z' },
      { id: 8, name: 'Smart Watch', price: 249.99, category: 'electronics', featured: true, stock: 15, createdAt: '2024-04-01T00:00:00Z' },
    ] as Product[],
    orders: [
      { id: 1, userId: 1, productId: 1, quantity: 1, status: 'delivered' as const, total: 99.99, createdAt: '2024-02-01T00:00:00Z' },
      { id: 2, userId: 1, productId: 3, quantity: 2, status: 'shipped' as const, total: 119.98, createdAt: '2024-02-15T00:00:00Z' },
      { id: 3, userId: 2, productId: 2, quantity: 1, status: 'processing' as const, total: 149.99, createdAt: '2024-03-01T00:00:00Z' },
      { id: 4, userId: 4, productId: 5, quantity: 1, status: 'delivered' as const, total: 79.99, createdAt: '2024-03-15T00:00:00Z' },
      { id: 5, userId: 5, productId: 4, quantity: 1, status: 'pending' as const, total: 29.99, createdAt: '2024-04-10T00:00:00Z' },
      { id: 6, userId: 2, productId: 8, quantity: 1, status: 'shipped' as const, total: 249.99, createdAt: '2024-04-20T00:00:00Z' },
      { id: 7, userId: 3, productId: 6, quantity: 3, status: 'delivered' as const, total: 59.97, createdAt: '2024-05-01T00:00:00Z' },
    ] as Order[],
    categories: [
      { id: 1, name: 'Electronics', description: 'Gadgets, devices and accessories', slug: 'electronics', createdAt: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Books', description: 'Physical and digital books', slug: 'books', createdAt: '2024-01-01T00:00:00Z' },
      { id: 3, name: 'Sports', description: 'Sports and outdoor gear', slug: 'sports', createdAt: '2024-01-01T00:00:00Z' },
      { id: 4, name: 'Clothing', description: 'Fashion and apparel', slug: 'clothing', createdAt: '2024-01-01T00:00:00Z' },
      { id: 5, name: 'Software', description: 'Desktop and SaaS software', slug: 'software', createdAt: '2024-01-01T00:00:00Z' },
    ] as Category[],
    reviews: [
      { id: 1, productId: 1, userId: 2, rating: 5, comment: 'Amazing sound quality!', createdAt: '2024-02-05T00:00:00Z' },
      { id: 2, productId: 1, userId: 3, rating: 4, comment: 'Great headphones, solid battery.', createdAt: '2024-02-10T00:00:00Z' },
      { id: 3, productId: 2, userId: 1, rating: 5, comment: 'Best keyboard I have ever used.', createdAt: '2024-02-20T00:00:00Z' },
      { id: 4, productId: 3, userId: 4, rating: 3, comment: 'Decent mouse, nothing special.', createdAt: '2024-03-05T00:00:00Z' },
      { id: 5, productId: 4, userId: 5, rating: 4, comment: 'A must-read for JS developers.', createdAt: '2024-03-20T00:00:00Z' },
      { id: 6, productId: 5, userId: 4, rating: 5, comment: 'Super comfortable for long runs.', createdAt: '2024-04-01T00:00:00Z' },
      { id: 7, productId: 6, userId: 2, rating: 2, comment: 'Fabric quality is mediocre.', createdAt: '2024-04-15T00:00:00Z' },
    ] as Review[],
    coupons: [
      { id: 1, code: 'SAVE10', discountPercent: 10, minOrderAmount: 0, active: true, expiresAt: '2025-12-31T23:59:59Z' },
      { id: 2, code: 'SUMMER25', discountPercent: 25, minOrderAmount: 50, active: true, expiresAt: '2025-08-31T23:59:59Z' },
      { id: 3, code: 'FLASH50', discountPercent: 50, minOrderAmount: 100, active: true, expiresAt: '2025-03-01T23:59:59Z' },
      { id: 4, code: 'VIP20', discountPercent: 20, minOrderAmount: 0, active: false, expiresAt: '2025-12-31T23:59:59Z' },
    ] as Coupon[],
    nextUserId: 7,
    nextProductId: 9,
    nextOrderId: 8,
    nextCategoryId: 6,
    nextReviewId: 8,
    nextCouponId: 5,
  };
}

export const db = createInitialData();

export function resetDb() {
  const fresh = createInitialData();
  db.users = fresh.users;
  db.products = fresh.products;
  db.orders = fresh.orders;
  db.categories = fresh.categories;
  db.reviews = fresh.reviews;
  db.coupons = fresh.coupons;
  db.nextUserId = fresh.nextUserId;
  db.nextProductId = fresh.nextProductId;
  db.nextOrderId = fresh.nextOrderId;
  db.nextCategoryId = fresh.nextCategoryId;
  db.nextReviewId = fresh.nextReviewId;
  db.nextCouponId = fresh.nextCouponId;
}
