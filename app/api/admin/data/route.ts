import { NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { authorized } = await checkAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    users:    db.users,
    products: db.products,
    orders:   db.orders,
  });
}
