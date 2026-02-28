import { getMockData, setMockData, type MockData } from './mock-storage';

const SECRET_TOKEN = 'Bearer secret-token-123';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function checkAuth(headers: Record<string, string>): boolean {
  const auth = headers['authorization'] || headers['Authorization'] || '';
  return auth === SECRET_TOKEN;
}

function parseBody(init?: RequestInit): Record<string, unknown> | null {
  if (!init?.body) return null;
  try {
    return JSON.parse(typeof init.body === 'string' ? init.body : String(init.body));
  } catch {
    return null;
  }
}

function headersToRecord(init?: RequestInit): Record<string, string> {
  const out: Record<string, string> = {};
  const h = init?.headers;
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((v, k) => { out[k] = v; });
  } else if (Array.isArray(h)) {
    for (const [k, v] of h) out[k] = v;
  } else {
    Object.assign(out, h);
  }
  return out;
}

function withData(fn: (data: MockData) => Response): Response {
  const data = getMockData();
  if (!data) return json({ error: 'Mock data not initialized.' }, 500);
  return fn(data);
}

function mutate(fn: (data: MockData) => Response): Response {
  const data = getMockData();
  if (!data) return json({ error: 'Mock data not initialized.' }, 500);
  const res = fn(data);
  setMockData(data);
  return res;
}

// ── Route handlers ──

function handleUsers(url: URL, method: string, init?: RequestInit): Response | null {
  // /api/users/:id/orders
  const ordersMatch = url.pathname.match(/^\/api\/users\/(\d+)\/orders$/);
  if (ordersMatch) {
    if (method !== 'GET') return json({ error: 'Method not allowed' }, 405);
    const userId = parseInt(ordersMatch[1], 10);
    return withData(data => {
      const user = data.users.find(u => u.id === userId);
      if (!user) return json({ error: `User with id ${userId} not found.` }, 404);
      return json(data.orders.filter(o => o.userId === userId));
    });
  }

  // /api/users/:id
  const idMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
  if (idMatch) {
    const id = parseInt(idMatch[1], 10);

    if (method === 'GET') {
      return withData(data => {
        const user = data.users.find(u => u.id === id);
        if (!user) return json({ error: `User with id ${id} not found.` }, 404);
        return json(user);
      });
    }

    if (method === 'PUT' || method === 'PATCH') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      return mutate(data => {
        const index = data.users.findIndex(u => u.id === id);
        if (index === -1) return json({ error: `User with id ${id} not found.` }, 404);
        const updated = { ...data.users[index], ...body, id };
        data.users[index] = updated as typeof data.users[0];
        return json(updated);
      });
    }

    if (method === 'DELETE') {
      return mutate(data => {
        const index = data.users.findIndex(u => u.id === id);
        if (index === -1) return json({ error: `User with id ${id} not found.` }, 404);
        data.users.splice(index, 1);
        return json({ message: `User ${id} deleted successfully.`, id });
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  // /api/users
  if (url.pathname === '/api/users') {
    if (method === 'GET') {
      const name = url.searchParams.get('name');
      const role = url.searchParams.get('role');
      return withData(data => {
        let users = [...data.users];
        if (name) users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
        if (role) users = users.filter(u => u.role === role);
        return json(users);
      });
    }

    if (method === 'POST') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      const { name, email, role, age } = body as { name?: string; email?: string; role?: string; age?: number };
      if (!name || !email) return json({ error: 'Missing required fields: name, email' }, 400);
      const validRoles = ['admin', 'user', 'moderator'];
      const userRole = validRoles.includes(role as string) ? role : 'user';
      return mutate(data => {
        const newUser = {
          id: data.nextUserId++,
          name: String(name),
          email: String(email),
          role: userRole as 'admin' | 'user' | 'moderator',
          age: typeof age === 'number' ? age : 0,
          createdAt: new Date().toISOString(),
        };
        data.users.push(newUser);
        return json(newUser, 201);
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  return null;
}

function handleProducts(url: URL, method: string, init?: RequestInit): Response | null {
  const headers = headersToRecord(init);

  // /api/products/:id
  const idMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);
  if (idMatch) {
    if (!checkAuth(headers)) {
      return json({ error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' }, 401);
    }
    const id = parseInt(idMatch[1], 10);

    if (method === 'GET') {
      return withData(data => {
        const product = data.products.find(p => p.id === id);
        if (!product) return json({ error: `Product with id ${id} not found.` }, 404);
        return json(product);
      });
    }

    if (method === 'PUT') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      return mutate(data => {
        const index = data.products.findIndex(p => p.id === id);
        if (index === -1) return json({ error: `Product with id ${id} not found.` }, 404);
        const updated = { ...data.products[index], ...body, id };
        data.products[index] = updated as typeof data.products[0];
        return json(updated);
      });
    }

    if (method === 'DELETE') {
      return mutate(data => {
        const index = data.products.findIndex(p => p.id === id);
        if (index === -1) return json({ error: `Product with id ${id} not found.` }, 404);
        data.products.splice(index, 1);
        return json({ message: `Product ${id} deleted successfully.`, id });
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  // /api/products
  if (url.pathname === '/api/products') {
    if (!checkAuth(headers)) {
      return json({ error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' }, 401);
    }

    if (method === 'GET') {
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      return withData(data => {
        let products = [...data.products];
        if (category) products = products.filter(p => p.category === category);
        if (featured) products = products.filter(p => String(p.featured) === featured);
        return json(products);
      });
    }

    if (method === 'POST') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      const { name, price, category, featured, stock } = body as {
        name?: string; price?: number; category?: string; featured?: boolean; stock?: number;
      };
      if (!name || price === undefined) return json({ error: 'Missing required fields: name, price' }, 400);
      return mutate(data => {
        const newProduct = {
          id: data.nextProductId++,
          name: String(name),
          price: Number(price),
          category: String(category || 'general'),
          featured: Boolean(featured),
          stock: typeof stock === 'number' ? stock : 0,
          createdAt: new Date().toISOString(),
        };
        data.products.push(newProduct);
        return json(newProduct, 201);
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  return null;
}

function handleAdminData(url: URL, method: string): Response | null {
  if (url.pathname !== '/api/admin/data' || method !== 'GET') return null;
  return withData(data => json({
    users: data.users,
    products: data.products,
    orders: data.orders,
  }));
}

async function handleReset(url: URL, method: string): Promise<Response | null> {
  if (url.pathname !== '/api/reset' && url.pathname !== '/api/reset/') return null;
  if (method !== 'POST') return null;

  try {
    const res = await fetch('/api/seed-data');
    const seed = await res.json();
    setMockData({
      users: seed.users,
      products: seed.products,
      orders: seed.orders,
      nextUserId: Math.max(0, ...seed.users.map((u: { id: number }) => u.id)) + 1,
      nextProductId: Math.max(0, ...seed.products.map((p: { id: number }) => p.id)) + 1,
      nextOrderId: Math.max(0, ...seed.orders.map((o: { id: number }) => o.id)) + 1,
    });
    return json({ message: 'Data reset to initial state.' });
  } catch {
    return json({ error: 'Failed to fetch seed data.' }, 500);
  }
}

// ── Main entry point ──

export async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(urlStr, window.location.origin);
  const method = (init?.method || 'GET').toUpperCase();

  // Try each mock handler
  const result =
    handleUsers(url, method, init) ??
    handleProducts(url, method, init) ??
    handleAdminData(url, method);

  if (result) return result;

  // Reset is async (fetches seed from server)
  const resetResult = await handleReset(url, method);
  if (resetResult) return resetResult;

  // Fallthrough to real fetch for non-mock routes (/api/levels, /api/admin/*, etc.)
  return fetch(input, init);
}
