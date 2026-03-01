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
  const activeParam = searchParams.get('active');

  let coupons = [...db.coupons];

  if (activeParam !== null) {
    const activeVal = activeParam === 'true';
    coupons = coupons.filter(c => c.active === activeVal);
  }

  return NextResponse.json(coupons);
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

  const { code, discount_percent, min_order_amount, active, expires_at } = body as {
    code?: string;
    discount_percent?: number;
    min_order_amount?: number;
    active?: boolean;
    expires_at?: string;
  };

  if (!code || discount_percent === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: code, discount_percent' },
      { status: 400 }
    );
  }

  const newCoupon = {
    id: db.nextCouponId++,
    code: String(code),
    discountPercent: Number(discount_percent),
    minOrderAmount: typeof min_order_amount === 'number' ? min_order_amount : 0,
    active: typeof active === 'boolean' ? active : true,
    expiresAt: String(expires_at || ''),
  };

  db.coupons.push(newCoupon);

  return NextResponse.json(newCoupon, { status: 201 });
}
