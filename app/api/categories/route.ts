import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  let categories = [...db.categories];

  if (name) {
    categories = categories.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
  }

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, description } = body as { name?: string; description?: string };

  if (!name) {
    return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
  }

  const slug = String(name).toLowerCase().replace(/\s+/g, '-');

  const newCategory = {
    id: db.nextCategoryId++,
    name: String(name),
    description: String(description || ''),
    slug,
    createdAt: new Date().toISOString(),
  };

  db.categories.push(newCategory);

  return NextResponse.json(newCategory, { status: 201 });
}
