import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return NextResponse.json({ error: `User with id ${id} not found.` }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `User with id ${id} not found.` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const updated = { ...db.users[index], ...body, id };
  db.users[index] = updated;

  return NextResponse.json(updated);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `User with id ${id} not found.` }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const updated = { ...db.users[index], ...body, id };
  db.users[index] = updated;

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const index = db.users.findIndex(u => u.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `User with id ${id} not found.` }, { status: 404 });
  }

  db.users.splice(index, 1);

  return NextResponse.json({ message: `User ${id} deleted successfully.`, id });
}
