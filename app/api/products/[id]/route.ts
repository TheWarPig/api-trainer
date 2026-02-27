import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

type Params = { params: { id: string } };

const SECRET_TOKEN = 'Bearer secret-token-123';

function checkAuth(request: NextRequest) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  return auth === SECRET_TOKEN;
}

export async function GET(request: NextRequest, { params }: Params) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  const product = db.products.find(p => p.id === id);

  if (!product) {
    return NextResponse.json({ error: `Product with id ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Product with id ${id} not found.` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const updated = { ...db.products[index], ...body, id };
  db.products[index] = updated;

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Product with id ${id} not found.` }, { status: 404 });
  }

  db.products.splice(index, 1);

  return NextResponse.json({ message: `Product ${id} deleted successfully.`, id });
}
