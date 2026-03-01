import { neon } from '@netlify/neon';
import { levels as builtinLevels } from './levels';
import { builtinValidationMap } from './builtin-validation-map';
import type { SerializableLevel } from './types';

const sql = neon({ fetchOptions: { cache: 'no-store' } });

let initPromise: Promise<void> | null = null;

const SEED_ORDER = [1,2,3,4,12,13,14,5,6,7,11,15,16,8,9,17,18,19,10,20];

function buildSeedData(): SerializableLevel[] {
  const byId = new Map<number, SerializableLevel>();

  for (const level of builtinLevels) {
    const { validate, ...rest } = level;
    void validate;
    byId.set(level.id, {
      ...rest,
      validationRules: builtinValidationMap[level.id] || [],
      isBuiltIn: true,
      sortOrder: 0,
    });
  }

  const ordered: SerializableLevel[] = [];
  for (const id of SEED_ORDER) {
    const lvl = byId.get(id);
    if (lvl) {
      lvl.sortOrder = ordered.length;
      ordered.push(lvl);
    }
  }

  return ordered;
}

export function rowToLevel(row: Record<string, unknown>): SerializableLevel {
  return {
    id: row.id as number,
    sortOrder: row.sort_order as number,
    isBuiltIn: row.is_built_in as boolean,
    title: row.title as string,
    difficulty: row.difficulty as SerializableLevel['difficulty'],
    concept: row.concept as string,
    description: row.description as string,
    task: row.task as string,
    hints: (row.hints ?? []) as string[],
    successMessage: row.success_message as string,
    successCriteria: row.success_criteria as string,
    validationRules: (row.validation_rules ?? []) as SerializableLevel['validationRules'],
    defaultMethod: row.default_method as string,
    defaultUrl: row.default_url as string,
    defaultHeaders: (row.default_headers ?? undefined) as SerializableLevel['defaultHeaders'],
    defaultBody: (row.default_body ?? undefined) as string | undefined,
    endpoints: (row.endpoints ?? []) as SerializableLevel['endpoints'],
    tip: (row.tip ?? undefined) as string | undefined,
    multiStep: (row.multi_step ?? undefined) as SerializableLevel['multiStep'],
  };
}

async function doInit() {
  await sql`DROP TABLE IF EXISTS level_storage`;

  await sql`
    CREATE TABLE IF NOT EXISTS levels (
      id          INTEGER PRIMARY KEY,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      is_built_in BOOLEAN NOT NULL DEFAULT false,
      title       TEXT NOT NULL DEFAULT '',
      difficulty  TEXT NOT NULL DEFAULT 'Easy',
      concept     TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      task        TEXT NOT NULL DEFAULT '',
      hints       JSONB NOT NULL DEFAULT '[]',
      success_message   TEXT NOT NULL DEFAULT '',
      success_criteria  TEXT NOT NULL DEFAULT '',
      validation_rules  JSONB NOT NULL DEFAULT '[]',
      default_method    TEXT NOT NULL DEFAULT 'GET',
      default_url       TEXT NOT NULL DEFAULT '',
      default_headers   JSONB,
      default_body      TEXT,
      endpoints         JSONB NOT NULL DEFAULT '[]',
      tip               TEXT,
      multi_step        JSONB
    )
  `;

  const count = await sql`SELECT COUNT(*) as cnt FROM levels`;
  if (Number(count[0].cnt) === 0) {
    const seedData = buildSeedData();
    for (const level of seedData) {
      await sql`
        INSERT INTO levels (id, sort_order, is_built_in, title, difficulty, concept,
          description, task, hints, success_message, success_criteria, validation_rules,
          default_method, default_url, default_headers, default_body, endpoints, tip, multi_step)
        VALUES (
          ${level.id},
          ${level.sortOrder},
          ${level.isBuiltIn},
          ${level.title},
          ${level.difficulty},
          ${level.concept},
          ${level.description},
          ${level.task},
          ${JSON.stringify(level.hints)}::jsonb,
          ${level.successMessage},
          ${level.successCriteria},
          ${JSON.stringify(level.validationRules)}::jsonb,
          ${level.defaultMethod},
          ${level.defaultUrl},
          ${level.defaultHeaders ? JSON.stringify(level.defaultHeaders) : null}::jsonb,
          ${level.defaultBody ?? null},
          ${JSON.stringify(level.endpoints)}::jsonb,
          ${level.tip ?? null},
          ${level.multiStep ? JSON.stringify(level.multiStep) : null}::jsonb
        )
      `;
    }
  }
}

export async function ensureTable() {
  if (!initPromise) {
    initPromise = doInit();
  }
  await initPromise;
}

// ── Mock data tables ──

import type { User, Product, Order, Category, Review, Coupon } from './store';

let mockInitPromise: Promise<void> | null = null;

async function doMockInit() {
  await sql`
    CREATE TABLE IF NOT EXISTS mock_users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      age INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mock_products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      featured BOOLEAN NOT NULL DEFAULT false,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mock_orders (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL,
      total NUMERIC(10,2) NOT NULL,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mock_categories (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      slug TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mock_reviews (
      id INTEGER PRIMARY KEY,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mock_coupons (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL,
      discount_percent INTEGER NOT NULL,
      min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      expires_at TEXT NOT NULL
    )
  `;

  // Seed if empty
  const userCount = await sql`SELECT COUNT(*) as cnt FROM mock_users`;
  if (Number(userCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_users (id, name, email, role, age, created_at) VALUES
      (1, 'Alice Johnson', 'alice@example.com', 'admin', 28, '2024-01-15T10:00:00Z'),
      (2, 'Bob Smith', 'bob@example.com', 'user', 34, '2024-02-20T14:30:00Z'),
      (3, 'Carol Williams', 'carol@example.com', 'moderator', 25, '2024-03-10T09:15:00Z'),
      (4, 'David Chen', 'david@example.com', 'user', 29, '2024-04-05T11:00:00Z'),
      (5, 'Eva Martinez', 'eva@example.com', 'user', 22, '2024-05-01T08:30:00Z'),
      (6, 'Frank Wilson', 'frank@example.com', 'admin', 41, '2024-06-12T16:45:00Z')`;
  }

  const productCount = await sql`SELECT COUNT(*) as cnt FROM mock_products`;
  if (Number(productCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_products (id, name, price, category, featured, stock, created_at) VALUES
      (1, 'Wireless Headphones', 99.99, 'electronics', true, 50, '2024-01-01T00:00:00Z'),
      (2, 'Mechanical Keyboard', 149.99, 'electronics', false, 30, '2024-01-02T00:00:00Z'),
      (3, 'Ergonomic Mouse', 59.99, 'electronics', true, 100, '2024-01-03T00:00:00Z'),
      (4, 'JavaScript: The Good Parts', 29.99, 'books', false, 200, '2024-02-01T00:00:00Z'),
      (5, 'Running Shoes', 79.99, 'sports', true, 45, '2024-02-15T00:00:00Z'),
      (6, 'Cotton T-Shirt', 19.99, 'clothing', false, 500, '2024-03-01T00:00:00Z'),
      (7, 'VS Code Extension Pack', 9.99, 'software', false, 999, '2024-03-20T00:00:00Z'),
      (8, 'Smart Watch', 249.99, 'electronics', true, 15, '2024-04-01T00:00:00Z')`;
  }

  const orderCount = await sql`SELECT COUNT(*) as cnt FROM mock_orders`;
  if (Number(orderCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_orders (id, user_id, product_id, quantity, status, total, created_at) VALUES
      (1, 1, 1, 1, 'delivered', 99.99, '2024-02-01T00:00:00Z'),
      (2, 1, 3, 2, 'shipped', 119.98, '2024-02-15T00:00:00Z'),
      (3, 2, 2, 1, 'processing', 149.99, '2024-03-01T00:00:00Z'),
      (4, 4, 5, 1, 'delivered', 79.99, '2024-03-15T00:00:00Z'),
      (5, 5, 4, 1, 'pending', 29.99, '2024-04-10T00:00:00Z'),
      (6, 2, 8, 1, 'shipped', 249.99, '2024-04-20T00:00:00Z'),
      (7, 3, 6, 3, 'delivered', 59.97, '2024-05-01T00:00:00Z')`;
  }

  const categoryCount = await sql`SELECT COUNT(*) as cnt FROM mock_categories`;
  if (Number(categoryCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_categories (id, name, description, slug, created_at) VALUES
      (1, 'Electronics', 'Gadgets, devices and accessories', 'electronics', '2024-01-01T00:00:00Z'),
      (2, 'Books', 'Physical and digital books', 'books', '2024-01-01T00:00:00Z'),
      (3, 'Sports', 'Sports and outdoor gear', 'sports', '2024-01-01T00:00:00Z'),
      (4, 'Clothing', 'Fashion and apparel', 'clothing', '2024-01-01T00:00:00Z'),
      (5, 'Software', 'Desktop and SaaS software', 'software', '2024-01-01T00:00:00Z')`;
  }

  const reviewCount = await sql`SELECT COUNT(*) as cnt FROM mock_reviews`;
  if (Number(reviewCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_reviews (id, product_id, user_id, rating, comment, created_at) VALUES
      (1, 1, 2, 5, 'Amazing sound quality!', '2024-02-05T00:00:00Z'),
      (2, 1, 3, 4, 'Great headphones, solid battery.', '2024-02-10T00:00:00Z'),
      (3, 2, 1, 5, 'Best keyboard I have ever used.', '2024-02-20T00:00:00Z'),
      (4, 3, 4, 3, 'Decent mouse, nothing special.', '2024-03-05T00:00:00Z'),
      (5, 4, 5, 4, 'A must-read for JS developers.', '2024-03-20T00:00:00Z'),
      (6, 5, 4, 5, 'Super comfortable for long runs.', '2024-04-01T00:00:00Z'),
      (7, 6, 2, 2, 'Fabric quality is mediocre.', '2024-04-15T00:00:00Z')`;
  }

  const couponCount = await sql`SELECT COUNT(*) as cnt FROM mock_coupons`;
  if (Number(couponCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_coupons (id, code, discount_percent, min_order_amount, active, expires_at) VALUES
      (1, 'SAVE10', 10, 0, true, '2025-12-31T23:59:59Z'),
      (2, 'SUMMER25', 25, 50, true, '2025-08-31T23:59:59Z'),
      (3, 'FLASH50', 50, 100, true, '2025-03-01T23:59:59Z'),
      (4, 'VIP20', 20, 0, false, '2025-12-31T23:59:59Z')`;
  }
}

export async function ensureMockTables() {
  if (!mockInitPromise) {
    mockInitPromise = doMockInit();
  }
  await mockInitPromise;
}

export function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as number,
    name: row.name as string,
    email: row.email as string,
    role: row.role as User['role'],
    age: row.age as number,
    createdAt: row.created_at as string,
  };
}

export function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as number,
    name: row.name as string,
    price: Number(row.price),
    category: row.category as string,
    featured: row.featured as boolean,
    stock: row.stock as number,
    createdAt: row.created_at as string,
  };
}

export function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as number,
    userId: row.user_id as number,
    productId: row.product_id as number,
    quantity: row.quantity as number,
    status: row.status as Order['status'],
    total: Number(row.total),
    createdAt: row.created_at as string,
  };
}

export function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string,
    slug: row.slug as string,
    createdAt: row.created_at as string,
  };
}

export function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as number,
    productId: row.product_id as number,
    userId: row.user_id as number,
    rating: row.rating as number,
    comment: row.comment as string,
    createdAt: row.created_at as string,
  };
}

export function rowToCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: row.id as number,
    code: row.code as string,
    discountPercent: row.discount_percent as number,
    minOrderAmount: Number(row.min_order_amount),
    active: row.active as boolean,
    expiresAt: row.expires_at as string,
  };
}

export { sql };
