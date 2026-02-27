import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_PASSWORD = 'idoido10';

function generateToken(): string {
  return crypto.createHash('sha256').update(ADMIN_PASSWORD + '-admin-session').digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    return NextResponse.json({ token: generateToken() });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
