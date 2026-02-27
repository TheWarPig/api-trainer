import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const userId = parseInt(params.id, 10);
  const user = db.users.find(u => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: `User with id ${userId} not found.` }, { status: 404 });
  }

  const orders = db.orders.filter(o => o.userId === userId);

  return NextResponse.json(orders);
}
