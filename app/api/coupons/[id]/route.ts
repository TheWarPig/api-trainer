import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

const SECRET_TOKEN = 'Bearer secret-token-123';

function checkAuth(request: NextRequest) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  return auth === SECRET_TOKEN;
}

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  const coupon = db.coupons.find(c => c.id === id);

  if (!coupon) {
    return NextResponse.json({ error: `Coupon with id ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json(coupon);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!checkAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Include Authorization: Bearer secret-token-123 header.' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  const index = db.coupons.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Coupon with id ${id} not found.` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const updated = { ...db.coupons[index], ...body, id };
  db.coupons[index] = updated;

  return NextResponse.json(updated);
}
