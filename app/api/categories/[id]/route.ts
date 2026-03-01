import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const category = db.categories.find(c => c.id === id);

  if (!category) {
    return NextResponse.json({ error: `Category with id ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const index = db.categories.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Category with id ${id} not found.` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const updated = { ...db.categories[index], ...body, id };
  db.categories[index] = updated;

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const index = db.categories.findIndex(c => c.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Category with id ${id} not found.` }, { status: 404 });
  }

  db.categories.splice(index, 1);

  return NextResponse.json({ message: `Category ${id} deleted successfully.`, id });
}
