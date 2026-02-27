import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const role = searchParams.get('role');

  let users = [...db.users];

  if (name) {
    users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (role) {
    users = users.filter(u => u.role === role);
  }

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, email, role, age } = body as {
    name?: string;
    email?: string;
    role?: string;
    age?: number;
  };

  if (!name || !email) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email' },
      { status: 400 }
    );
  }

  const validRoles = ['admin', 'user', 'moderator'];
  const userRole = validRoles.includes(role as string) ? role : 'user';

  const newUser = {
    id: db.nextUserId++,
    name: String(name),
    email: String(email),
    role: userRole as 'admin' | 'user' | 'moderator',
    age: typeof age === 'number' ? age : 0,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  return NextResponse.json(newUser, { status: 201 });
}
