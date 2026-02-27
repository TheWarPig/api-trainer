import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

const SECRET_TOKEN = 'Bearer secret-token-123';

function checkAuth(request: NextRequest) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  return auth === SECRET_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  let products = [...db.products];

  if (category) {
    products = products.filter(p => p.category === category);
  }
  if (featured) {
    products = products.filter(p => String(p.featured) === featured);
  }

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, price, category, featured, stock } = body as {
    name?: string;
    price?: number;
    category?: string;
    featured?: boolean;
    stock?: number;
  };

  if (!name || price === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: name, price' },
      { status: 400 }
    );
  }

  const newProduct = {
    id: db.nextProductId++,
    name: String(name),
    price: Number(price),
    category: String(category || 'general'),
    featured: Boolean(featured),
    stock: typeof stock === 'number' ? stock : 0,
    createdAt: new Date().toISOString(),
  };

  db.products.push(newProduct);

  return NextResponse.json(newProduct, { status: 201 });
}
