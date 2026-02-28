import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/admin-auth';
import { updateSortOrders } from '@/lib/level-storage';

export async function PUT(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!Array.isArray(body.order)) {
      return NextResponse.json({ error: 'order must be an array of level IDs' }, { status: 400 });
    }

    await updateSortOrders(body.order as number[]);

    return NextResponse.json({ message: 'Order updated', order: body.order });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
