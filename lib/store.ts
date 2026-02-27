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

function createInitialData() {
  return {
    users: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' as const, age: 28, createdAt: '2024-01-15T10:00:00Z' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' as const, age: 34, createdAt: '2024-02-20T14:30:00Z' },
      { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'moderator' as const, age: 25, createdAt: '2024-03-10T09:15:00Z' },
    ] as User[],
    products: [
      { id: 1, name: 'Wireless Headphones', price: 99.99, category: 'electronics', featured: true, stock: 50, createdAt: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Mechanical Keyboard', price: 149.99, category: 'electronics', featured: false, stock: 30, createdAt: '2024-01-02T00:00:00Z' },
      { id: 3, name: 'Ergonomic Mouse', price: 59.99, category: 'electronics', featured: true, stock: 100, createdAt: '2024-01-03T00:00:00Z' },
    ] as Product[],
    orders: [
      { id: 1, userId: 1, productId: 1, quantity: 1, status: 'delivered' as const, total: 99.99, createdAt: '2024-02-01T00:00:00Z' },
      { id: 2, userId: 1, productId: 3, quantity: 2, status: 'shipped' as const, total: 119.98, createdAt: '2024-02-15T00:00:00Z' },
      { id: 3, userId: 2, productId: 2, quantity: 1, status: 'processing' as const, total: 149.99, createdAt: '2024-03-01T00:00:00Z' },
    ] as Order[],
    nextUserId: 4,
    nextProductId: 4,
    nextOrderId: 4,
  };
}

export const db = createInitialData();

export function resetDb() {
  const fresh = createInitialData();
  db.users = fresh.users;
  db.products = fresh.products;
  db.orders = fresh.orders;
  db.nextUserId = fresh.nextUserId;
  db.nextProductId = fresh.nextProductId;
  db.nextOrderId = fresh.nextOrderId;
}
