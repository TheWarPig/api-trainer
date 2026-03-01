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
    hints: row.hints as string[],
    successMessage: row.success_message as string,
    successCriteria: row.success_criteria as string,
    validationRules: row.validation_rules as SerializableLevel['validationRules'],
    defaultMethod: row.default_method as string,
    defaultUrl: row.default_url as string,
    defaultHeaders: (row.default_headers ?? undefined) as SerializableLevel['defaultHeaders'],
    defaultBody: (row.default_body ?? undefined) as string | undefined,
    endpoints: row.endpoints as SerializableLevel['endpoints'],
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

import type { User, Product, Order } from './store';

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

  // Seed if empty
  const userCount = await sql`SELECT COUNT(*) as cnt FROM mock_users`;
  if (Number(userCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_users (id, name, email, role, age, created_at) VALUES
      (1, 'Alice Johnson', 'alice@example.com', 'admin', 28, '2024-01-15T10:00:00Z'),
      (2, 'Bob Smith', 'bob@example.com', 'user', 34, '2024-02-20T14:30:00Z'),
      (3, 'Carol Williams', 'carol@example.com', 'moderator', 25, '2024-03-10T09:15:00Z')`;
  }

  const productCount = await sql`SELECT COUNT(*) as cnt FROM mock_products`;
  if (Number(productCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_products (id, name, price, category, featured, stock, created_at) VALUES
      (1, 'Wireless Headphones', 99.99, 'electronics', true, 50, '2024-01-01T00:00:00Z'),
      (2, 'Mechanical Keyboard', 149.99, 'electronics', false, 30, '2024-01-02T00:00:00Z'),
      (3, 'Ergonomic Mouse', 59.99, 'electronics', true, 100, '2024-01-03T00:00:00Z')`;
  }

  const orderCount = await sql`SELECT COUNT(*) as cnt FROM mock_orders`;
  if (Number(orderCount[0].cnt) === 0) {
    await sql`INSERT INTO mock_orders (id, user_id, product_id, quantity, status, total, created_at) VALUES
      (1, 1, 1, 1, 'delivered', 99.99, '2024-02-01T00:00:00Z'),
      (2, 1, 3, 2, 'shipped', 119.98, '2024-02-15T00:00:00Z'),
      (3, 2, 2, 1, 'processing', 149.99, '2024-03-01T00:00:00Z')`;
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

// ── User progress table ──

let progressInitPromise: Promise<void> | null = null;

async function doProgressInit() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_progress (
      clerk_user_id   TEXT PRIMARY KEY,
      completed_levels JSONB NOT NULL DEFAULT '[]',
      updated_at      TIMESTAMP NOT NULL DEFAULT now()
    )
  `;
}

export async function ensureProgressTable() {
  if (!progressInitPromise) {
    progressInitPromise = doProgressInit();
  }
  await progressInitPromise;
}

export { sql };
