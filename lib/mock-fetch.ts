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

  // /api/products/:id/reviews — handled by handleReviews, so skip here
  if (url.pathname.match(/^\/api\/products\/\d+\/reviews$/)) {
    return null;
  }

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

function handleCategories(url: URL, method: string, init?: RequestInit): Response | null {
  // /api/categories/:id
  const idMatch = url.pathname.match(/^\/api\/categories\/(\d+)$/);
  if (idMatch) {
    const id = parseInt(idMatch[1], 10);

    if (method === 'GET') {
      return withData(data => {
        const category = data.categories.find(c => c.id === id);
        if (!category) return json({ error: `Category with id ${id} not found.` }, 404);
        return json(category);
      });
    }

    if (method === 'PUT') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      return mutate(data => {
        const index = data.categories.findIndex(c => c.id === id);
        if (index === -1) return json({ error: `Category with id ${id} not found.` }, 404);
        const updated = { ...data.categories[index], ...body, id };
        data.categories[index] = updated as typeof data.categories[0];
        return json(updated);
      });
    }

    if (method === 'DELETE') {
      return mutate(data => {
        const index = data.categories.findIndex(c => c.id === id);
        if (index === -1) return json({ error: `Category with id ${id} not found.` }, 404);
        data.categories.splice(index, 1);
        return json({ message: `Category ${id} deleted successfully.`, id });
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  // /api/categories
  if (url.pathname === '/api/categories') {
    if (method === 'GET') {
      const name = url.searchParams.get('name');
      return withData(data => {
        let categories = [...data.categories];
        if (name) categories = categories.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
        return json(categories);
      });
    }

    if (method === 'POST') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      const { name, description } = body as { name?: string; description?: string };
      if (!name) return json({ error: 'Missing required field: name' }, 400);
      return mutate(data => {
        const slug = String(name).toLowerCase().replace(/\s+/g, '-');
        const newCategory = {
          id: data.nextCategoryId++,
          name: String(name),
          description: String(description || ''),
          slug,
          createdAt: new Date().toISOString(),
        };
        data.categories.push(newCategory);
        return json(newCategory, 201);
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  return null;
}

function handleReviews(url: URL, method: string, init?: RequestInit): Response | null {
  // /api/products/:id/reviews
  const reviewsMatch = url.pathname.match(/^\/api\/products\/(\d+)\/reviews$/);
  if (!reviewsMatch) return null;

  const productId = parseInt(reviewsMatch[1], 10);

  if (method === 'GET') {
    const minRating = url.searchParams.get('min_rating');
    return withData(data => {
      let reviews = data.reviews.filter(r => r.productId === productId);
      if (minRating) {
        const minR = parseInt(minRating, 10);
        reviews = reviews.filter(r => r.rating >= minR);
      }
      return json(reviews);
    });
  }

  if (method === 'POST') {
    const headers = headersToRecord(init);
    if (!checkAuth(headers)) {
      return json({ error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' }, 401);
    }
    const body = parseBody(init);
    if (!body) return json({ error: 'Invalid JSON body.' }, 400);
    const { rating, comment, userId } = body as { rating?: number; comment?: string; userId?: number };
    if (rating === undefined || !comment) return json({ error: 'Missing required fields: rating, comment' }, 400);
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) return json({ error: 'Rating must be between 1 and 5.' }, 400);
    return mutate(data => {
      const product = data.products.find(p => p.id === productId);
      if (!product) return json({ error: `Product with id ${productId} not found.` }, 404);
      const newReview = {
        id: data.nextReviewId++,
        productId,
        userId: typeof userId === 'number' ? userId : 1,
        rating: ratingNum,
        comment: String(comment),
        createdAt: new Date().toISOString(),
      };
      data.reviews.push(newReview);
      return json(newReview, 201);
    });
  }

  return json({ error: 'Method not allowed' }, 405);
}

function handleCoupons(url: URL, method: string, init?: RequestInit): Response | null {
  const headers = headersToRecord(init);

  // /api/coupons/:id
  const idMatch = url.pathname.match(/^\/api\/coupons\/(\d+)$/);
  if (idMatch) {
    if (!checkAuth(headers)) {
      return json({ error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' }, 401);
    }
    const id = parseInt(idMatch[1], 10);

    if (method === 'GET') {
      return withData(data => {
        const coupon = data.coupons.find(c => c.id === id);
        if (!coupon) return json({ error: `Coupon with id ${id} not found.` }, 404);
        return json(coupon);
      });
    }

    if (method === 'PATCH') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      return mutate(data => {
        const index = data.coupons.findIndex(c => c.id === id);
        if (index === -1) return json({ error: `Coupon with id ${id} not found.` }, 404);
        const updated = { ...data.coupons[index], ...body, id };
        data.coupons[index] = updated as typeof data.coupons[0];
        return json(updated);
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  }

  // /api/coupons
  if (url.pathname === '/api/coupons') {
    if (!checkAuth(headers)) {
      return json({ error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' }, 401);
    }

    if (method === 'GET') {
      const activeParam = url.searchParams.get('active');
      return withData(data => {
        let coupons = [...data.coupons];
        if (activeParam !== null) {
          const activeVal = activeParam === 'true';
          coupons = coupons.filter(c => c.active === activeVal);
        }
        return json(coupons);
      });
    }

    if (method === 'POST') {
      const body = parseBody(init);
      if (!body) return json({ error: 'Invalid JSON body.' }, 400);
      const { code, discount_percent, min_order_amount, active, expires_at } = body as {
        code?: string;
        discount_percent?: number;
        min_order_amount?: number;
        active?: boolean;
        expires_at?: string;
      };
      if (!code || discount_percent === undefined) return json({ error: 'Missing required fields: code, discount_percent' }, 400);
      return mutate(data => {
        const newCoupon = {
          id: data.nextCouponId++,
          code: String(code),
          discountPercent: Number(discount_percent),
          minOrderAmount: typeof min_order_amount === 'number' ? min_order_amount : 0,
          active: typeof active === 'boolean' ? active : true,
          expiresAt: String(expires_at || ''),
        };
        data.coupons.push(newCoupon);
        return json(newCoupon, 201);
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
    categories: data.categories,
    reviews: data.reviews,
    coupons: data.coupons,
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
      categories: seed.categories,
      reviews: seed.reviews,
      coupons: seed.coupons,
      nextUserId: Math.max(0, ...seed.users.map((u: { id: number }) => u.id)) + 1,
      nextProductId: Math.max(0, ...seed.products.map((p: { id: number }) => p.id)) + 1,
      nextOrderId: Math.max(0, ...seed.orders.map((o: { id: number }) => o.id)) + 1,
      nextCategoryId: Math.max(0, ...seed.categories.map((c: { id: number }) => c.id)) + 1,
      nextReviewId: Math.max(0, ...seed.reviews.map((r: { id: number }) => r.id)) + 1,
      nextCouponId: Math.max(0, ...seed.coupons.map((c: { id: number }) => c.id)) + 1,
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
    handleCategories(url, method, init) ??
    handleReviews(url, method, init) ??
    handleCoupons(url, method, init) ??
    handleAdminData(url, method);

  if (result) return result;

  // Reset is async (fetches seed from server)
  const resetResult = await handleReset(url, method);
  if (resetResult) return resetResult;

  // Fallthrough to real fetch for non-mock routes (/api/levels, /api/admin/*, etc.)
  return fetch(input, init);
}
