import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql, ensureProgressTable } from '@/lib/db';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureProgressTable();

  const rows = await sql`
    SELECT completed_levels FROM user_progress WHERE clerk_user_id = ${userId}
  `;

  const completedLevels = rows.length > 0 ? rows[0].completed_levels : [];

  return NextResponse.json({ completedLevels });
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const completedLevels: number[] = Array.isArray(body.completedLevels) ? body.completedLevels : [];

  await ensureProgressTable();

  await sql`
    INSERT INTO user_progress (clerk_user_id, completed_levels, updated_at)
    VALUES (${userId}, ${JSON.stringify(completedLevels)}::jsonb, now())
    ON CONFLICT (clerk_user_id)
    DO UPDATE SET completed_levels = ${JSON.stringify(completedLevels)}::jsonb, updated_at = now()
  `;

  return NextResponse.json({ completedLevels });
}
